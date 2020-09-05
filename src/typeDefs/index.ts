import { gql } from 'apollo-server-express';

import userTypeDefs from './user';
import recipeTypeDefs from './recipe';
import categoryTypeDefs from './category';
import { DocumentNode } from 'graphql';

const typeDefs: DocumentNode = gql`
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
`!
export = [typeDefs, userTypeDefs, recipeTypeDefs, categoryTypeDefs ]