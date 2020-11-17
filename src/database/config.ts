import "reflect-metadata";
import entities from "./entity"
import dotenv from 'dotenv';
import { createConnection } from "typeorm";

dotenv.config();

//If you have a external database
//const portNumber: number = + process.env.RDS_PORT!;

const connection: Promise<any> = createConnection({
  type: "postgres",
  entities,
  url: process.env.DATABASE_URL,
  /* If you have a external database
    host: process.env.RDS_HOSTNAME!,
    port: portNumber!,
    username: process.env.RDS_USERNAME!,
    password: process.env.RDS_PASSWORD!,
    database: process.env.RDS_DB_NAME!,
  */
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: true,
  logging: false
})

export = connection