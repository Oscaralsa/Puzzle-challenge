import { IResolvers } from 'apollo-server-express';
import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';

import { isAuthenticated } from "../../middleware";
import { getResult } from "../../helper/helpers/helpers";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { UserEntity } from "../../database/entity/user.entity";
import PubSub from "../../subscription";
import { User_RecipeEntity } from '../../database/entity/user_recipe.entity';
import { CategoryEntity } from '../../database/entity/category.entity';
import { Context, getOneRecipeInput, getRecipesInput } from '../../types/interface';
import { recipeEvents } from "../../subscription/events/recipe";

const resolvers: IResolvers = {
  Query: {
    getRecipes: async (_: any, input: getRecipesInput, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Destructuring
        let { page, limit, name, ingredients, idCategory, nameCategory } = input;

        //Define cursor
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;
        
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let recipe: SelectQueryBuilder<RecipeEntity> = recipeRepository.createQueryBuilder("recipe").innerJoinAndSelect("recipe.category", "category")
          .skip(cursor).take(limit);

        if(name) recipe = recipe.andWhere(`recipe.name = '${name}'`);
        if(ingredients) recipe = recipe.andWhere(`recipe.ingredients = '${ingredients}'`);
        if(idCategory) recipe = recipe.andWhere(`category.id = ${idCategory}`);
        if(nameCategory) recipe = recipe.andWhere(`category.name = '${nameCategory}'`);

        return recipe.getMany();

      } catch (err) {
        throw new Error(err);
      }

    },

    getMyRecipes: async (_: any, { page, limit }: { page: number, limit: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);
        //Destructuring
        const { loggedInUserId } = context;

        //Define cursor
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;

        //Return recipes
        let recipes: RecipeEntity[] = await getConnection().createQueryBuilder(RecipeEntity, "recipe")
          .innerJoin(User_RecipeEntity, "user_recipe", "recipe.id = user_recipe.id_recipe")
          .innerJoin(UserEntity, "user", "user_recipe.id_user = user.id").where(`user.id = ${loggedInUserId}`).skip(cursor).take(limit).getMany();

        return recipes;

      } catch (err) {
        throw new Error(err)
      }

    },

    getOneRecipe: async (_: any, input: getOneRecipeInput, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Destructuring
        let { id, name, ingredients, idCategory, nameCategory } = input;

        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);

        let recipe: SelectQueryBuilder<RecipeEntity> = recipeRepository.createQueryBuilder("recipe").innerJoin("recipe.category", "category")
        .select("recipe");
        
        if(id) recipe = recipe.andWhere(`recipe.id = ${id}`);
        if(name) recipe = recipe.andWhere(`recipe.name = '${name}'`);
        if(ingredients) recipe = recipe.andWhere(`recipe.ingredients = '${ingredients}'`);
        if(idCategory) recipe = recipe.andWhere(`category.id = ${idCategory}`);
        if(nameCategory) recipe = recipe.andWhere(`category.name = '${nameCategory}'`);

        return await recipe.getOne();

      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Mutation: {
    createRecipe: async (_: any, { input }: { input: any }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

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

    },

    updateRecipe: async (_: any, { id, input }: { id: number, input: any }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

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

    },

    deleteRecipe: async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let user_recipeRepository: Repository<User_RecipeEntity> = getConnection().getRepository(User_RecipeEntity);

        //Search user
        const recipeToRemove: RecipeEntity[] = await recipeRepository.find({ where: { id }, take: 1 });
        const relationToRemove: User_RecipeEntity[] = await user_recipeRepository.find({ where: { id_recipe: id }, take: 1 });
        const recipeRemoved: RecipeEntity = getResult(recipeToRemove);

        //Delete task
        await user_recipeRepository.remove(getResult(relationToRemove));
        await recipeRepository.remove(recipeToRemove);
        recipeRemoved.id = id;

        return recipeRemoved;

      } catch (err) {
        throw new Error(err)
      }

    }
  },
  Subscription: {
    recipeCreated: {
      subscribe: () => PubSub.asyncIterator(recipeEvents.RECIPE_CREATED)
    },
    recipeUpdated: {
      subscribe: () => PubSub.asyncIterator(recipeEvents.RECIPE_UPDATED)
    },
    recipeDeleted: {
      subscribe: () => PubSub.asyncIterator(recipeEvents.RECIPE_DELETED)
    }
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
        let categoryIds: CategoryEntity[] = await getConnection().createQueryBuilder(CategoryEntity, "category").innerJoin(RecipeEntity, "recipe", "category.id = recipe.id_category")
          .select("category").where(`recipe.id = ${parent.id}`).getMany();

        const category = await loaders.category.load(categoryIds[0].id);
        return category;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}

export = resolvers
