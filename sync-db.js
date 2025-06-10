const db = require('./models');
const seedDatabase = require('./seeders/initial-data');

async function syncDatabase() {
  try {
    // Sync models without forcing recreation
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');

    // Run seeder to ensure initial data exists
    await seedDatabase();
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase(); 