import { gql } from "apollo-server";

export const typeDefs = gql`
  type Trainer {
    _id: ID!
    name: String!
    pokemons: [OwnedPokemon!]!
  }

  type Pokemon {
    _id: ID!
    name: String!
    description: String!
    height: Float!
    weight: Float!
    types: [String!]!
  }

  type OwnedPokemon {
    _id: ID!
    nickname: String!
    level: Int!
    pokemon: Pokemon!
  }

  type Query {
    me: Trainer
    pokemons(page: Int, size: Int): [Pokemon!]!
    pokemon(id: ID!): Pokemon
  }

  type Mutation {
    startJourney(name: String!, password: String!): String!
    login(name: String!, password: String!): String!
    createPokemon(
      name: String!
      description: String!
      height: Float!
      weight: Float!
      types: [String!]!
    ): Pokemon!
    catchPokemon(pokemonId: ID!, nickname: String!): OwnedPokemon!
    freePokemon(ownedPokemonId: ID!): Trainer!
  }
`;
