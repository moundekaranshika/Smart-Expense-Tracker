import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_expense_tracker_secret_fallback_2026';
const TOKEN_EXPIRE = '7d';

// Generate JWT token helper
const generateToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      res.status(400).json({ message: 'Please provide all required fields.' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    // Hash password & security answer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    const token = generateToken(user.id || user._id || '', user.email);

    res.status(201).json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        securityQuestion: user.securityQuestion
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
}

// @desc    User Login
// @route   POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id || user._id || '', user.email);

    res.status(200).json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        securityQuestion: user.securityQuestion
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
}

// @desc    Get user's security question
// @route   POST /api/auth/forgot-password-question
export async function getSecurityQuestion(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Please provide email address.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No user found with this email address.' });
      return;
    }

    res.status(200).json({
      securityQuestion: user.securityQuestion || 'What is your favorite color?'
    });
  } catch (error) {
    console.error('Security Question Fetch Error:', error);
    res.status(500).json({ message: 'Error retrieving security details.' });
  }
}

// @desc    Reset password via security question
// @route   POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      res.status(400).json({ message: 'Please provide email, security answer and new password.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No user found.' });
      return;
    }

    // Verify security answer
    const isAnswerMatch = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer || ''
    );

    if (!isAnswerMatch) {
      res.status(400).json({ message: 'Incorrect answer to the security question.' });
      return;
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user.id || user._id || '', { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
}

// @desc    Change Password (Authenticated)
// @route   PUT /api/auth/change-password
export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect current password.' });
      return;
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Error updating password.' });
  }
}
