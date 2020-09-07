import { skip } from 'graphql-resolvers';

export const isAuthenticated = (context: any) => {
  try {
    if (!context.email) {
      throw new Error("Access denied.")
    }
    return skip;
  } catch (err) {
    throw new Error(err)
  }
  
}

