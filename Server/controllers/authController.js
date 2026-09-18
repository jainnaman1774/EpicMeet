const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const { sendOtpEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// ==========================================
// REGISTER USER
// ==========================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate request body
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Generate password salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
    });

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Save OTP in database
    await OTP.create({
      email,
      otp,
      action: 'account_verification',
    });

    // Send OTP email
    await sendOtpEmail(
      email,
      otp,
      'account_verification'
    );

    // Send response
    return res.status(201).json({
      message:
        'User registered successfully. Please verify your email using the OTP sent.',
      email: user.email,
    });

  } catch (error) {
    console.error('Register Error:', error);

    return res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // User doesn't exist
    if (!user) {
      return res.status(400).json({
        message:
          'Invalid credentials. Please Sign Up first',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    // Check email verification
    if (!user.isVerified && user.role === 'user') {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Delete previous OTP
      await OTP.deleteMany({
        email,
        action: 'account_verification',
      });

      // Create new OTP
      await OTP.create({
        email,
        otp,
        action: 'account_verification',
      });

      // Send OTP
      await sendOtpEmail(
        email,
        otp,
        'account_verification'
      );

      return res.status(400).json({
        error:
          'Account not verified. A new OTP has been sent to your email.',
      });
    }

    // Generate token
    const token = generateToken(
      user._id,
      user.role
    );

    // Login successful
    return res.status(200).json({
      message: 'Login successful',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
};

// ==========================================
// VERIFY OTP
// ==========================================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate request
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      action: 'account_verification',
    });

    // OTP doesn't exist
    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    // Verify user
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // User doesn't exist
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Delete used OTP
    await OTP.deleteMany({
      email,
      action: 'account_verification',
    });

    // Generate token
    const token = generateToken(
      user._id,
      user.role
    );

    // Response
    return res.status(200).json({
      message: 'Account verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);

    return res.status(500).json({
      message: 'OTP verification failed',
      error: error.message,
    });
  }
};
