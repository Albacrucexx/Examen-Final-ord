import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED, COLLECTION_TRAINERS, COLLECTION_POKEMONS} from "../utils";

// Genera números aleatorios entre 1 y 100 (incluidos)
const rand = () => Math.floor(Math.random() * 100) + 1;

/**
 * Captura un Pokémon para un entrenador autenticado
 */
export const catchPokemon = async (
  pokemonId: string,
  nickname: string | null,
  trainerId: string
) => {
  const db = getDB();

  //  Comprobar que el entrenador existe
  const trainer = await db
    .collection(COLLECTION_TRAINERS)
    .findOne({ _id: new ObjectId(trainerId) });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  //  Máximo 6 Pokémon
  if (trainer.pokemons.length >= 6) {
    throw new Error("Trainer already has 6 pokemons");
  }

  //  Comprobar que el Pokémon existe
  const pokemonExists = await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: new ObjectId(pokemonId) });

  if (!pokemonExists) {
    throw new Error("Pokemon not found");
  }

  //  Crear OwnedPokemon (GUARDANDO SOLO EL ID DEL POKÉMON)
  const ownedResult = await db.collection(COLLECTION_OWNED).insertOne({
    pokemon: pokemonId, // 🔑 SOLO EL ID
    nickname,
    attack: rand(),
    defense: rand(),
    speed: rand(),
    special: rand(),
    level: 1
  });

  //  Añadir el OwnedPokemon al entrenador
  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $addToSet: { pokemons: ownedResult.insertedId.toString() } }
  );

  //  Devolver el OwnedPokemon creado
  return db.collection(COLLECTION_OWNED).findOne({
    _id: ownedResult.insertedId
  });
};

/**
 * Libera un Pokémon capturado por el entrenador
 */
export const freePokemon = async (
  ownedPokemonId: string,
  trainerId: string
) => {
  const db = getDB();

  //  Comprobar que el entrenador existe
  const trainer = await db
    .collection(COLLECTION_TRAINERS)
    .findOne({ _id: new ObjectId(trainerId) });

  if (!trainer) {
    throw new Error("Trainer not found");
  }

  //  Comprobar que el Pokémon pertenece al entrenador
  if (!trainer.pokemons.includes(ownedPokemonId)) {
    throw new Error("Pokemon does not belong to trainer");
  }

  //  Quitar el Pokémon del entrenador
  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $pull: { pokemons: ownedPokemonId } as any}
  );

  // Borrar el OwnedPokemon completamente
  await db.collection(COLLECTION_OWNED).deleteOne({
    _id: new ObjectId(ownedPokemonId)
  });

  // Devolver el entrenador actualizado
  return db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(trainerId)
  });
};