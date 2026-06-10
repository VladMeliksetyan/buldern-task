import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth.js';
import { AppError, ForbiddenError } from '../../lib/errors.js';
import {
  getProjectOrThrow,
  hasProjectAccess,
  requireProjectAccess,
  requireProjectOwner,
} from '../../services/authorization.js';

export const projectResolvers = {
  Query: {
    async projects(_parent, _args, { user }) {
      requireAuth(user);
      return prisma.project.findMany({
        where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
        orderBy: { createdAt: 'desc' },
      });
    },

    async project(_parent, { id }, { user }) {
      requireAuth(user);
      const project = await getProjectOrThrow(id);
      if (!hasProjectAccess(project, user.id)) {
        throw new ForbiddenError('You do not have access to this project');
      }
      return project;
    },
  },

  Mutation: {
    async createProject(_parent, { input }, { user }) {
      requireAuth(user);
      const name = input.name?.trim();
      const location = input.location?.trim();
      if (!name || !location) throw new AppError('Project name and location are required');
      return prisma.project.create({ data: { name, location, ownerId: user.id } });
    },

    async updateProject(_parent, { id, input }, { user }) {
      requireAuth(user);
      await requireProjectOwner(id, user.id);

      const data = {};
      if (input.name !== undefined) {
        const name = input.name.trim();
        if (!name) throw new AppError('Project name cannot be empty');
        data.name = name;
      }
      if (input.location !== undefined) {
        const location = input.location.trim();
        if (!location) throw new AppError('Project location cannot be empty');
        data.location = location;
      }
      if (!Object.keys(data).length) throw new AppError('No fields to update');

      return prisma.project.update({ where: { id }, data });
    },

    async deleteProject(_parent, { id }, { user }) {
      requireAuth(user);
      await requireProjectOwner(id, user.id);
      await prisma.project.delete({ where: { id } });
      return true;
    },
  },

  Project: {
    owner: (project) => prisma.user.findUnique({ where: { id: project.ownerId } }),
    members: (project) =>
      prisma.projectMember.findMany({ where: { projectId: project.id }, include: { user: true } }),
    expenses: async (project, _args, { user }) => {
      requireAuth(user);
      await requireProjectAccess(project.id, user.id);
      return prisma.expense.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' } });
    },
    incomes: async (project, _args, { user }) => {
      requireAuth(user);
      await requireProjectAccess(project.id, user.id);
      return prisma.income.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' } });
    },
  },

  ProjectMember: {
    user: (member) => member.user ?? prisma.user.findUnique({ where: { id: member.userId } }),
  },
};
