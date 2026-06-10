import {
  BUDGET_REPORT,
  CREATE_PROJECT,
  graphql,
  registerUser,
} from './helpers.js';

describe('Budget report', () => {
  it('aggregates records with the same normalized name', async () => {
    const owner = await registerUser({ email: 'budget-owner@example.com' });

    const projectResult = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Apartment Build', location: 'Oslo' } },
      owner.token,
    );
    const projectId = projectResult.data.createProject.id;

    await graphql(
      `
        mutation CreateExpense($input: CreateExpenseInput!) {
          createExpense(input: $input) { id }
        }
      `,
      { input: { projectId, name: ' Cement ', amount: 100 } },
      owner.token,
    );

    await graphql(
      `
        mutation CreateExpense($input: CreateExpenseInput!) {
          createExpense(input: $input) { id }
        }
      `,
      { input: { projectId, name: 'cement', amount: 50 } },
      owner.token,
    );

    await graphql(
      `
        mutation CreateIncome($input: CreateIncomeInput!) {
          createIncome(input: $input) { id }
        }
      `,
      { input: { projectId, name: 'Client Payment', amount: 300 } },
      owner.token,
    );

    await graphql(
      `
        mutation CreateIncome($input: CreateIncomeInput!) {
          createIncome(input: $input) { id }
        }
      `,
      { input: { projectId, name: ' client payment ', amount: 200 } },
      owner.token,
    );

    const reportResult = await graphql(BUDGET_REPORT, { projectId }, owner.token);
    const report = reportResult.data.budgetReport;

    expect(report.items).toHaveLength(2);

    const cement = report.items.find((item) => item.name.toLowerCase() === 'cement');
    expect(cement.totalExpenses).toBe(150);
    expect(cement.totalIncomes).toBe(0);
    expect(cement.difference).toBe(-150);

    const payment = report.items.find((item) =>
      item.name.toLowerCase().includes('client payment'),
    );
    expect(payment.totalExpenses).toBe(0);
    expect(payment.totalIncomes).toBe(500);
    expect(payment.difference).toBe(500);

    expect(report.summary.totalExpenses).toBe(150);
    expect(report.summary.totalIncomes).toBe(500);
    expect(report.summary.difference).toBe(350);
  });

  it('includes names that exist only on one side', async () => {
    const owner = await registerUser({ email: 'budget-owner2@example.com' });

    const projectResult = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Cabin', location: 'Lillehammer' } },
      owner.token,
    );
    const projectId = projectResult.data.createProject.id;

    await graphql(
      `
        mutation CreateExpense($input: CreateExpenseInput!) {
          createExpense(input: $input) { id }
        }
      `,
      { input: { projectId, name: 'Timber', amount: 80 } },
      owner.token,
    );

    await graphql(
      `
        mutation CreateIncome($input: CreateIncomeInput!) {
          createIncome(input: $input) { id }
        }
      `,
      { input: { projectId, name: 'Grant', amount: 120 } },
      owner.token,
    );

    const reportResult = await graphql(BUDGET_REPORT, { projectId }, owner.token);
    const report = reportResult.data.budgetReport;

    expect(report.items).toHaveLength(2);

    const timber = report.items.find((item) => item.name === 'Timber');
    expect(timber.totalExpenses).toBe(80);
    expect(timber.totalIncomes).toBe(0);

    const grant = report.items.find((item) => item.name === 'Grant');
    expect(grant.totalExpenses).toBe(0);
    expect(grant.totalIncomes).toBe(120);
  });
});
