import bcrypt from 'bcrypt';
import { AuthenticationError } from 'apollo-server-express';
import { merge } from 'lodash';
import { getConnection } from 'typeorm';

import { UserEntity } from "../../database/entity/user.entity";
import { RecipeEntity } from "../../database/entity/recipe.entity";
import configDB from "../../database/config";
import jwt from "../../services/jwt";
import middleware from "../../resolvers/middleware";
import PubSub from "../../subscription";
import Events from "../../subscription/events";

//Destructuring
const { userEvents } = Events;
const { isAuthenticated } = middleware;
const { createAccessToken, createRefreshToken } = jwt;

export = {
  Query: {
    user: merge(async (_: any, { id }: { id: number }) => {
      try {
        const db = await configDB;
        //Create user repository
        let userRepository = db.getRepository(UserEntity);
        const user = await userRepository.findOne({ id });

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      } catch (err) {
        console.log(err);
        throw new Error(err)
      }

    }, isAuthenticated),
    myUser: merge(async (_: any, __: any, { email }: { email: string }) => {
      try {
        //isAuthenticated
        const db = await configDB;
        //Create user repository
        let userRepository = db.getRepository(UserEntity);
        const user: UserEntity = await userRepository.findOne({ email: email });

        if (!user) {
          throw new Error("User not found");
        }

        return user;

      } catch (err) {
        console.log(err);
        throw new Error(err)
      }

    }, isAuthenticated),
  },
  Mutation: {
    signup: async (_: any, { input }: { input: any }) => {
      try {
        const db = await configDB;
        //Create user repository
        let userRepository = db.getRepository(UserEntity);

        //Check if user is already registered
        const user = await userRepository.findOne({ email: input.email })

        if (user) {
          throw new Error("Email already in use")
        }

        //hash password
        let hashedPassword: string = await bcrypt.hash(input.password, 10)

        //Create a new user
        let newUser = new UserEntity();
        newUser.name = input.name;
        newUser.email = input.email;
        newUser.password = hashedPassword;

        const result: UserEntity = await userRepository.save(newUser);

        PubSub.publish(userEvents.USER_CREATED, {
          userCreated: result
        });
        
        return result;

      } catch (err) {
        return err;
      }
    },
    login: async (_: any, { input }: { input: any }) => {
      try {

        const db: any = await configDB;
        //Create user repository
        let userRepository: any = db.getRepository(UserEntity);

        const user = await userRepository.findOne({ email: input.email })

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
        const db = await configDB;
        //Create user repository
        let taskRepository = getConnection().getRepository(RecipeEntity);
        let userRepository = db.getRepository(UserEntity);

        const user: UserEntity = await userRepository.findOne({ id });

        //const task = await taskRepository.find({ user: user });

        //return task;
        return user;
      } catch (err) {
        throw new Error(err)
      }

    }
  }
}



