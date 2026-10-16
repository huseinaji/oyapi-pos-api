import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { GET_ENV_VARIABLE } from "../../../common/utils";

export const DB_CONFIG: SequelizeModuleOptions = {
  uri: GET_ENV_VARIABLE('DATABASE_URL'),
  dialect: 'postgres',
  define: {
    underscored: true,
  },
  logging: false,
  autoLoadModels: true,
  synchronize: false,
}
