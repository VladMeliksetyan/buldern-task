#!/usr/bin/env node
/**
 * End-to-end manual test script against a running GraphQL server.
 * Usage: npm run example:run
 */
import '../src/loadEnv.js';

const BASE_URL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql';

async function gql(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();
  if (body.errors?.length) {
    const message = body.errors.map((e) => e.message).join('; ');
    throw new Error(message);
  }
  return body.data;
}

function logStep(title, payload) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

async function main() {
  const suffix = Date.now();

  const ownerAuth = await gql(
    `
      mutation Register($input: RegisterInput!) {
        register(input: $input) { token user { id email } }
      }
    `,
    {
      input: {
        email: `owner-${suffix}@example.com`,
        password: 'password123',
        name: 'Demo Owner',
      },
    },
  );
  logStep('Owner registered', ownerAuth.register);
  const ownerToken = ownerAuth.register.token;

  const memberAuth = await gql(
    `
      mutation Register($input: RegisterInput!) {
        register(input: $input) { token user { id email } }
      }
    `,
    {
      input: {
        email: `member-${suffix}@example.com`,
        password: 'password123',
        name: 'Demo Member',
      },
    },
  );
  logStep('Member registered', memberAuth.register);
  const memberToken = memberAuth.register.token;

  const project = await gql(
    `
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) { id name location }
      }
    `,
    { input: { name: 'Harbor Expansion', location: 'Bergen' } },
    ownerToken,
  );
  logStep('Project created', project.createProject);
  const projectId = project.createProject.id;

  const invitation = await gql(
    `
      mutation InviteUser($input: InviteUserInput!) {
        inviteUser(input: $input) { id email status }
      }
    `,
    {
      input: {
        projectId,
        email: memberAuth.register.user.email,
      },
    },
    ownerToken,
  );
  logStep('Invitation sent', invitation.inviteUser);

  const accepted = await gql(
    `
      mutation AcceptInvitation($id: ID!) {
        acceptInvitation(id: $id) { id status }
      }
    `,
    { id: invitation.inviteUser.id },
    memberToken,
  );
  logStep('Invitation accepted', accepted.acceptInvitation);

  await gql(
    `
      mutation CreateExpense($input: CreateExpenseInput!) {
        createExpense(input: $input) { id name amount }
      }
    `,
    { input: { projectId, name: 'Labor', amount: 500 } },
    memberToken,
  );

  await gql(
    `
      mutation CreateExpense($input: CreateExpenseInput!) {
        createExpense(input: $input) { id name amount }
      }
    `,
    { input: { projectId, name: ' labor ', amount: 200 } },
    ownerToken,
  );

  await gql(
    `
      mutation CreateIncome($input: CreateIncomeInput!) {
        createIncome(input: $input) { id name amount }
      }
    `,
    { input: { projectId, name: 'Investor Funding', amount: 2000 } },
    ownerToken,
  );

  const report = await gql(
    `
      query BudgetReport($projectId: ID!) {
        budgetReport(projectId: $projectId) {
          items { name totalExpenses totalIncomes difference }
          summary { totalExpenses totalIncomes difference }
        }
      }
    `,
    { projectId },
    ownerToken,
  );
  logStep('Budget report', report.budgetReport);

  const projects = await gql(
    `
      query Projects {
        projects { id name location }
      }
    `,
    {},
    memberToken,
  );
  logStep('Member project list', projects.projects);

  console.log('\nExample flow completed successfully.');
}

main().catch((error) => {
  console.error('\nExample flow failed:', error.message);
  process.exit(1);
});
