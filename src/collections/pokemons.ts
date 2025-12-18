import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_POKEMONS } from "../utils";

export const getPokemons = async (page = 1, size = 10) =>
  getDB()
    .collection(COLLECTION_POKEMONS)
    .find()
    .skip((page - 1) * size)
    .limit(size)
    .toArray();

export const getPokemonById = async (id: string) =>
  getDB()
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: new ObjectId(id) });

export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: string[]
) => {
  const result = await getDB()
    .collection(COLLECTION_POKEMONS)
    .insertOne({ name, description, height, weight, types });

  return getPokemonById(result.insertedId.toString());
};
