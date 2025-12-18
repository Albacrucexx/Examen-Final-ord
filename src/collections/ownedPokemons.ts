import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED, COLLECTION_TRAINERS } from "../utils";

export const catchPokemon = async (
  pokemonId: string,
  nickname: string | null,
  trainerId: string
) => {
  const db = getDB();

  const owned = await db.collection(COLLECTION_OWNED).insertOne({
    pokemonId,
    nickname,
    attack: 10,
    defense: 10,
    speed: 10,
    special: 10,
    level: 1
  });

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $addToSet: { pokemons: owned.insertedId.toString() } }
  );

  return db.collection(COLLECTION_OWNED)
           .findOne({ _id: owned.insertedId });
};

export const freePokemon = async (
  ownedPokemonId: string,
  trainerId: string
) => {
  const db = getDB();

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $pull: { pokemons: ownedPokemonId as any } }
  );

  await db.collection(COLLECTION_OWNED)
          .deleteOne({ _id: new ObjectId(ownedPokemonId) });

  return db.collection(COLLECTION_TRAINERS)
           .findOne({ _id: new ObjectId(trainerId) });
};
