import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth.js';
import { AppError, ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { requireProjectOwner } from '../../services/authorization.js';
import { sendInvitationEmail } from '../../lib/email.js';

export const invitationResolvers = {
  Query: {
    async myInvitations(_parent, _args, { user }) {
      requireAuth(user);
      return prisma.invitation.findMany({
        where: {
          status: 'PENDING',
          OR: [{ inviteeId: user.id }, { email: user.email, inviteeId: null }],
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    async inviteUser(_parent, { input }, { user }) {
      requireAuth(user);
      const project = await requireProjectOwner(input.projectId, user.id);
      const email = input.email.trim().toLowerCase();

      if (!email) throw new AppError('Invitee email is required');
      if (email === user.email) throw new AppError('You cannot invite yourself');

      const invitee = await prisma.user.findUnique({ where: { email } });

      if (invitee) {
        if (invitee.id === project.ownerId) throw new AppError('Project owner already has access');
        const existingMember = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId: project.id, userId: invitee.id } },
        });
        if (existingMember) throw new AppError('User is already a project member', 'CONFLICT', 409);
      }

      const pendingInvite = await prisma.invitation.findFirst({
        where: { projectId: project.id, email, status: 'PENDING' },
      });
      if (pendingInvite) throw new AppError('An active invitation already exists for this email', 'CONFLICT', 409);

      let invitation;
      try {
        invitation = await prisma.invitation.create({
          data: { projectId: project.id, email, inviterId: user.id, inviteeId: invitee?.id ?? null },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new AppError('An active invitation already exists for this email', 'CONFLICT', 409);
        }
        throw err;
      }

      try {
        await sendInvitationEmail(email, user.name || user.email, project.name);
      } catch (err) {
        console.error('Failed to send invitation email:', err.message);
      }

      return invitation;
    },

    async acceptInvitation(_parent, { id }, { user }) {
      requireAuth(user);
      return prisma.$transaction(async (tx) => {
        const invitation = await tx.invitation.findUnique({ where: { id } });
        if (!invitation) throw new NotFoundError('Invitation not found');
        if (invitation.status !== 'PENDING') throw new AppError('Invitation is no longer pending', 'CONFLICT', 409);
        if (invitation.email !== user.email) throw new ForbiddenError('This invitation is not addressed to you');

        const updated = await tx.invitation.update({
          where: { id },
          data: { status: 'ACCEPTED', inviteeId: user.id },
        });

        await tx.projectMember.upsert({
          where: { projectId_userId: { projectId: invitation.projectId, userId: user.id } },
          update: {},
          create: { projectId: invitation.projectId, userId: user.id },
        });

        return updated;
      });
    },

    async rejectInvitation(_parent, { id }, { user }) {
      requireAuth(user);
      const invitation = await prisma.invitation.findUnique({ where: { id } });
      if (!invitation) throw new NotFoundError('Invitation not found');
      if (invitation.status !== 'PENDING') throw new AppError('Invitation is no longer pending', 'CONFLICT', 409);
      if (invitation.email !== user.email) throw new ForbiddenError('This invitation is not addressed to you');

      return prisma.invitation.update({
        where: { id },
        data: { status: 'REJECTED', inviteeId: user.id },
      });
    },
  },

  Invitation: {
    project: (invitation) => prisma.project.findUnique({ where: { id: invitation.projectId } }),
    inviter: (invitation) => prisma.user.findUnique({ where: { id: invitation.inviterId } }),
  },
};
