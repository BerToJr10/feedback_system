const { sequelize } = require('./models');

async function resetDatabase() {
  try {
    // Drop all tables
    await sequelize.drop();
    console.log('✅ All tables dropped');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database reset complete');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 