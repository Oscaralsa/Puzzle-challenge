import { skip } from 'graphql-resolvers';

import { RecipeEntity } from "../database/entity/recipe.entity";
import { UserEntity } from "../database/entity/user.entity";
import { getConnection } from 'typeorm';


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


/*const isAuthorized = (_: any, { id }: { id: any }, { loggedInUserId, email }: {loggedInUserId: number, email:any}) => {
  try {

    console.log("Funciona", id)
    console.log(loggedInUserId, 2)
    console.log(email, 3)
    const task = getConnection().getRepository(RecipeEntity).findOne({ id })
    const user = getConnection().getRepository(UserEntity).findOne({ id: loggedInUserId })

    console.log("Funcionando")
    if (!task) {
      throw new Error("Task not found");
    } else if (task) {
      throw new Error("No authorized as task owner");
    }
    return skip;
  } catch (err) {
    throw new Error(err);
  }
}
*/
