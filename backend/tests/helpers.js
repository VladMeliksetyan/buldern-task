import request from 'supertest';
import { createApp } from '../src/server.js';

let appPromise;

export async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export async function graphql(query, variables = {}, token = null) {
  const app = await getApp();
  const req = request(app).post('/graphql').send({ query, variables });

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req;
  return response.body;
}

export const REGISTER = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id email name }
    }
  }
`;

export const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email }
    }
  }
`;

export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      location
    }
  }
`;

export const INVITE_USER = `
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      id
      email
      status
    }
  }
`;

export const ACCEPT_INVITATION = `
  mutation AcceptInvitation($id: ID!) {
    acceptInvitation(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_INVITATION = `
  mutation RejectInvitation($id: ID!) {
    rejectInvitation(id: $id) {
      id
      status
    }
  }
`;

export async function registerUser({ email, password = 'password123', name = 'Test User' }) {
  const result = await graphql(REGISTER, {
    input: { email, password, name },
  });

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.register;
}

export async function loginUser({ email, password = 'password123' }) {
  const result = await graphql(LOGIN, { input: { email, password } });

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.login;
}
