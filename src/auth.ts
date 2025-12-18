import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { getDB } from "./db/mongo";
import { ObjectId } from "mongodb";
import { COLLECTION_TRAINERS } from "./utils";

dotenv.config();

const SECRET = process.env.SUPER_SECRET!;

export const signToken = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: "1h" });

export const getUserFromToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string };
    return getDB()
      .collection(COLLECTION_TRAINERS)
      .findOne({ _id: new ObjectId(payload.userId) });
  } catch {
    return null;
  }
};
