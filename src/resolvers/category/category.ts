import { merge } from 'lodash';

import middleware from ".././middleware";
import configDB from "../../database/config";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { CategoryEntity } from "../../database/entity/category.entity";
import { getConnection } from 'typeorm';

//Destructurins
const { isAuthenticated } = middleware;

export = {
  Query: {
    getCategories: merge(async (_: any, { page, limit }: { page: number, limit: number }) => {
      try {
        let cursor: number =  (page * limit) - limit;
        if (!cursor) cursor = 0;
        //Create category repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);
        let category: CategoryEntity[] = await categoryRepository.createQueryBuilder("category").skip(cursor).take(limit).getMany();

        return category;

      } catch (err) {
        throw new Error(err);
      }

    }),

    getOneCategory: merge(async (_: any, { id }: { id: number }) => {
      try {
        //Create category repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);

        let category = await categoryRepository.findOne({ id });

        return category;
      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),
  },
  Mutation: {
    createCategory: merge(async (_: any, { input }: { input: any }) => {
      try {
        console.log(input)
        //Create category repository
        let categoryRepository = getConnection().getRepository(CategoryEntity);

        //Create category
        let category = new CategoryEntity();
        category.name = input.name;

        //Update category
        const Category: CategoryEntity = await categoryRepository.save(category);

        return Category;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    updateCategory: merge(async (_: any, { id, input }: { id: number, input: any }) => {
      try {
        const db = await configDB;
        //Create category repository
        let categoryRepository = db.getRepository(CategoryEntity);

        //Search category
        const categoryToUpdate: CategoryEntity = await categoryRepository.findOne({ id });
        categoryToUpdate.name = input.name || categoryToUpdate.name;

        //Update category
        const Category = await categoryRepository.save(categoryToUpdate);

        
        return Category;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),

    deleteCategory: merge(async (_: any, { id }: { id: number }) => {
      try {
        const db = await configDB;
        //Create user repository
        let categoryRepository = db.getRepository(CategoryEntity);

        //Search user
        const categoryToRemove: CategoryEntity = await categoryRepository.findOne({ id });
        const categoryRemoved: CategoryEntity = categoryToRemove;

        //Delete task
        await categoryRepository.remove(categoryToRemove);
        categoryRemoved.id = id;

        return categoryRemoved;

      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated)
  },
  Category: {
    recipe: async (parent:any, __:any ,{ loaders }: { loaders: any }) => {
      try {
        let recipeId = await getConnection().createQueryBuilder(RecipeEntity, "recipe").innerJoin("recipe.category", "category")
          .where(`category.id = ${parent.id}`).getMany();
        
        const recipe = await loaders.user.load(recipeId[0].id);
        return recipe;
      } catch(err) {
        throw new Error(err);
      }
    }
  }
}
