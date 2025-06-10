const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { User, Student } = require('../models');

// Email transporter for 2FA OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // ✅ Use environment variables
    pass: process.env.EMAIL_PASS
  }
});

// GET /signup - Show signup page
exports.getSignup = (req, res) => {
  res.render('auth/signup', { error: null });
};

// POST /signup - Handle signup logic
exports.postSignup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('auth/signup', { error: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user (inactive until OTP verified)
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user',
      otp,
      isVerified: false
    });

    // Try to send OTP via email
    let emailError = null;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: 'Verify Your Email - Sherubtse Feedback System',
        html: `<p>Your OTP is <strong>${otp}</strong>. Please enter it to verify your account.</p>`
      });
    } catch (err) {
      console.error('Email sending failed:', err);
      emailError = err;
    }

    // Store user ID in session temporarily
    req.session.tempUserId = newUser.id;

    // If email sending failed, show OTP on screen
    if (emailError) {
      return res.render('auth/verify-otp', { 
        error: 'Email service is temporarily unavailable. Please use this OTP to verify your account: ' + otp,
        showOtp: true,
        otp: otp
      });
    }

    res.redirect('/verify-otp');
  } catch (error) {
    console.error(error);
    res.render('auth/signup', { error: 'Signup failed. Try again.' });
  }
};

// GET /verify-otp
exports.getVerifyOtp = (req, res) => {
  res.render('auth/verify-otp', { error: null, showOtp: false });
};

// POST /verify-otp
exports.postVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.session.tempUserId;

    if (!userId) {
      return res.redirect('/signup');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.render('auth/verify-otp', { error: 'User not found.', showOtp: false });
    }

    if (user.otp !== otp) {
      return res.render('auth/verify-otp', { error: 'Invalid OTP. Please try again.', showOtp: false });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // If student, add to Student table
    if (user.role === 'user') {
      await Student.create({
        fullName: user.fullName,
        email: user.email,
        userId: user.id
      });
    }

    delete req.session.tempUserId;

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('auth/verify-otp', { error: 'Verification failed. Try again.', showOtp: false });
  }
};

// GET /login
exports.getLogin = (req, res) => {
  res.render('auth/login', { 
    error: null, 
    success: req.query.success || null 
  });
};

// POST /login
exports.postLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      return res.render('auth/login', { 
        error: 'Invalid email or account not verified.',
        success: null
      });
    }

    if (user.role !== role) {
      return res.render('auth/login', { 
        error: 'Incorrect role selected.',
        success: null
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'Invalid email or password.',
        success: null
      });
    }

    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    res.redirect(user.role === 'admin' ? '/admin/home' : '/user/home');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { 
      error: 'Login failed. Try again.',
      success: null
    });
  }
};

// GET /logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
};
