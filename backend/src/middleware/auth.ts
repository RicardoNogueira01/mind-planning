// Clerk Authentication Middleware for Express
// Verifies JWT tokens and attaches user to request

import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/backend';
import { config } from '../config/env';
import prisma from '../config/database';

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: config.clerk.secretKey,
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;       // Clerk user ID
        sessionId: string;    // Clerk session ID
        user?: {
          id: string;         // Our database user ID
          clerkId: string;
          email: string;
          name: string;
          role: string;
          organizationId: string;
        };
      };
    }
  }
}

/**
 * Middleware to verify Clerk JWT and attach auth info to request
 * Use this for protected routes
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify the token with Clerk
    const { sub: clerkUserId, sid: sessionId } = await clerk.verifyToken(token);
    
    if (!clerkUserId) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    // Get or create user in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });
    
    // If user doesn't exist in our DB, sync from Clerk
    if (!user) {
      const clerkUser = await clerk.users.getUser(clerkUserId);
      
      // Get or create default organization
      let organization = await prisma.organization.findFirst({
        where: { slug: 'default' },
      });
      
      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            name: 'Default Organization',
            slug: 'default',
            ownerId: '', // Will be updated after user creation
          },
        });
      }
      
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          avatar: clerkUser.imageUrl || undefined,
          organizationId: organization.id,
        },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });
      
      // Update organization owner if it was empty
      if (!organization.ownerId) {
        await prisma.organization.update({
          where: { id: organization.id },
          data: { ownerId: user.id },
        });
      }
    }
    
    // Attach auth info to request
    req.auth = {
      userId: clerkUserId,
      sessionId: sessionId || '',
      user,
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for public routes that behave differently for authenticated users
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    
    const { sub: clerkUserId, sid: sessionId } = await clerk.verifyToken(token);
    
    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });
      
      if (user) {
        req.auth = {
          userId: clerkUserId,
          sessionId: sessionId || '',
          user,
        };
      }
    }
    
    next();
  } catch {
    // Token invalid or expired, continue without auth
    next();
  }
}

/**
 * Role-based authorization middleware
 * Use after requireAuth to check user roles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth?.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!allowedRoles.includes(req.auth.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
}

/**
 * Export Clerk client for direct usage if needed
 */
export { clerk };
