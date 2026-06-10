import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

export async function getProjectOrThrow(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return project;
}

export function isProjectOwner(project, userId) {
  return project.ownerId === userId;
}

export function isProjectMember(project, userId) {
  return project.members.some((member) => member.userId === userId);
}

export function hasProjectAccess(project, userId) {
  return isProjectOwner(project, userId) || isProjectMember(project, userId);
}

export async function requireProjectAccess(projectId, userId) {
  const project = await getProjectOrThrow(projectId);

  if (!hasProjectAccess(project, userId)) {
    throw new ForbiddenError('You do not have access to this project');
  }

  return project;
}

export async function requireProjectOwner(projectId, userId) {
  const project = await getProjectOrThrow(projectId);

  if (!isProjectOwner(project, userId)) {
    throw new ForbiddenError('Only the project owner can perform this action');
  }

  return project;
}

export async function requireExpenseMutationAccess(expenseId, userId) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { project: { include: { members: true } } },
  });

  if (!expense) {
    throw new NotFoundError('Expense not found');
  }

  const canMutate =
    expense.createdById === userId ||
    isProjectOwner(expense.project, userId);

  if (!canMutate) {
    throw new ForbiddenError('You cannot modify this expense');
  }

  return expense;
}

export async function requireIncomeMutationAccess(incomeId, userId) {
  const income = await prisma.income.findUnique({
    where: { id: incomeId },
    include: { project: { include: { members: true } } },
  });

  if (!income) {
    throw new NotFoundError('Income not found');
  }

  const canMutate =
    income.createdById === userId ||
    isProjectOwner(income.project, userId);

  if (!canMutate) {
    throw new ForbiddenError('You cannot modify this income');
  }

  return income;
}
