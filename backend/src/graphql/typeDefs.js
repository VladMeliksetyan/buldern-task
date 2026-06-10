export const typeDefs = `#graphql
  scalar DateTime

  enum InvitationStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type User {
    id: ID!
    email: String!
    name: String
    emailVerified: Boolean!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Project {
    id: ID!
    name: String!
    location: String!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [ProjectMember!]!
    expenses: [Expense!]!
    incomes: [Income!]!
  }

  type ProjectMember {
    id: ID!
    user: User!
    joinedAt: DateTime!
  }

  type Invitation {
    id: ID!
    email: String!
    status: InvitationStatus!
    project: Project!
    inviter: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Expense {
    id: ID!
    name: String!
    amount: Float!
    project: Project!
    createdBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Income {
    id: ID!
    name: String!
    amount: Float!
    project: Project!
    createdBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BudgetReportItem {
    name: String!
    totalExpenses: Float!
    totalIncomes: Float!
    difference: Float!
  }

  type BudgetReportSummary {
    totalExpenses: Float!
    totalIncomes: Float!
    difference: Float!
  }

  type BudgetReport {
    projectId: ID!
    items: [BudgetReportItem!]!
    summary: BudgetReportSummary!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateProjectInput {
    name: String!
    location: String!
  }

  input UpdateProjectInput {
    name: String
    location: String
  }

  input InviteUserInput {
    projectId: ID!
    email: String!
  }

  input CreateExpenseInput {
    projectId: ID!
    name: String!
    amount: Float!
  }

  input UpdateExpenseInput {
    name: String
    amount: Float
  }

  input CreateIncomeInput {
    projectId: ID!
    name: String!
    amount: Float!
  }

  input UpdateIncomeInput {
    name: String
    amount: Float
  }

  type Query {
    me: User
    projects: [Project!]!
    project(id: ID!): Project
    myInvitations: [Invitation!]!
    expenses(projectId: ID!): [Expense!]!
    budgetReport(projectId: ID!): BudgetReport!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    verifyEmail(token: String!): AuthPayload!
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    inviteUser(input: InviteUserInput!): Invitation!
    acceptInvitation(id: ID!): Invitation!
    rejectInvitation(id: ID!): Invitation!
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!
    createIncome(input: CreateIncomeInput!): Income!
    updateIncome(id: ID!, input: UpdateIncomeInput!): Income!
    deleteIncome(id: ID!): Boolean!
  }
`;
