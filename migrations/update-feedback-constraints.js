'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop existing foreign key constraints
    await queryInterface.removeConstraint('feedbacks', 'feedbacks_course_id_fkey');
    await queryInterface.removeConstraint('feedbacks', 'feedbacks_faculty_id_fkey');

    // Add new foreign key constraints with CASCADE
    await queryInterface.addConstraint('feedbacks', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'feedbacks_course_id_fkey',
      references: {
        table: 'Courses',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('feedbacks', {
      fields: ['faculty_id'],
      type: 'foreign key',
      name: 'feedbacks_faculty_id_fkey',
      references: {
        table: 'Faculties',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to original constraints
    await queryInterface.removeConstraint('feedbacks', 'feedbacks_course_id_fkey');
    await queryInterface.removeConstraint('feedbacks', 'feedbacks_faculty_id_fkey');

    await queryInterface.addConstraint('feedbacks', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'feedbacks_course_id_fkey',
      references: {
        table: 'Courses',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('feedbacks', {
      fields: ['faculty_id'],
      type: 'foreign key',
      name: 'feedbacks_faculty_id_fkey',
      references: {
        table: 'Faculties',
        field: 'id'
      }
    });
  }
}; 