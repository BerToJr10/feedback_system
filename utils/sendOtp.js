const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mansinghlayo10@gmail.com',
    pass: 'ybce jtmp ylwo cggi',
  },
});

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `Feedback System <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Feedback System OTP Code',
    html: `
      <h2>Verify Your Email</h2>
      <p>Use the following OTP to complete your signup:</p>
      <h3 style="color: blue;">${otp}</h3>
      <p>This code will expire in 5 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
  }
}

module.exports = sendOtpEmail;
