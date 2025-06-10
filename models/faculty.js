'use strict';

module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'faculties',
    timestamps: true,
    underscored: true
  });

  Faculty.associate = (models) => {
    Faculty.hasMany(models.Feedback, {
      foreignKey: 'facultyId',
      as: 'feedbacks',
    });
    
    Faculty.hasMany(models.Course, {
     foreignKey: 'facultyId',
      as: 'courses'
    });
 };
 
  return Faculty;
}; 