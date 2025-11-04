import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  try {
    const migrationFile = readFileSync(
      join(__dirname, '001_create_tables.sql'),
      'utf-8'
    );

    console.log('🔄 Running migrations...');
    
    // Execute the entire migration file
    // Individual statements handle their own IF NOT EXISTS
    try {
      await pool.query(migrationFile);
    } catch (error: any) {
      // Skip if constraint/table/index already exists
      if (error.code === '42710' || error.code === '42P07' || 
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate key')) {
        console.log('⚠️  Some objects already exist, skipping...');
        console.log('✅ Migrations completed (some may already exist)');
        process.exit(0);
        return;
      }
      throw error;
    }
    
    console.log('✅ Migrations completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

