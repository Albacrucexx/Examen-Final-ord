import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_POKEMONS } from "../utils";

export const getPokemons = async (page = 1, size = 10) => {
  const db = getDB();
  return db.collection(COLLECTION_POKEMONS)
    .find()
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};

export const getPokemonById = async (id: string) => {
  const db = getDB();
  return db.collection(COLLECTION_POKEMONS).findOne({ _id: new ObjectId(id) });
};

export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: string[]
) => {
  const db = getDB();
  const result = await db.collection(COLLECTION_POKEMONS).insertOne({
    name,
    description,
    height,
    weight,
    types
  });

  return getPokemonById(result.insertedId.toString());
};
