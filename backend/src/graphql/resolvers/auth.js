import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, requireAuth, signToken, verifyPassword } from '../../lib/auth.js';
import { AppError } from '../../lib/errors.js';
import { sendVerificationEmail } from '../../lib/email.js';

function validateEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new AppError('Invalid email address');
  }
  return normalized;
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters');
  }
}

export const authResolvers = {
  Query: {
    me: (_parent, _args, { user }) => user,
  },

  Mutation: {
    async register(_parent, { input }) {
      const email = validateEmail(input.email);
      validatePassword(input.password);

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new AppError('Email is already registered', 'CONFLICT', 409);

      const passwordHash = await hashPassword(input.password);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const created = await prisma.user.create({
        data: { email, passwordHash, name: input.name?.trim() || null, emailVerified: false, verificationToken },
      });

      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (err) {
        console.error('Failed to send verification email:', err.message);
      }

      return { token: '', user: created };
    },

    async login(_parent, { input }) {
      const email = validateEmail(input.email);
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new AppError('Invalid email or password', 'UNAUTHENTICATED', 401);
      }

      if (!user.emailVerified) {
        throw new AppError(
          'Please verify your email before logging in. Check your inbox for a verification link.',
          'UNAUTHENTICATED',
          401,
        );
      }

      return { token: signToken(user), user };
    },

    async verifyEmail(_parent, { token }) {
      if (!token) throw new AppError('Verification token is required', 'BAD_USER_INPUT', 400);

      const user = await prisma.user.findUnique({ where: { verificationToken: token } });
      if (!user) throw new AppError('Invalid or expired verification token', 'BAD_USER_INPUT', 400);

      const verified = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, verificationToken: null },
      });

      return { token: signToken(verified), user: verified };
    },
  },
};

export { requireAuth };
