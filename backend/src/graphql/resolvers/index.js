import { DateTimeScalar } from '../scalars.js';
import { authResolvers } from './auth.js';
import { projectResolvers } from './projects.js';
import { invitationResolvers } from './invitations.js';
import { financeResolvers } from './finances.js';

export const resolvers = [
  { DateTime: DateTimeScalar },
  authResolvers,
  projectResolvers,
  invitationResolvers,
  financeResolvers,
];
