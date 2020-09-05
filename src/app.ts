import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import Dataloader from 'dataloader';

import connectionDB from "./database/config";
import resolvers from "./resolvers/";
import typeDefs from "./typeDefs";
import verifyUser from "./helper/context/index";
import loaders from "./loaders/";

import "reflect-metadata";
import { GraphQLFormattedError } from 'graphql';
import { Server } from 'http';

dotenv.config();

connectionDB;

const app = express();
// body-parser middleware
app.use(express.json());
//cors
app.use('*', cors());

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: any }) => {
    try {
      const contextObj: any = {};
      if (req.headers.authorization) {
        await verifyUser(req);

        contextObj.email = req.email;
        contextObj.loggedInUserId = req.loggedInUserId;
        contextObj.loaders = {
          user: new Dataloader((keys: any) => loaders.batchUser(keys))
        };
      }

      return contextObj;

    } catch (err) {
      throw new Error(err)
    }
  },
  formatError: (err): GraphQLFormattedError<Record<string, any>> => {
    return {
      message: err.message
    };
  }
})

apolloServer.applyMiddleware({ app, path: '/graphql' })

const port: number = 3000;
app.use('/', (req, res) => {
  res.send('Welcome!');
});
const httpServer: Server = app.listen(port, err => {
  if (err) {
    return err;
  }
  return console.log(`server is listening on ${port}`), console.log(`GraphQL endpoint: ${apolloServer.graphqlPath}`)
});

apolloServer.installSubscriptionHandlers(httpServer);