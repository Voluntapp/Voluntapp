// MySQL database client using drizzle-orm/mysql2
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

let connection: mysql.Pool;
if (databaseUrl) {
  connection = mysql.createPool({ uri: databaseUrl });
} else {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'voluntapp';
  const port = Number(process.env.MYSQL_PORT || 3306);
  connection = mysql.createPool({ host, user, password, database, port, waitForConnections: true, connectionLimit: 10 });
}

export const db = drizzle(connection, { schema });
