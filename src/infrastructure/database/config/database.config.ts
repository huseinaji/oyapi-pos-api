import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { GET_ENV_VARIABLE } from "../../../common/utils/utils";

export const DB_CONFIG: SequelizeModuleOptions = {
  username: GET_ENV_VARIABLE('DB_USERNAME', 'root'),
  password: GET_ENV_VARIABLE('DB_PASSWORD'),
  database: GET_ENV_VARIABLE("DB_NAME"),
  host: GET_ENV_VARIABLE("DB_HOST"),
  dialect: "mysql",
  port: Number(GET_ENV_VARIABLE("DB_PORT", "3306")),
  define: {
    underscored: true,
  },
  logging: false,
  autoLoadModels: true,
  synchronize: false,
}
