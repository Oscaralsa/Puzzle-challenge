import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const portNumber: number =+ process.env.RDS_PORT!;
 
const Pool = pg.Pool;
const connection = new Pool({
  database: process.env.RDS_DB_NAME,
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: portNumber
});

export = connection;


