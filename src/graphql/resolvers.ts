import { IResolvers } from "@graphql-tools/utils";
import { getPokemons, getPokemonById, createPokemon } from "../collections/pokemons";
import { startJourney, loginTrainer } from "../collections/trainers";
import { catchPokemon, freePokemon } from "../collections/ownedPokemons";
import { signToken } from "../auth";
import { getDB } from "../db/mongo";
import { ObjectId } from "mongodb";
import { COLLECTION_OWNED, COLLECTION_POKEMONS } from "../utils";

export const resolvers: IResolvers = {
  Query: {
    me: (_, __, { user }) => user,
    pokemons: (_, { page, size }) => getPokemons(page, size),
    pokemon: (_, { id }) => getPokemonById(id)
  },
  
  Mutation: {
    startJourney: async (_, { name, password }) =>
      signToken(await startJourney(name, password)),

    login: async (_, { name, password }) => {
      const trainer = await loginTrainer(name, password);
      if (!trainer) throw new Error("Invalid credentials");
      return signToken(trainer._id.toString());
    },

    createPokemon: (_, args, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return createPokemon(
        args.name,
        args.description,
        args.height,
        args.weight,
        args.types
      );
    },

    catchPokemon: (_, { pokemonId, nickname }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return catchPokemon(pokemonId, nickname, user._id.toString());
    },

    freePokemon: (_, { ownedPokemonId }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return freePokemon(ownedPokemonId, user._id.toString());
    }
  },

  Trainer: {
    pokemons: async (parent) => {
      const db = getDB();
      const ids = parent.pokemons.map((id: string) => new ObjectId(id));
      return db.collection(COLLECTION_OWNED)
               .find({ _id: { $in: ids } })
               .toArray();
    }
  },

  OwnedPokemon: {
    pokemon: async (parent) => {
      const db = getDB();
      return db.collection(COLLECTION_POKEMONS)
               .findOne({ _id: new ObjectId(parent.pokemonId) });
    }
  }
};
