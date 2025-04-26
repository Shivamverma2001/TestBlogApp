import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sgMail from '@sendgrid/mail';
import axios from 'axios';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email verification API configuration
const EMAIL_VERIFICATION_API_KEY = process.env.EMAIL_VERIFICATION_API_KEY;
const EMAIL_VERIFICATION_BASE_URL = 'https://api.emaillistverify.com/api';

// Configure axios for email verification API
const emailVerificationApi = axios.create({
  baseURL: EMAIL_VERIFICATION_BASE_URL,
  headers: {
    'accept': 'text/html'
  }
});

export const createUser = async (req, res) => {
  console.log("Creating user");
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Verify email deliverability
    try {
      const verificationResponse = await emailVerificationApi.get('/verifyEmail', {
        params: { 
          email: email,
          secret: EMAIL_VERIFICATION_API_KEY
        }
      });

      if (verificationResponse.data !== 'ok') {
        return res.status(400).json({ 
          message: "Invalid email address. Please provide a valid email address." 
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({ message: "Error verifying email address" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: "user",
      verificationToken,
      verificationTokenExpiry,
      isVerified: false
    });

    // Send verification email using SendGrid
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER, // Your verified sender in SendGrid
      subject: 'Verify your BlogApp email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to BlogApp!</h1>
          <p>Hi ${name},</p>
          <p>Thanks for signing up! Please verify your email address to get started:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    };

    await sgMail.send(msg);

    res.status(201).json({ 
      message: "User created successfully. Please check your email for verification.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: "Error verifying email" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send new verification email using SendGrid
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'Verify your BlogApp email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to BlogApp!</h1>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      `
    };

    await sgMail.send(msg);

    res.status(200).json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: "Error resending verification email" });
  }
};

export const logoutUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.status(200).json({ message: "Logged out successfully" });
};
