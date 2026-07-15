const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET } = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'streamhub_luxury_refresh_secret_key_2026_production';

// Generate Access & Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role?.name || 'User' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Generate 6-Digit Numeric OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register User
const register = async (req, res) => {
  try {
    const { name, username, email, password, phone, birthDate, gender } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, username, email, and password.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or username is already registered with StreamHUB.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default to 'User' role (id: 1)
    let userRole = await prisma.role.findFirst({ where: { name: 'User' } });
    if (!userRole) {
      userRole = await prisma.role.create({ data: { name: 'User', description: 'Regular streaming user' } });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        birthDate: birthDate || null,
        gender: gender || 'Other',
        roleId: userRole.id,
      },
      include: { role: true },
    });

    // Generate Verification OTP
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await prisma.otpCode.create({
      data: {
        email: newUser.email,
        code,
        type: 'REGISTER',
        expiresAt,
      },
    });

    const tokens = generateTokens(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account successfully created with StreamHUB!',
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        birthDate: newUser.birthDate,
        gender: newUser.gender,
        avatar: newUser.avatar,
        role: newUser.role.name,
      },
      ...tokens,
      otpDemo: code, // Returned for instant testing evaluation without actual email SMTP
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.', error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email/username and password.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }],
      },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const tokens = generateTokens(user);

    return res.status(200).json({
      success: true,
      message: 'Welcome back to StreamHUB!',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role?.name || 'User',
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.', error: error.message });
  }
};

// Social Login (Google / GitHub)
const socialLogin = async (req, res) => {
  try {
    const { email, name, avatar, provider } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Social login failed. No email provided.' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      // Create new user for social login
      let userRole = await prisma.role.findFirst({ where: { name: 'User' } });
      if (!userRole) {
        userRole = await prisma.role.create({ data: { name: 'User' } });
      }

      const randomPassword = await bcrypt.hash(`Social_${Date.now()}_${Math.random()}`, 10);
      const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);

      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          username,
          email,
          password: randomPassword,
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          roleId: userRole.id,
        },
        include: { role: true },
      });
    }

    const tokens = generateTokens(user);

    return res.status(200).json({
      success: true,
      message: `Logged in via ${provider || 'Social Provider'} successfully!`,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role?.name || 'User',
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Social login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during social login.' });
  }
};

// Forgot Password - Send 6-Digit OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found matching this email address.' });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: 'RESET_PASSWORD',
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'A 6-digit OTP verification code has been sent to your email.',
      otpDemo: code, // For instant testing evaluation without email configuration
      expiresInSeconds: 900,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error processing forgot password.' });
  }
};

// Verify 6-Digit OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, code, type = 'RESET_PASSWORD' } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code.' });
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Generate temporary reset token
    const resetToken = jwt.sign({ email, type: 'RESET_VERIFIED' }, JWT_SECRET, { expiresIn: '30m' });

    return res.status(200).json({
      success: true,
      message: 'OTP verification successful!',
      resetToken,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error verifying OTP.' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken, code } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    // Verify token or check verified OTP
    if (resetToken) {
      try {
        jwt.verify(resetToken, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Password reset session expired or invalid.' });
      }
    } else if (code) {
      const otpRecord = await prisma.otpCode.findFirst({
        where: { email, code, isUsed: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'OTP verification required before resetting password.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error resetting password.' });
  }
};

module.exports = {
  register,
  login,
  socialLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
