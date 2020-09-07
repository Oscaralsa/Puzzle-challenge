import { gql } from 'apollo-server-express';

export = gql`
  extend type Query {  
    getRecipes(page: Int, limit: Int): [Recipe!]
    getMyRecipes(page: Int, limit: Int): [Recipe!]
    getOneRecipe(id: ID!): Recipe
  }

  input createRecipeInput {
    name: String!
    description: String!
    ingredients: String!
    userId: ID!
    categoryId: ID!
  }

  extend type Mutation {
    createRecipe(input: createRecipeInput!): Recipe
    updateRecipe(id: ID!, input: updateRecipeInput!): Recipe
    deleteRecipe(id: ID!): Recipe
  }

  input updateRecipeInput {
    name: String
    description: String
    ingredients: String
    category: ID
  }

  type Recipe {
    id: ID!
    name: String!
    description: String!
    ingredients: String!
    category: Category!
    user: [User!]
  }

  extend type Subscription {
    recipeCreated: Recipe
    recipeUpdated: Recipe
    recipeDeleted: Recipe
  }
`;