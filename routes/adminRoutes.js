const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const { User, Faculty, Course, Feedback, sequelize } = require('../models');
const feedbackController = require('../controllers/feedbackController');

// Admin dashboard home
router.get('/home', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get counts for dashboard
    const totalFeedbacks = await Feedback.count();
    const totalFaculty = await Faculty.count();
    const totalCourses = await Course.count();

    // Get recent feedbacks with course and faculty details
    const recentFeedbacks = await Feedback.findAll({
      include: [
        { 
          model: Course,
          as: 'course',
          attributes: ['name']
        },
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Format recent feedbacks for display
    const formattedRecentFeedbacks = recentFeedbacks.map(feedback => ({
      course: feedback.course ? feedback.course.name : 'Unknown Course',
      faculty: feedback.faculty ? feedback.faculty.fullName : 'Unknown Faculty',
      date: feedback.createdAt.toLocaleDateString()
    }));

    res.render('admin/home', {
      user: req.session.user,
      totalFeedbacks,
      totalFaculty,
      totalCourses,
      recentFeedbacks: formattedRecentFeedbacks
    });
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    res.status(500).render('error', {
      message: 'Error loading admin dashboard',
      error
    });
  }
});

// View all feedbacks
router.get('/feedbacks', isAuthenticated, isAdmin, feedbackController.viewAllFeedbacks);

// Get feedback details (for modal)
router.get('/feedbacks/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'course' },
        { model: Faculty, as: 'faculty' },
        { model: User, as: 'user' }
      ]
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Faculty Management Routes
router.get('/faculty', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findAll({
      attributes: ['id', 'fullName', 'email', 'department', 'designation'],
      order: [['fullName', 'ASC']]
    });

    res.render('admin/faculty', {
      user: req.session.user,
      faculty
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).render('error', {
      message: 'Error loading faculty list',
      error
    });
  }
});

// Add new faculty
router.post('/faculty', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { fullName, email, department, designation } = req.body;
    await Faculty.create({
      fullName,
      email,
      department,
      designation
    });
    res.redirect('/admin/faculty');
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).render('error', {
      message: 'Error creating faculty',
      error
    });
  }
});

// Delete faculty
router.delete('/faculty/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    await faculty.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Error deleting faculty member' });
  }
});

// Edit faculty form
router.get('/faculty/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) {
      return res.status(404).render('error', {
        message: 'Faculty not found'
      });
    }
    res.render('admin/edit-faculty', { faculty });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).render('error', {
      message: 'Error loading faculty details',
      error
    });
  }
});

// Update faculty
router.post('/faculty/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) {
      return res.status(404).render('error', {
        message: 'Faculty not found'
      });
    }
    const { fullName, email, department } = req.body;
    await faculty.update({
      fullName,
      email,
      department
    });
    res.redirect('/admin/faculty');
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).render('error', {
      message: 'Error updating faculty member',
      error
    });
  }
});

// Course Management Routes
router.get('/courses', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Faculty,
        as: 'faculty',
        attributes: ['id', 'fullName', 'department']
      }],
      order: [['name', 'ASC']]
    });
    
    const faculties = await Faculty.findAll({
      order: [['fullName', 'ASC']]
    });
    
    res.render('admin/manage-courses', { courses, faculties });
  } catch (error) {
    console.error('Error loading courses:', error);
    res.status(500).render('error', {
      message: 'Error loading courses',
      error
    });
  }
});

// Add new course
router.post('/courses', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { code, name, description, facultyId } = req.body;
    
    // Validate faculty exists
    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(400).render('error', {
        message: 'Selected faculty does not exist'
      });
    }

    await Course.create({
      code,
      name,
      description,
      facultyId: parseInt(facultyId)
    });
    
    res.redirect('/admin/courses');
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).render('error', {
      message: 'Error creating course',
      error
    });
  }
});

// Edit course
router.get('/courses/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: Faculty,
        as: 'faculty'
      }]
    });
    
    if (!course) {
      return res.status(404).render('error', {
        message: 'Course not found'
      });
    }
    
    const faculties = await Faculty.findAll({
      order: [['fullName', 'ASC']]
    });
    
    res.render('admin/edit-course', { course, faculties });
  } catch (error) {
    console.error('Error loading course:', error);
    res.status(500).render('error', {
      message: 'Error loading course',
      error
    });
  }
});

// Update course
router.post('/courses/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { code, name, description, facultyId } = req.body;
    
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).render('error', {
        message: 'Course not found'
      });
    }
    
    // Validate faculty exists
    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(400).render('error', {
        message: 'Selected faculty does not exist'
      });
    }
    
    await course.update({
      code,
      name,
      description,
      facultyId: parseInt(facultyId)
    });
    
    res.redirect('/admin/courses');
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).render('error', {
      message: 'Error updating course',
      error
    });
  }
});

// Delete course
router.post('/courses/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      await transaction.rollback();
      return res.status(404).render('error', {
        message: 'Course not found'
      });
    }

    await course.destroy({ transaction });
    await transaction.commit();
    
    res.redirect('/admin/courses');
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting course:', error);
    res.status(500).render('error', {
      message: 'Error deleting course. Please try again.',
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
