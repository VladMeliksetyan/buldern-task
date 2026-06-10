import { prisma } from '../lib/prisma.js';

export function normalizeName(name) {
  return name.trim().toLowerCase();
}

export async function buildBudgetReport(projectId) {
  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({
      where: { projectId },
      select: { name: true, amount: true },
    }),
    prisma.income.findMany({
      where: { projectId },
      select: { name: true, amount: true },
    }),
  ]);

  const rows = new Map();

  for (const expense of expenses) {
    const key = normalizeName(expense.name);
    const current = rows.get(key) ?? {
      name: expense.name.trim(),
      normalizedName: key,
      totalExpenses: 0,
      totalIncomes: 0,
    };
    current.totalExpenses += Number(expense.amount);
    rows.set(key, current);
  }

  for (const income of incomes) {
    const key = normalizeName(income.name);
    const current = rows.get(key) ?? {
      name: income.name.trim(),
      normalizedName: key,
      totalExpenses: 0,
      totalIncomes: 0,
    };
    current.totalIncomes += Number(income.amount);
    if (!current.name) {
      current.name = income.name.trim();
    }
    rows.set(key, current);
  }

  const items = Array.from(rows.values())
    .map((row) => ({
      name: row.name,
      totalExpenses: roundMoney(row.totalExpenses),
      totalIncomes: roundMoney(row.totalIncomes),
      difference: roundMoney(row.totalIncomes - row.totalExpenses),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const summary = items.reduce(
    (acc, item) => {
      acc.totalExpenses += item.totalExpenses;
      acc.totalIncomes += item.totalIncomes;
      acc.difference += item.difference;
      return acc;
    },
    { totalExpenses: 0, totalIncomes: 0, difference: 0 },
  );

  return {
    projectId,
    items,
    summary: {
      totalExpenses: roundMoney(summary.totalExpenses),
      totalIncomes: roundMoney(summary.totalIncomes),
      difference: roundMoney(summary.difference),
    },
  };
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}
