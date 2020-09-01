import { merge } from 'lodash';

import middleware from ".././middleware";
import configDB from "../../database/config";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { UserEntity } from "../../database/entity/user.entity";
import { getConnection } from 'typeorm';
import { User_RecipeEntity } from '../../database/entity/user_recipe.entity';
import { CategoryEntity } from '../../database/entity/category.entity';

//Destructurins
const { isAuthenticated } = middleware;

export = {
  Query: {
    getRecipes: merge(async (_: any, { page, limit }: { page: number, limit: number }) => {
      try {
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;
        //Create user repository
        let recipeRepository = getConnection().getRepository(RecipeEntity);
        let recipe: RecipeEntity[] = await recipeRepository.createQueryBuilder("recipe").innerJoinAndSelect("recipe.category", "category")
          .skip(cursor).take(limit).getMany();

        return recipe;

      } catch (err) {
        throw new Error(err);
      }

    }, isAuthenticated),

    getMyRecipes: merge(async (_: any, { page, limit }: { page: number, limit: number }, { loggedInUserId }: { loggedInUserId: string }) => {
      try {
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;
        //Create user repository
        let recipeRepository = getConnection().getRepository(RecipeEntity);

        let recipes: RecipeEntity[] = await recipeRepository.createQueryBuilder("recipe").innerJoin("user_recipe.recipe", "user_recipe")
          .innerJoin("user_recipe.user", "users").where(`users.id = ${loggedInUserId}`).skip(cursor).take(limit).getMany();

        return recipes;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    getOneRecipe: merge(async (_: any, { id }: { id: number }) => {
      try {
        //Create user repository
        let taskRepository = getConnection().getRepository(RecipeEntity);

        let task = await taskRepository.findOne({ id });

        return task;
      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),
  },
  Mutation: {
    createRecipe: merge(async (_: any, { input }: { input: any }) => {
      try {
        const db = await configDB;
        //Create repositories
        let recipeRepository = getConnection().getRepository(RecipeEntity);
        let categoryRepository = db.getRepository(CategoryEntity);
        let user_recipeRepository = db.getRepository(User_RecipeEntity);
        let userRepository = db.getRepository(UserEntity);

        //Search tables
        const user: UserEntity = await userRepository.findOne({ id: input.userId });
        const category: CategoryEntity = await categoryRepository.findOne({ id: input.categoryId });

        //Create recipe
        let recipe = new RecipeEntity();
        recipe.name = input.name;
        recipe.description = input.description;
        recipe.ingredients = input.ingredients;
        recipe.category = category;
        recipe.user = user;

        //Save recipe
        let Recipe = await recipeRepository.save(recipe);

        //Create user connection
        let user_recipe = new User_RecipeEntity();
        user_recipe.recipe = Recipe;
        user_recipe.user = user;

        //Save user connection
        await user_recipeRepository.save(user_recipe);

        return Recipe

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    updateRecipe: merge(async (_: any, { id, input }: { id: number, input: any }) => {
      try {
        const db = await configDB;
        //Create user repository
        let recipeRepository = db.getRepository(RecipeEntity);

        const category = await getConnection().getRepository(CategoryEntity).findOne(input.category);

        //Search user
        const recipeToUpdate: RecipeEntity = await recipeRepository.findOne({ id });
        recipeToUpdate.name = input.name || recipeToUpdate.name;
        recipeToUpdate.description = input.description || recipeToUpdate.description;
        recipeToUpdate.ingredients = input.ingredients || recipeToUpdate.ingredients;
        recipeToUpdate.category = category || recipeToUpdate.category;

        //Save task
        let Recipe = await recipeRepository.save(recipeToUpdate);


        return Recipe;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    deleteRecipe: merge(async (_: any, { id }: { id: number }) => {
      try {
        const db = await configDB;
        //Create user repository
        let recipeRepository = db.getRepository(RecipeEntity);

        //Search user
        const recipeToRemove: RecipeEntity = await recipeRepository.findOne({ id });
        const recipeRemoved: RecipeEntity = recipeToRemove;

        //Delete task
        await recipeRepository.remove(recipeToRemove);
        recipeRemoved.id = id;

        return recipeRemoved;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated)
  },
  Recipe: {

    user: async (parent: any, __: any, { loaders }: { loaders: any }) => {
      try {
        if (parent.user) {
          return [parent.user];
        }
        else {
          let user: UserEntity[] = await getConnection().createQueryBuilder(UserEntity, "user").innerJoin(User_RecipeEntity, "user_recipe", "user.id = user_recipe.id_user")
            .innerJoin(RecipeEntity, "recipe", "user_recipe.id_recipe = recipe.id").select("user").where(`recipe.id = ${parent.id}`).getMany();

          return user;
        }

      } catch (err) {
        throw new Error(err);
      }
    },
    category: async (parent: any, __: any, { loaders }: { loaders: any }) => {
      try {
        console.log(parent)
        let category = await getConnection().createQueryBuilder(CategoryEntity, "category").innerJoin("category.recipe","recipe")
          .where(`recipe.id = ${parent.id}`).getOne();

        return category;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}
