import express from 'express';
import cors from 'cors';

import {apolloServer, app} from "../app";
import { Server } from "http";

// body-parser middleware
app.use(express.json());
//cors
app.use('*', cors());
const PORT: number = + process.env.PORT!;
const port: number = PORT || 3000;

apolloServer.applyMiddleware({ app, path: '/graphql' })

const httpServer: Server = app.listen(port, err => {
  if (err) {
    return err;
  }
  return console.log(`server is listening on ${port}`), console.log(`GraphQL endpoint: ${apolloServer.graphqlPath}`)
});

apolloServer.installSubscriptionHandlers(httpServer);

