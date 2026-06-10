import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id email name }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email name }
    }
  }
`;

export const ME = gql`
  query Me {
    me { id email name }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      token
      user { id email name }
    }
  }
`;

export const PROJECTS = gql`
  query Projects {
    projects {
      id
      name
      location
      owner { id email name }
      members { id user { email name } }
    }
  }
`;

export const PROJECT = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      location
      owner { id email name }
      members { id user { email name } joinedAt }
      expenses {
        id name amount
        createdBy { id email }
        createdAt
      }
      incomes {
        id name amount
        createdBy { id email }
        createdAt
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id name location
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id name location
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const MY_INVITATIONS = gql`
  query MyInvitations {
    myInvitations {
      id email status
      project { id name location }
      inviter { email name }
    }
  }
`;

export const INVITE_USER = gql`
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      id email status
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($id: ID!) {
    acceptInvitation(id: $id) { id status }
  }
`;

export const REJECT_INVITATION = gql`
  mutation RejectInvitation($id: ID!) {
    rejectInvitation(id: $id) { id status }
  }
`;

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) { id name amount }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) { id name amount createdBy { id email } }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export const CREATE_INCOME = gql`
  mutation CreateIncome($input: CreateIncomeInput!) {
    createIncome(input: $input) { id name amount }
  }
`;

export const UPDATE_INCOME = gql`
  mutation UpdateIncome($id: ID!, $input: UpdateIncomeInput!) {
    updateIncome(id: $id, input: $input) { id name amount createdBy { id email } }
  }
`;

export const DELETE_INCOME = gql`
  mutation DeleteIncome($id: ID!) {
    deleteIncome(id: $id)
  }
`;

export const BUDGET_REPORT = gql`
  query BudgetReport($projectId: ID!) {
    budgetReport(projectId: $projectId) {
      items {
        name
        totalExpenses
        totalIncomes
        difference
      }
      summary {
        totalExpenses
        totalIncomes
        difference
      }
    }
  }
`;
