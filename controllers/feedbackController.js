'use strict';

const { Feedback, Course, Faculty, User } = require('../models');

// Get feedback form
exports.getFeedbackForm = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Faculty,
        as: 'faculty',
        attributes: ['id', 'fullName', 'department']
      }],
      order: [['name', 'ASC']],
    });

    if (!courses || courses.length === 0) {
      return res.render('user/feedback-form', {
        courses: [],
        error: 'No courses available for feedback.'
      });
    }

    res.render('user/feedback-form', {
      courses,
      error: null
    });
  } catch (error) {
    console.error('Error loading feedback form:', error);
    res.status(500).render('error', {
      message: 'Error loading feedback form',
      error: error.message || 'Internal server error'
    });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { courseId, q1, q2, q3, suggestions } = req.body;
    const userId = req.session.user.id;

    // Validate rating inputs (should be integer 1-5)
    const ratings = [q1, q2, q3].map(Number);
    if (ratings.some(r => isNaN(r) || r < 1 || r > 5)) {
      return res.status(400).render('user/feedback-form', {
        courses: await Course.findAll({ include: [{ model: Faculty, as: 'faculty' }], order: [['name', 'ASC']] }),
        error: 'Please provide valid ratings between 1 and 5.'
      });
    }

    // Validate course and its faculty existence
    const course = await Course.findOne({
      where: { id: courseId },
      include: [{
        model: Faculty,
        as: 'faculty',
        required: true,
        attributes: ['id']
      }]
    });

    if (!course) {
      return res.status(404).render('error', { message: 'Course not found or has no assigned faculty' });
    }

    // Defensive check: faculty must exist
    if (!course.faculty || !course.faculty.id) {
      return res.status(400).render('error', { message: 'Selected course does not have an assigned faculty.' });
    }

    // Create feedback entry
    await Feedback.create({
      userId,
      courseId,
      facultyId: course.faculty.id,
      q1: ratings[0],
      q2: ratings[1],
      q3: ratings[2],
      suggestions: suggestions || null,
    });

    res.redirect('/user/view-feedback');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).render('error', {
      message: 'Error submitting feedback',
      error: error.message || 'Internal server error'
    });
  }
};

// View user's feedbacks
exports.viewUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { userId: req.session.user.id },
      include: [{
        model: Course,
        as: 'course',
        include: [{
          model: Faculty,
          as: 'faculty',
          attributes: ['fullName', 'department']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.render('user/view-feedback', { feedbacks });
  } catch (error) {
    console.error('Error loading feedbacks:', error);
    res.status(500).render('error', {
      message: 'Error loading feedbacks',
      error: error.message || 'Internal server error'
    });
  }
};

// View all feedbacks (admin)
exports.viewAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          include: [{
            model: Faculty,
            as: 'faculty',
            attributes: ['fullName', 'department']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/feedbacks', { feedbacks });
  } catch (error) {
    console.error('Error loading feedbacks:', error);
    res.status(500).render('error', {
      message: 'Error loading feedbacks',
      error: error.message || 'Internal server error'
    });
  }
};
