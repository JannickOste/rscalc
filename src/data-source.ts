import "reflect-metadata"
import { DataSource } from "typeorm"
import { MoneyMakingMethod } from "./db/money-making-method"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: ["./src/db/**/*.ts"],
    migrations: [],
    subscribers: [],
});
