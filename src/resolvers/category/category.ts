import { getConnection, Repository } from 'typeorm';

import { isAuthenticated } from "../../middleware";
import PubSub from "../../subscription";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { CategoryEntity } from "../../database/entity/category.entity";
import { getResult } from "../../helper/helpers/helpers";
import { Context } from '../../types/interface';
import { categoryEvents } from "../../subscription/events/category";

export = {
  Query: {
    getCategories: async (_: any, { page, limit }: { page: number, limit: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Define cursor
        let cursor: number = (page * limit) - limit;
        if (!cursor) cursor = 0;

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);
        let category: CategoryEntity[] = await categoryRepository.createQueryBuilder("category").skip(cursor).take(limit).getMany();

        return category;

      } catch (err) {
        throw new Error(err);
      }

    },

    getOneCategory: async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create category repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);

        return await categoryRepository.findOne({ id });
      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Mutation: {
    createCategory: async (_: any, { input }: { input: any }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        //Create category
        let category: CategoryEntity = new CategoryEntity();
        category.name = input.name;

        //Update category
        const Category: CategoryEntity = await categoryRepository.save(category);

        return Category;

      } catch (err) {
        throw new Error(err)
      }

    },

    updateCategory: async (_: any, { id, input }: { id: number, input: any }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);

        //Search category
        const category: CategoryEntity[] = await categoryRepository.find({ where: { id }, take: 1 });
        const categoryToUpdate: CategoryEntity = getResult(category)
        categoryToUpdate.name = input.name;

        //Update category
        const Category: CategoryEntity = await categoryRepository.save(categoryToUpdate);


        return Category;

      } catch (err) {
        throw new Error(err)
      }

    },

    deleteCategory: async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create user repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);

        //Search user
        const category: CategoryEntity[] = await categoryRepository.find({ where: { id }, take: 1 });
        const categoryToRemove: CategoryEntity = getResult(category);

        //Delete task
        await categoryRepository.remove(categoryToRemove);
        categoryToRemove.id = id;

        return categoryToRemove;

      } catch (err) {
        throw new Error(err)
      }

    },
  },
  Subscription: {
    categoryCreated: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_CREATED)
    },
    categoryUpdated: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_UPDATED)
    },
    categoryDeleted: {
      subscribe: () => PubSub.asyncIterator(categoryEvents.CATEGORY_DELETED)
    }
  },
  Category: {
    recipe: async (parent: any, __: any, { loaders }: { loaders: any }) => {
      try {
        let recipe = await getConnection().createQueryBuilder(RecipeEntity, "recipe").innerJoin("recipe.category", "category")
          .where(`category.id = ${parent.id}`).getMany();

          return recipe;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}
