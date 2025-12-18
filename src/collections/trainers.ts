import { getDB } from "../db/mongo";
import * as bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { COLLECTION_TRAINERS } from "../utils";

export const startJourney = async (name: string, password: string) => {
  const db = getDB();

  const exists = await db.collection(COLLECTION_TRAINERS).findOne({ name });
  if (exists) throw new Error("Trainer already exists");

  const hash = await bcrypt.hash(password, 10);
  
  const result = await db.collection(COLLECTION_TRAINERS).insertOne({
    name,
    password: hash,
    pokemons: []
  });

  return result.insertedId.toString();
};

export const loginTrainer = async (name: string, password: string) => {
  const db = getDB();
  const trainer = await db.collection(COLLECTION_TRAINERS).findOne({ name });

  if (!trainer) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, trainer.password);
  if (!ok) throw new Error("Invalid credentials");

  return trainer;
};
