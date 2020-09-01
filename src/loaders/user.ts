import { UserEntity } from "../database/entity/user.entity";
import { getConnection } from "typeorm";

export const batchUser = async (userIds: Array<any>) => {

  let users: UserEntity[] = await getConnection().getRepository(UserEntity).createQueryBuilder("user")
  .where(`user.id IN (:...ids)`, {ids : userIds}).getMany();

  return userIds.map(userId => users.find(user => user.id === userId));
}