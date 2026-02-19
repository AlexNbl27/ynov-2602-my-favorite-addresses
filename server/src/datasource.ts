import { DataSource } from "typeorm";

const datasource = new DataSource({
  type: "better-sqlite3",
  database: "./db.sqlite",
  entities: ["./src/entities/**/*.{js,ts}"],
  logging: true,
  synchronize: true,
});

export default datasource;
