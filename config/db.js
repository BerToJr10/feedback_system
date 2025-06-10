const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'college_feedback',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'fuckyuhbitxh',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const [results, metadata] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Users'`);
console.log(results);


// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

module.exports = sequelize;
