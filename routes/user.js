const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { Course, Faculty } = require('../models');


// Get all feedbacks for the logged-in user
router.get('/view-feedback', isAuthenticated, async (req, res) => {
  console.log('Accessing view-feedback route');
  try {
    console.log('User ID:', req.user.id);
    const feedbacks = await Feedback.findAll({
      where: {
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    console.log('Retrieved feedbacks:', feedbacks);
    res.render('user/view-feedback', {
      user: req.user,
      feedbacks: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).render('error', {
      message: 'Failed to retrieve feedbacks',
      error: error
    });
  }
});

// Get specific feedback
router.get('/feedback/:id', isAuthenticated, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Update feedback
router.put('/feedback/:id', isAuthenticated, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update feedback
    await feedback.update({
      q1: req.body.q1,
      q2: req.body.q2,
      q3: req.body.q3,
      suggestions: req.body.suggestions
    });

    res.json({ message: 'Feedback updated successfully' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to render feedback form
exports.renderForm = async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [['name', 'ASC']] });
    const faculty = await Faculty.findAll({ order: [['name', 'ASC']] });

    console.log('Courses:', courses.map(c => c.name));
    console.log('Faculty:', faculty.map(f => f.name));

    const feedbackQuestions = [
      { id: 'q1', question: "How would you rate the overall quality of teaching?" },
      { id: 'q2', question: "How well were the course materials and resources organized?" },
      { id: 'q3', question: "How effective was the instructor in engaging students and encouraging participation?" }
    ];

    res.render('user/feedback-form', {
      courses,
      faculty,
      feedbackQuestions
    });
  } catch (error) {
    console.error('Error loading feedback form:', error);
    res.status(500).render('error', { message: 'Error loading form', error });
  }
};



module.exports = router; 