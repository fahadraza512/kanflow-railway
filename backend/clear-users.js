const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'kanflow_db',
});

async function clearDatabase() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Disable foreign key checks temporarily
        await client.query('SET session_replication_role = replica;');

        // Clear all tables in order (respecting dependencies)
        const tables = [
            'comments',
            'activities',
            'tasks',
            'lists',
            'boards',
            'project_members',
            'projects',
            'workspace_members',
            'workspaces',
            'invitations',
            'notifications',
            'payment_methods',
            'invoices',
            'preferences',
            'users',
        ];

        console.log('\nClearing database tables...\n');

        for (const table of tables) {
            try {
                const result = await client.query(`DELETE FROM "${table}"`);
                console.log(`✓ Cleared ${table}: ${result.rowCount} rows deleted`);
            } catch (error) {
                console.log(`⚠ Table ${table} might not exist or error: ${error.message}`);
            }
        }

        // Re-enable foreign key checks
        await client.query('SET session_replication_role = DEFAULT;');

        console.log('\n✅ Database cleared successfully!');
        console.log('You can now start fresh with a clean database.\n');

    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

clearDatabase();
