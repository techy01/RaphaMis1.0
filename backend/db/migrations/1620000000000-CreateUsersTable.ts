import { MigrationInterface, QueryRunner, Table } from "typeorm";
import * as bcrypt from 'bcrypt';

export class CreateUsersTable1620000000000 implements MigrationInterface {
    name = 'CreateUsersTable1620000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This is a placeholder for a proper migration.
        // In a real project, you would let synchronize:true handle this during development
        // or write a full migration script for production.
        // We'll add a seed user here if the table is created by synchronize.
        
        try {
            const hasUserTable = await queryRunner.hasTable('users');
            if(hasUserTable) {
                const superAdminExists = await queryRunner.query(`SELECT * FROM users WHERE email = 'mbarutech@gmail.com'`);
                if (superAdminExists.length === 0) {
                    const hashedPassword = await bcrypt.hash('welcome@2026', 12);
                    await queryRunner.query(
                        `INSERT INTO users (id, name, email, password, role) VALUES ('usr_superadmin_master', 'RaphaMIS Super Admin', 'mbarutech@gmail.com', '${hashedPassword}', 'Superadmin')`
                    );
                }
            }
        } catch(e) {
            console.error("Could not seed superadmin user", e)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Placeholder for down migration
        await queryRunner.query(`DELETE FROM users WHERE email = 'mbarutech@gmail.com'`);
    }

}
