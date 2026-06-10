import { createApp } from './server.js';

const port = Number(process.env.PORT || 4000);

const app = await createApp();

const server = app.listen(port, () => {
  console.log(`GraphQL server ready at http://localhost:${port}/graphql`);
});

