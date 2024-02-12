import { knex as setup, Knex } from "knex";

export const config: Knex.Config = {
  client: "sqlite",
  connection: {
    filename: "./db/app.db",
  },
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
};

export const knex = setup(config);
