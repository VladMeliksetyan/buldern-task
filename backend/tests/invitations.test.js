import {
  ACCEPT_INVITATION,
  CREATE_PROJECT,
  INVITE_USER,
  REJECT_INVITATION,
  graphql,
  registerUser,
} from './helpers.js';

describe('Invitations', () => {
  it('accepts an invitation and grants project access', async () => {
    const owner = await registerUser({ email: 'owner@example.com', name: 'Owner' });
    const member = await registerUser({ email: 'member@example.com', name: 'Member' });

    const projectResult = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Office Renovation', location: 'Trondheim' } },
      owner.token,
    );
    const projectId = projectResult.data.createProject.id;

    const inviteResult = await graphql(
      INVITE_USER,
      { input: { projectId, email: 'member@example.com' } },
      owner.token,
    );

    const invitationId = inviteResult.data.inviteUser.id;

    const acceptResult = await graphql(ACCEPT_INVITATION, { id: invitationId }, member.token);
    expect(acceptResult.data.acceptInvitation.status).toBe('ACCEPTED');

    const projectsResult = await graphql(
      `
        query Projects {
          projects { id name }
        }
      `,
      {},
      member.token,
    );

    expect(projectsResult.data.projects).toHaveLength(1);
    expect(projectsResult.data.projects[0].id).toBe(projectId);
  });

  it('rejects an invitation without granting access', async () => {
    const owner = await registerUser({ email: 'owner2@example.com' });
    const invitee = await registerUser({ email: 'invitee@example.com' });

    const projectResult = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Warehouse', location: 'Stavanger' } },
      owner.token,
    );
    const projectId = projectResult.data.createProject.id;

    const inviteResult = await graphql(
      INVITE_USER,
      { input: { projectId, email: 'invitee@example.com' } },
      owner.token,
    );

    const rejectResult = await graphql(
      REJECT_INVITATION,
      { id: inviteResult.data.inviteUser.id },
      invitee.token,
    );

    expect(rejectResult.data.rejectInvitation.status).toBe('REJECTED');

    const projectsResult = await graphql(
      `
        query Projects {
          projects { id }
        }
      `,
      {},
      invitee.token,
    );

    expect(projectsResult.data.projects).toHaveLength(0);
  });

  it('prevents duplicate active invitations for the same project and email', async () => {
    const owner = await registerUser({ email: 'owner3@example.com' });

    const projectResult = await graphql(
      CREATE_PROJECT,
      { input: { name: 'Retail Store', location: 'Tromso' } },
      owner.token,
    );
    const projectId = projectResult.data.createProject.id;

    const firstInvite = await graphql(
      INVITE_USER,
      { input: { projectId, email: 'future-member@example.com' } },
      owner.token,
    );
    expect(firstInvite.errors).toBeUndefined();

    const duplicateInvite = await graphql(
      INVITE_USER,
      { input: { projectId, email: 'future-member@example.com' } },
      owner.token,
    );

    expect(duplicateInvite.errors[0].message).toBe(
      'An active invitation already exists for this email',
    );
    expect(duplicateInvite.errors[0].extensions.code).toBe('CONFLICT');
  });
});
