import { getDB } from "../db/mongo";
import * as bcrypt from "bcryptjs";
import { COLLECTION_TRAINERS } from "../utils";
import { ObjectId } from "mongodb";

export const startJourney = async (name: string, password: string) => {
  const db = getDB();
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
  if (!trainer) return null;

  const ok = await bcrypt.compare(password, trainer.password);
  if (!ok) return null;

  return trainer;
};

export const findTrainerById = async (id: string) => {
  const db = getDB();
  return db.collection(COLLECTION_TRAINERS).findOne({ _id: new ObjectId(id) });
};
