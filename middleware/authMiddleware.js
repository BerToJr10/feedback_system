const { User } = require('../models');

exports.isAuthenticated = async (req, res, next) => {
  if (!req.session) {
    return res.redirect('/login');
  }

  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    // Verify user exists in database
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    // Set user data in res.locals for views
    res.locals.user = req.session.user;
    return next();
  } catch (error) {
    return res.status(500).render('error', {
      message: 'Authentication error',
      error: error
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Access denied. Admins only.',
      error: new Error('Unauthorized access attempt')
    });
  }
  return next();
};

exports.isStudent = async (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.status(403).render('error', {
      message: 'Access denied. Students only.',
      error: new Error('Unauthorized access attempt')
    });
  }
  return next();
};
