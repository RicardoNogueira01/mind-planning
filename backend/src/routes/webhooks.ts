// Clerk Webhook Handler
// Syncs user data from Clerk to our database

import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { config } from '../config/env';
import prisma from '../config/database';

const router = Router();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    deleted?: boolean;
  };
}

/**
 * Clerk Webhook Endpoint
 * Receives events when users are created, updated, or deleted in Clerk
 */
router.post('/clerk', async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify webhook signature
    const webhookSecret = config.clerk.webhookSecret;
    
    if (!webhookSecret) {
      console.warn('CLERK_WEBHOOK_SECRET not configured, skipping verification');
    } else {
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;
      
      if (!svixId || !svixTimestamp || !svixSignature) {
        res.status(400).json({ error: 'Missing Svix headers' });
        return;
      }
      
      const wh = new Webhook(webhookSecret);
      
      try {
        wh.verify(JSON.stringify(req.body), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        console.error('Webhook verification failed:', err);
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }
    }
    
    const event = req.body as ClerkWebhookEvent;
    const { type, data } = event;
    
    console.log(`Received Clerk webhook: ${type}`);
    
    switch (type) {
      case 'user.created': {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });
        
        if (existingUser) {
          console.log(`User ${data.id} already exists, skipping creation`);
          break;
        }
        
        // Get or create default organization
        let organization = await prisma.organization.findFirst({
          where: { slug: 'default' },
        });
        
        if (!organization) {
          organization = await prisma.organization.create({
            data: {
              name: 'Default Organization',
              slug: 'default',
              ownerId: '', // Will be updated
            },
          });
        }
        
        const newUser = await prisma.user.create({
          data: {
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address || '',
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
            avatar: data.image_url || undefined,
            organizationId: organization.id,
          },
        });
        
        // Update organization owner if empty
        if (!organization.ownerId) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: newUser.id },
          });
        }
        
        console.log(`Created user: ${newUser.email}`);
        break;
      }
      
      case 'user.updated': {
        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: {
            email: data.email_addresses?.[0]?.email_address,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
            avatar: data.image_url || undefined,
          },
        });
        
        console.log(`Updated user: ${data.id}`);
        break;
      }
      
      case 'user.deleted': {
        // Soft delete - mark as inactive
        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: { isActive: false },
        });
        
        console.log(`Deactivated user: ${data.id}`);
        break;
      }
      
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
