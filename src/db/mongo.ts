import { Db, MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let db: Db;

export const connectToMongoDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error("MONGO_URL not defined");

  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db();

  console.log("Estás conectado al mondongo cosa guapa!");
};

export const getDB = (): Db => db;
