import { merge } from 'lodash';
import { composeResolvers } from '@graphql-tools/resolvers-composition'

import middleware from ".././middleware";
import helpers from "../../helper/helpers"
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { UserEntity } from "../../database/entity/user.entity";
import { getConnection, Repository } from 'typeorm';
import { User_RecipeEntity } from '../../database/entity/user_recipe.entity';
import { CategoryEntity } from '../../database/entity/category.entity';
import { IResolvers } from 'apollo-server-express';
//Destructurins
const { isAuthenticated } = middleware;
const { getResult } = helpers;

const resolvers: IResolvers = {
  Query: {
    getRecipes: composeResolvers(async (_: any, { page, limit }: { page: number, limit: number }) => {
      try {
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let recipe: RecipeEntity[] = await recipeRepository.createQueryBuilder("recipe").innerJoinAndSelect("recipe.category", "category")
          .skip(cursor).take(limit).getMany();

        return recipe;

      } catch (err) {
        throw new Error(err);
      }

    }),

    getMyRecipes: async (_: any, { page, limit }: { page: number, limit: number }, { loggedInUserId }: { loggedInUserId: string }) => {
      try {
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;

        //Create recipes
        let recipes: RecipeEntity[] = await getConnection().createQueryBuilder(RecipeEntity, "recipe")
          .innerJoin(User_RecipeEntity, "user_recipe", "recipe.id = user_recipe.id_recipe")
          .innerJoin(UserEntity, "user", "user_recipe.id_user = user.id").where(`user.id = ${loggedInUserId}`).skip(cursor).take(limit).getMany();

        return recipes;

      } catch (err) {
        throw new Error(err)
      }

    },

    getOneRecipe: merge(async (_: any, { id }: { id: number }) => {
      try {
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);

        return await recipeRepository.findOne({ id });
      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),
  },
  Mutation: {
    createRecipe: merge(async (_: any, { input }: { input: any }) => {
      try {
        //Create repositories
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);
        let user_recipeRepository: Repository<User_RecipeEntity> = getConnection().getRepository(User_RecipeEntity);
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        //Search tables
        const user: UserEntity[] = await userRepository.find({ where: { id: input.userId }, take: 1 });
        const category: CategoryEntity[] = await categoryRepository.find({ where: { id: input.categoryId }, take: 1 });

        //Create recipe
        let recipe: RecipeEntity = new RecipeEntity();
        recipe.name = input.name;
        recipe.description = input.description;
        recipe.ingredients = input.ingredients;
        recipe.category = getResult(category);
        recipe.user = getResult(user);

        //Save recipe
        let Recipe: RecipeEntity = await recipeRepository.save(recipe);

        //Create user connection
        let user_recipe: User_RecipeEntity = new User_RecipeEntity();
        user_recipe.recipe = Recipe;
        user_recipe.user = getResult(user);

        //Save user connection
        await user_recipeRepository.save(user_recipe);

        return Recipe;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    updateRecipe: merge(async (_: any, { id, input }: { id: number, input: any }) => {
      try {
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);

        const category: CategoryEntity[] = await getConnection().getRepository(CategoryEntity).find({ where: { id: input.category }, take: 1 });

        //Search user
        const recipes: RecipeEntity[] = await recipeRepository.find({ where: { id }, take: 1 });
        const recipeToUpdate: RecipeEntity = getResult(recipes);

        recipeToUpdate.name = input.name;
        recipeToUpdate.description = input.description;
        recipeToUpdate.ingredients = input.ingredients;
        recipeToUpdate.category = getResult(category);

        //Save task
        let Recipe: RecipeEntity = await recipeRepository.save(recipeToUpdate);


        return Recipe;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    deleteRecipe: merge(async (_: any, { id }: { id: number }) => {
      try {
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let user_recipeRepository: Repository<User_RecipeEntity> = getConnection().getRepository(User_RecipeEntity);

        //Search user
        const recipeToRemove: RecipeEntity[] = await recipeRepository.find({ where: { id }, take: 1 });
        const relationToRemove: User_RecipeEntity[] = await user_recipeRepository.find({ where: { id_recipe: id }, take: 1 });
        const recipeRemoved = getResult(recipeToRemove);

        //Delete task
        await user_recipeRepository.remove(getResult(relationToRemove));
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
        let category = await getConnection().createQueryBuilder(CategoryEntity, "category").innerJoin("category.recipe", "recipe")
          .where(`recipe.id = ${parent.id}`).getOne();

        return category;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}
export = resolvers
