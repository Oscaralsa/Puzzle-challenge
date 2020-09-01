import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";

import { CategoryEntity } from "./category.entity";
import { User_RecipeEntity } from "./user_recipe.entity";
import { UserEntity } from "./user.entity";

@Entity({ name: "recipe"})
export class RecipeEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "name", length: 100, nullable: false })
  name!: string;

  @Column({ name: "description", length: 100, nullable: false })
  description!: string;

  @Column({ name: "ingredients", length: 1000, nullable: false })
  ingredients!: string;

  @ManyToOne(() => CategoryEntity, (category: CategoryEntity) => category.recipe)
  @JoinColumn({ name: "id_category" })
  category!: CategoryEntity;

  @OneToMany(() => User_RecipeEntity, (user_recipe: User_RecipeEntity) => user_recipe.id_recipe, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  recipe!: Array<User_RecipeEntity>;

  user!: UserEntity;
}

