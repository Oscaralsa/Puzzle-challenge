import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { User_RecipeEntity } from "./user_recipe.entity";

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "name", length: 100, nullable: false })
  name!: string;

  @Column({ name: "email", length: 100, nullable: false })
  email!: string;

  @Column({ name: "password", nullable: false })
  password!: string;

  @OneToMany(() => User_RecipeEntity, (user_recipe: User_RecipeEntity) => user_recipe.id_user, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user_recipe!: Array<User_RecipeEntity>;
}