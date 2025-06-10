const bcrypt = require('bcryptjs');
const { User, Faculty, Course } = require('../models');

async function seedDatabase() {
  try {
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({
      where: { email: 'admin@sherubtse.edu.bt' }
    });

    if (!adminExists) {
      await User.create({
        fullName: 'System Admin',
        email: 'admin@sherubtse.edu.bt',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    }

    // Create sample faculty if none exist
    const facultyCount = await Faculty.count();
    if (facultyCount === 0) {
      const faculties = await Faculty.bulkCreate([
        {
          fullName: 'Dr. John Doe',
          email: 'john.doe@sherubtse.edu.bt',
          department: 'Computer Science',
          designation: 'Professor'
        },
        {
          fullName: 'Dr. Jane Smith',
          email: 'jane.smith@sherubtse.edu.bt',
          department: 'Mathematics',
          designation: 'Associate Professor'
        }
      ]);
      console.log('✅ Sample faculty created');

      // Create sample courses
      await Course.bulkCreate([
        {
          name: 'Introduction to Programming',
          code: 'CS101',
          description: 'Basic programming concepts using Python',
          semester: 1,
          facultyId: faculties[0].id
        },
        {
          name: 'Calculus I',
          code: 'MATH101',
          description: 'Introduction to differential calculus',
          semester: 1,
          facultyId: faculties[1].id
        }
      ]);
      console.log('✅ Sample courses created');
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = seedDatabase; 