import { gql } from 'apollo-server-express';

export = gql`
  extend type Query {  
    getUsers: [User!]
    getOneUser(id: ID!): User
    getMyUser: User
  }

  extend type Mutation {
    signup(input: signupInput): User
    login(input: loginInput): Token
  }

  type Token {
    accessToken: String!
    refreshToken: String!
  }

  input loginInput {
    email: String!
    password: String!
  }

  input signupInput {
    name: String!
    email: String!
    password: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    recipes: [Recipe!]
  }

  extend type Subscription {
    userCreated: User
  }
`;