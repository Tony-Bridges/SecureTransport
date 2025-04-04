import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { generateToken } from '../middleware/auth';
import { InsertUser } from '@shared/schema';
import { emailService } from './email.service';
import jwt from 'jsonwebtoken';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface InviteUserData {
  email: string;
  name: string;
  role: string;
  invitedBy: {
    id: number;
    name: string;
  };
}

export interface InviteResponse {
  success: boolean;
  message: string;
  inviteToken?: string;
  expiresAt?: Date;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: {
    username: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<AuthResponse> {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await storage.createUser({
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'user'
    } as InsertUser);

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const user = await storage.getUserByUsername(credentials.username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  /**
   * Verify a token and get user
   */
  async verifyToken(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };
  }
  
  /**
   * Invite a new user to the platform
   */
  async inviteUser(inviteData: InviteUserData): Promise<InviteResponse> {
    // Generate invite token
    const JWT_SECRET = process.env.JWT_SECRET || 'securetransport-jwt-secret';
    const expiresIn = '7d'; // Token expires in 7 days
    
    const payload = {
      email: inviteData.email,
      name: inviteData.name,
      role: inviteData.role,
      invitedBy: inviteData.invitedBy.id,
      type: 'invitation'
    };
    
    try {
      // Create JWT token
      const inviteToken = jwt.sign(payload, JWT_SECRET, { expiresIn });
      
      // Calculate expiration date for display purposes
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      // Send invitation email
      const emailResult = await emailService.sendInvitation({
        email: inviteData.email,
        name: inviteData.name,
        role: inviteData.role,
        inviteToken,
        expiresIn: '7 days',
        invitedBy: inviteData.invitedBy.name
      });
      
      if (!emailResult.success) {
        return {
          success: false,
          message: `Failed to send invitation email: ${emailResult.error}`,
          inviteToken,
          expiresAt
        };
      }
      
      return {
        success: true,
        message: 'Invitation sent successfully',
        inviteToken,
        expiresAt
      };
    } catch (error) {
      console.error('Failed to create invitation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create invitation'
      };
    }
  }
  
  /**
   * Verify an invitation token
   */
  async verifyInvitationToken(token: string): Promise<{
    valid: boolean;
    email?: string;
    name?: string;
    role?: string;
    invitedBy?: number;
    error?: string;
  }> {
    const JWT_SECRET = process.env.JWT_SECRET || 'securetransport-jwt-secret';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
        name: string;
        role: string;
        invitedBy: number;
        type: string;
      };
      
      // Validate token type
      if (decoded.type !== 'invitation') {
        return { valid: false, error: 'Invalid token type' };
      }
      
      return {
        valid: true,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        invitedBy: decoded.invitedBy
      };
    } catch (error) {
      console.error('Invalid invitation token:', error);
      
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Invitation token has expired' };
      }
      
      return { valid: false, error: 'Invalid invitation token' };
    }
  }
  
  /**
   * Register a user from an invitation
   */
  async registerFromInvitation(
    token: string,
    userData: {
      username: string;
      password: string;
    }
  ): Promise<AuthResponse> {
    // Verify the invitation token
    const verification = await this.verifyInvitationToken(token);
    
    if (!verification.valid || !verification.email || !verification.name || !verification.role) {
      throw new Error(verification.error || 'Invalid invitation');
    }
    
    // Register the user with the data from the token
    return this.register({
      username: userData.username,
      password: userData.password,
      name: verification.name,
      role: verification.role
    });
  }
}

export const authService = new AuthService();