import { DataSource } from "typeorm";
import { getDbConfig } from "./config/database.config";

export default new DataSource(getDbConfig());