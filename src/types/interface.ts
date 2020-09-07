interface Loaders {
  user: any;
  category: any;
}

export interface Context {
  email: string;
  loggedInUserId: number;
  loaders: Loaders
}

export interface mailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface getOneRecipeInput {
  id: number, 
  name: string, 
  ingredients: string, 
  nameCategory: string; 
  idCategory: number;
}

export interface getRecipesInput {
  page: number;
  limit: number;
  name: string, 
  ingredients: string, 
  nameCategory: string; 
  idCategory: number;
}

export interface getOneCategoryInput {
  id: number, 
  name: string, 
  nameRecipe: string; 
  idRecipe: number;
}

export interface getCategoriesInput {
  page: number;
  limit: number;
  name: string, 
  nameRecipe: string; 
  idRecipe: number;
}

export interface updateCategoryInput {
  name: string;
}

export interface createCategoryInput {
  name: string;
}