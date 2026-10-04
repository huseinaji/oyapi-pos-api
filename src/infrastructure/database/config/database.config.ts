import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { GET_ENV_VARIABLE } from "../../../common/utils";

export const DB_CONFIG: SequelizeModuleOptions = {
  //username: GET_ENV_VARIABLE('DB_USERNAME', 'root'),
  //password: GET_ENV_VARIABLE('DB_PASSWORD'),
  //database: GET_ENV_VARIABLE("DB_NAME"),
  //host: GET_ENV_VARIABLE("DB_HOST"),
  //dialect: 'postgres',
  //port: Number(GET_ENV_VARIABLE("DB_PORT", "3306")),
  uri: GET_ENV_VARIABLE('DATABASE_URL'),
  dialect: 'postgres',
  define: {
    underscored: true,
  },
  logging: false,
  autoLoadModels: true,
  synchronize: false,
}
