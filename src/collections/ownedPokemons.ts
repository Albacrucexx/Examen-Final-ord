import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED, COLLECTION_TRAINERS} from "../utils";

const rand = () => Math.floor(Math.random() * 100) + 1;

export const catchPokemon = async (
  pokemonId: string,
  nickname: string | null,
  trainerId: string
) => {
  const db = getDB();

  const trainer = await db
    .collection(COLLECTION_TRAINERS)
    .findOne({ _id: new ObjectId(trainerId) });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  if (trainer.pokemons.length >= 6) {
    throw new Error("Trainer already has 6 pokemons");
  }
  
  const ownedResult = await db.collection(COLLECTION_OWNED).insertOne({
    pokemonId,
    nickname,
    attack: rand(),
    defense: rand(),
    speed: rand(),
    special: rand(),
    level: 1
  });

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $addToSet: { pokemons: ownedResult.insertedId.toString() } }
  );

  return db.collection(COLLECTION_OWNED).findOne({
    _id: ownedResult.insertedId
  });
};

export const freePokemon = async (
  ownedPokemonId: string,
  trainerId: string
) => {
  const db = getDB();

  const trainer = await db
    .collection(COLLECTION_TRAINERS)
    .findOne({ _id: new ObjectId(trainerId) });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  if (!trainer.pokemons.includes(ownedPokemonId)) {
    throw new Error("Pokemon does not belong to trainer");
  }

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $pull: { pokemons: ownedPokemonId as any } }
  );

  await db.collection(COLLECTION_OWNED).deleteOne({
    _id: new ObjectId(ownedPokemonId)
  });

  return db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(trainerId)
  });
};