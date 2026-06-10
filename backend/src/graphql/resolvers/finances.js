import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth.js';
import { AppError } from '../../lib/errors.js';
import { requireProjectAccess, requireExpenseMutationAccess, requireIncomeMutationAccess } from '../../services/authorization.js';
import { buildBudgetReport } from '../../services/budgetReport.js';

function validateName(name) {
  const trimmed = name?.trim();
  if (!trimmed) throw new AppError('Name is required');
  return trimmed;
}

function validateAmount(amount) {
  const value = Number(amount);
  if (!amount || Number.isNaN(value) || value <= 0) throw new AppError('Amount must be a positive number');
  return value;
}

export const financeResolvers = {
  Query: {
    async expenses(_parent, { projectId }, { user }) {
      requireAuth(user);
      await requireProjectAccess(projectId, user.id);
      return prisma.expense.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    },

    async budgetReport(_parent, { projectId }, { user }) {
      requireAuth(user);
      await requireProjectAccess(projectId, user.id);
      return buildBudgetReport(projectId);
    },
  },

  Mutation: {
    async createExpense(_parent, { input }, { user }) {
      requireAuth(user);
      await requireProjectAccess(input.projectId, user.id);
      return prisma.expense.create({
        data: { projectId: input.projectId, name: validateName(input.name), amount: validateAmount(input.amount), createdById: user.id },
      });
    },

    async updateExpense(_parent, { id, input }, { user }) {
      requireAuth(user);
      await requireExpenseMutationAccess(id, user.id);
      const data = {};
      if (input.name !== undefined) data.name = validateName(input.name);
      if (input.amount !== undefined) data.amount = validateAmount(input.amount);
      if (!Object.keys(data).length) throw new AppError('No fields to update');
      return prisma.expense.update({ where: { id }, data });
    },

    async deleteExpense(_parent, { id }, { user }) {
      requireAuth(user);
      await requireExpenseMutationAccess(id, user.id);
      await prisma.expense.delete({ where: { id } });
      return true;
    },

    async createIncome(_parent, { input }, { user }) {
      requireAuth(user);
      await requireProjectAccess(input.projectId, user.id);
      return prisma.income.create({
        data: { projectId: input.projectId, name: validateName(input.name), amount: validateAmount(input.amount), createdById: user.id },
      });
    },

    async updateIncome(_parent, { id, input }, { user }) {
      requireAuth(user);
      await requireIncomeMutationAccess(id, user.id);
      const data = {};
      if (input.name !== undefined) data.name = validateName(input.name);
      if (input.amount !== undefined) data.amount = validateAmount(input.amount);
      if (!Object.keys(data).length) throw new AppError('No fields to update');
      return prisma.income.update({ where: { id }, data });
    },

    async deleteIncome(_parent, { id }, { user }) {
      requireAuth(user);
      await requireIncomeMutationAccess(id, user.id);
      await prisma.income.delete({ where: { id } });
      return true;
    },
  },

  Expense: {
    amount: (expense) => Number(expense.amount),
    project: (expense) => prisma.project.findUnique({ where: { id: expense.projectId } }),
    createdBy: (expense) => prisma.user.findUnique({ where: { id: expense.createdById } }),
  },

  Income: {
    amount: (income) => Number(income.amount),
    project: (income) => prisma.project.findUnique({ where: { id: income.projectId } }),
    createdBy: (income) => prisma.user.findUnique({ where: { id: income.createdById } }),
  },
};
