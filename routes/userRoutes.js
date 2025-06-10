const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { Feedback, Course, Faculty } = require('../models');
const feedbackController = require('../controllers/feedbackController');

// User home page
router.get('/home', isAuthenticated, (req, res) => {
  res.render('user/home', { user: res.locals.user });
});

// Get feedback form
router.get('/feedback-form', isAuthenticated, feedbackController.getFeedbackForm);

// Submit feedback
router.post('/submit-feedback', isAuthenticated, feedbackController.submitFeedback);

// View feedback
router.get('/view-feedback', isAuthenticated, async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: {
        userId: res.locals.user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['name', 'code']
        },
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['fullName', 'department']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('user/view-feedback', {
      user: res.locals.user,
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).render('error', {
      message: 'Failed to retrieve feedbacks',
      error: error
    });
  }
});

// API routes for feedback management
router.get('/feedback/:id', isAuthenticated, async (req, res) => {
  try {
    if (!res.locals.user || !res.locals.user.id) {
      return res.status(401).json({ message: 'Please log in to view feedback' });
    }

    const feedback = await Feedback.findOne({
      where: {
        id: req.params.id,
        userId: res.locals.user.id
      },
      include: [{
        model: Course,
        as: 'course'
      }, {
        model: Faculty,
        as: 'faculty'
      }]
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

router.put('/feedback/:id', isAuthenticated, async (req, res) => {
  try {
    if (!res.locals.user || !res.locals.user.id) {
      return res.status(401).json({ message: 'Please log in to update feedback' });
    }

    const feedback = await Feedback.findOne({
      where: {
        id: req.params.id,
        userId: res.locals.user.id
      }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.update({
      q1: req.body.q1,
      q2: req.body.q2,
      q3: req.body.q3,
      suggestions: req.body.suggestions
    });

    res.json({ message: 'Feedback updated successfully' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

router.delete('/feedback/:id', isAuthenticated, async (req, res) => {
  try {
    if (!res.locals.user || !res.locals.user.id) {
      return res.status(401).json({ message: 'Please log in to delete feedback' });
    }

    const feedback = await Feedback.findOne({
      where: {
        id: req.params.id,
        userId: res.locals.user.id
      }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

module.exports = router;
