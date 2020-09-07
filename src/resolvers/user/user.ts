import bcrypt from 'bcryptjs';
import { AuthenticationError } from 'apollo-server-express';
import { getConnection, Repository } from 'typeorm';

import { getResult } from "../../helper/helpers/helpers";
import { UserEntity } from "../../database/entity/user.entity";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import { createAccessToken, createRefreshToken } from "../../services/jwtService";
import { isAuthenticated } from "../../middleware";
import PubSub from "../../subscription";
import { userEvents } from "../../subscription/events/user";
import { Context } from '../../types/interface';
import { registerEmail } from "../../services/emailService";

export = {
  Query: {
    getOneUser:  async (_: any, { id }: { id: number }, context: Context) => {
      try {
        //Middlewares
        isAuthenticated(context);

        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);
        const users: UserEntity[] = await userRepository.find({ where: { id }, take:1 });
        const user: UserEntity = getResult(users);

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
        const users: UserEntity[] = await userRepository.find({ where: { email }, take:1 });
        const user: UserEntity = getResult(users);

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
    signup: async (_: any, { input }: { input: any }) => {
      try {
        //Create user repository
        let userRepository: Repository<UserEntity> = getConnection().getRepository(UserEntity);

        //Check if user is already registered
        const users: UserEntity[] = await userRepository.find({ where: { email: input.email }, take: 1 })
        const user: UserEntity = getResult(users);

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

        const users: UserEntity[] = await userRepository.find({ where: { email: input.email }, take: 1 })
        const user: UserEntity = getResult(users);

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

        const user: UserEntity[] = await userRepository.find({ where: { id }, take: 1 });

        const recipe = await recipeRepository.find({ user: getResult(user) });

        return recipe;
      } catch (err) {
        throw new Error(err)
      }

    }
  }
}



