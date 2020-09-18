import bcrypt from 'bcryptjs';
import { AuthenticationError } from 'apollo-server-express';
import { getConnection, Repository } from 'typeorm';

import { checkEmail } from "../../helper/helpers/helpers";
import { UserEntity } from "../../database/entity/user.entity";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { createAccessToken, createRefreshToken } from "../../services/jwtService";
import { isAuthenticated } from "../../middleware";
import PubSub from "../../subscription";
import { userEvents } from "../../subscription/events/user";
import { Context, signUpInput } from '../../types/interface';
import { registerEmail } from "../../services/emailService";

export = {
  Query: {
    getOneUser:  async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Input validation
        if(!id) {
          throw new Error("Id is required")
        }  

        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);
        const user: UserEntity | undefined = await userRepository.findOne({ where: { id } });

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      } catch (err) {
        console.log(err);
        throw new Error(err)
      }

    },
    getMyUser: async (_: any, __: any, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Destructuring
        const { email } = context;
        
        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);
        const user: UserEntity | undefined = await userRepository.findOne({ where: { email } });

        if (!user) {
          throw new Error("User not found");
        }

        return user;

      } catch (err) {
        console.log(err);
        throw new Error(err)
      }

    },
  },
  Mutation: {
    signup: async (_: any, { input }: { input: signUpInput }) => {
      try {
        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        //Check inputs
        if(!checkEmail(input.email)){
          throw new Error("Email invalid")
        } else if(!input.name){
          throw new Error("Missing name")
        } else if (!input.password) throw new Error("Missing password")
        

        //Check if user is already registered
        const user: UserEntity | undefined = await userRepository.findOne({ where: { email: input.email } })

        if (user) {
          throw new Error("Email already in use")
        }

        //hash password
        let hashedPassword: string = await bcrypt.hash(input.password, 10)

        //Create a new user
        let newUser: UserEntity = new UserEntity();
        newUser.name = input.name;
        newUser.email = input.email;
        newUser.password = hashedPassword;

        const result: UserEntity = await userRepository.save(newUser);

        PubSub.publish(userEvents.USER_CREATED, {
          userCreated: result
        });

        registerEmail(newUser);
        
        return result;

      } catch (err) {
        return err;
      }
    },
    login: async (_: any, { input }: { input: any }) => {
      try {

        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        const user: UserEntity | undefined = await userRepository.findOne({ where: { email: input.email } })

        if (!user) {
          throw new AuthenticationError("User not found")
        }

        const isPasswordValid: Boolean = await bcrypt.compare(input.password, user.password)
        if (!isPasswordValid) {
          throw new AuthenticationError("Invalid password")
        }

        const accessToken: string = createAccessToken(user);
        const refreshToken: string = createRefreshToken(user);

        return { accessToken, refreshToken };

      } catch (err) {
        return err;
      }
    }
  }
  ,
  Subscription: {
    userCreated: {
      subscribe: () => PubSub.asyncIterator(userEvents.USER_CREATED)
    }
  },
  User: {
    recipes: async ({ id }: { id: number }) => {
      try {
        //Create user repository
        let recipeRepository: Repository<RecipeEntity> = getConnection().getRepository(RecipeEntity);
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        const user: UserEntity | undefined = await userRepository.findOne({ where: { id } });

        const recipe: RecipeEntity[] = await recipeRepository.find({ user: user });

        return recipe;
      } catch (err) {
        throw new Error(err)
      }

    }
  }
}



