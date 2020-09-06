import { UserEntity } from "../database/entity/user.entity";
import { CategoryEntity } from "../database/entity/category.entity";

interface Loaders {
  user: any;
  category: any;
}

export interface Context {
  email: string;
  loggedInUserId: number;
  loaders: Loaders
}