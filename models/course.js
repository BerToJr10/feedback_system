'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    facultyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
      model: 'faculties', // table name
      key: 'id'
      }
    }
  }, {
    tableName: 'courses',
    timestamps: true,
    underscored: true
  }); 

  Course.associate = (models) => {
    
    Course.belongsTo(models.Faculty, {
     foreignKey: 'facultyId',
     as: 'faculty'
    });
  };

  return Course;
}; 