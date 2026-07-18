import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProduct1784383022971 implements MigrationInterface {
    name = 'CreateProduct1784383022971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` varchar(26) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, \`uom\` varchar(255) NOT NULL, \`basePrice\` int NOT NULL, \`sellingPrice\` int NOT NULL, UNIQUE INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
    }

}
