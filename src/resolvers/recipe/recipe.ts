import { IResolvers } from 'apollo-server-express';
import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';

import { isAuthenticated } from "../../middleware";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { UserEntity } from "../../database/entity/user.entity";
import PubSub from "../../subscription";
import { User_RecipeEntity } from '../../database/entity/user_recipe.entity';
import { CategoryEntity } from '../../database/entity/category.entity';
import { Context, createRecipeInput, getOneRecipeInput, getRecipesInput, updateRecipeInput } from '../../types/interface';
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

        if (name) recipe = recipe.andWhere(`recipe.name = '${name}'`);
        if (ingredients) recipe = recipe.andWhere(`recipe.ingredients = '${ingredients}'`);
        if (idCategory) recipe = recipe.andWhere(`category.id = ${idCategory}`);
        if (nameCategory) recipe = recipe.andWhere(`category.name = '${nameCategory}'`);

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

        if (id) recipe = recipe.andWhere(`recipe.id = ${id}`);
        if (name) recipe = recipe.andWhere(`recipe.name = '${name}'`);
        if (ingredients) recipe = recipe.andWhere(`recipe.ingredients = '${ingredients}'`);
        if (idCategory) recipe = recipe.andWhere(`category.id = ${idCategory}`);
        if (nameCategory) recipe = recipe.andWhere(`category.name = '${nameCategory}'`);

        return await recipe.getOne();

      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Mutation: {
    createRecipe: async (_: any, { input }: { input: createRecipeInput }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Check inputs
        if(!input.name) throw new Error(`Name is required.`)
        if(!input.ingredients) throw new Error(`Ingredients is required.`)
        if(!input.description) throw new Error(`Description is required.`)

        //Create repositories
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);
        let user_recipeRepository: Repository<User_RecipeEntity> = getConnection().getRepository(User_RecipeEntity);
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        //Search tables
        const user: UserEntity | undefined = await userRepository.findOne({ where: { id: context.loggedInUserId } });
        const category: CategoryEntity | undefined = await categoryRepository.findOne({ where: { id: input.categoryId } });

        //Create recipe
        let recipe: RecipeEntity = new RecipeEntity();
        recipe.name = input.name;
        recipe.description = input.description;
        recipe.ingredients = input.ingredients;
        if (user) {
          recipe.user = user
        } else {
          throw new Error("User not found");

        } if (category) {
          recipe.category = category;
        } else {
          throw new Error("Category not found");

        }

        //Save recipe
        let Recipe: RecipeEntity = await recipeRepository.save(recipe);

        //Create user connection
        let user_recipe: User_RecipeEntity = new User_RecipeEntity();
        user_recipe.recipe = Recipe;
        user ? user_recipe.user = user : new Error("User not found");

        //Save user connection
        await user_recipeRepository.save(user_recipe);

        return Recipe;

      } catch (err) {
        throw new Error(err)
      }

    },

    updateRecipe: async (_: any, { id, input }: { id: number, input: updateRecipeInput }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        const category: CategoryEntity | undefined = await categoryRepository.findOne({ where: { id: input.category } });

        //Search user
        const recipeToUpdate: RecipeEntity | undefined = await recipeRepository.findOne({ where: { id } });

        if (recipeToUpdate) {
          recipeToUpdate.name = input.name;
          recipeToUpdate.description = input.description;
          recipeToUpdate.ingredients = input.ingredients;
          if (category) recipeToUpdate.category = category
          else if (!category && input.category) throw new Error("Category not found.");

        }

        return recipeToUpdate ? await recipeRepository.save(recipeToUpdate) : new Error("Recipe not found.");

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
        const recipeToRemove: RecipeEntity | undefined = await recipeRepository.findOne({ where: { id } });
        const relationToRemove: User_RecipeEntity | undefined = await user_recipeRepository.findOne({ where: { id_recipe: id } });

        if (relationToRemove && recipeToRemove) {
          //Delete task
          await user_recipeRepository.remove(relationToRemove);
          await recipeRepository.remove(recipeToRemove);
          recipeToRemove.id = id;
        } else {
          throw new Error("Recipe not found");
        }

        return recipeToRemove;

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
