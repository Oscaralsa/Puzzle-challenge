import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";

import { RecipeEntity } from "./recipe.entity";
import { UserEntity } from "./user.entity";

@Entity({ name: "user_recipe" })
export class User_RecipeEntity {

  @PrimaryColumn()
  id_user!: number;

  @PrimaryColumn()
  id_recipe!: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id)
  @JoinColumn({ name: "id_user" })
  user!: UserEntity;

  @ManyToOne(() => RecipeEntity, (recipe: RecipeEntity) => recipe.id)
  @JoinColumn({ name: "id_recipe" })
  recipe!: RecipeEntity;

}

