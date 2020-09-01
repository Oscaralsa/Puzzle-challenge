import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany } from "typeorm";

import { RecipeEntity } from "./recipe.entity";

@Entity({ name: "category"})
export class CategoryEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "name", length: 100, nullable: false })
  name!: string;

  @OneToMany(() => RecipeEntity, (recipe: RecipeEntity) => recipe.category, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  recipe!: Array<RecipeEntity>;

}

