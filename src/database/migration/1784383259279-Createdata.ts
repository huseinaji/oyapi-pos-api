import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { ulid } from "ulid";

export class Createdata1784383259279 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.createTable(
            new Table({
                name: 'tickets',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '26',
                        isPrimary: true,
                    },
                    {
                        name: 'stock',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'ticket_name',
                        type: 'varchar',
                        isNullable: false,
                    }
                ]
            }), true, false, false,)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('test_tickets')
    }

}
