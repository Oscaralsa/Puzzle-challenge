import { getConnection } from "typeorm";
import { CategoryEntity } from "../database/entity/category.entity";

export const batchCategory = async (categoryIds: Array<number>) => {

  let categorys: CategoryEntity[] = await getConnection().getRepository(CategoryEntity).createQueryBuilder("category")
  .where(`category.id IN (:...ids)`, {ids : categoryIds}).getMany();

  return categoryIds.map(categoryId => categorys.find(category => category.id === categoryId));
}