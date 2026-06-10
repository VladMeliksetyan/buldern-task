import {
  CREATE_PROJECT,
  graphql,
  registerUser,
  loginUser,
} from './helpers.js';

describe('Authentication', () => {
  it('registers a new user', async () => {
    const auth = await registerUser({ email: 'alice@example.com' });

    expect(auth.token).toBeTruthy();
    expect(auth.user.email).toBe('alice@example.com');
  });

  it('logs in with valid credentials', async () => {
    await registerUser({ email: 'carol@example.com', password: 'password123' });
    const auth = await loginUser({ email: 'carol@example.com', password: 'password123' });

    expect(auth.token).toBeTruthy();
    expect(auth.user.email).toBe('carol@example.com');
  });

  it('blocks protected operations without a token', async () => {
    const result = await graphql(CREATE_PROJECT, {
      input: { name: 'Secret Project', location: 'Oslo' },
    });

    expect(result.errors[0].message).toBe('Authentication required');
    expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('allows protected operations with a valid token', async () => {
    const auth = await registerUser({ email: 'erin@example.com' });

    const result = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Harbor Bridge', location: 'Bergen' } },
      auth.token,
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.createProject.name).toBe('Harbor Bridge');
  });
});
