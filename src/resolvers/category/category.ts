import { merge } from 'lodash';

import middleware from ".././middleware";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { CategoryEntity } from "../../database/entity/category.entity";
import { getConnection, Repository } from 'typeorm';
import helpers from "../../helper/helpers"

//Destructurins
const { isAuthenticated } = middleware;
const { getResult } = helpers;

export = {
  Query: {
    getCategories: merge(async (_: any, { page, limit }: { page: number, limit: number }) => {
      try {
        let cursor: number =  (page * limit) - limit;
        if (!cursor) cursor = 0;
        //Create category repository
        let categoryRepository: Repository<CategoryEntity> = getConnection().getRepository(CategoryEntity);
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

        return await categoryRepository.findOne({ id });
      } catch (err) {
        throw new Error(err)
      }

    }, isAuthenticated),
  },
  Mutation: {
    createCategory: merge(async (_: any, { input }: { input: any }) => {
      try {
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

    }, isAuthenticated),

    updateCategory: merge(async (_: any, { id, input }: { id: number, input: any }) => {
      try {
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

    }, isAuthenticated),

    deleteCategory: merge(async (_: any, { id }: { id: number }) => {
      try {
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
