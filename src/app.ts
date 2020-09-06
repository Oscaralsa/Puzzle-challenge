import express from 'express';
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

dotenv.config();

connectionDB;

export const app = express();


export const apolloServer = new ApolloServer({
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
          category: new Dataloader((keys: any) => loaders.batchCategory(keys))
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
