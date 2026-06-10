import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers/index.js';
import { extractBearerToken, getUserFromToken } from './lib/auth.js';
import { formatGraphQLError } from './lib/errors.js';

export async function createApp() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: formatGraphQLError,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = extractBearerToken(req.headers.authorization);
        const user = await getUserFromToken(token);

        return { user };
      },
    }),
  );

  return app;
}
