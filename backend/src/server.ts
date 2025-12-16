// Mind Planning Backend Server
// Express + Prisma + Clerk

import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import prisma from './config/database';
import { requireAuth, optionalAuth, requireRole } from './middleware/auth';
import webhooksRouter from './routes/webhooks';

const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies (except for webhooks which need raw body)
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/clerk') {
    // Webhooks need raw body for signature verification
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// ===========================================
// ROUTES
// ===========================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhooks (no auth required)
app.use('/api/webhooks', webhooksRouter);

// ===========================================
// PROTECTED API ROUTES
// ===========================================

// Get current user
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.user!.id },
      include: {
        organization: true,
        memberOfTeams: {
          include: { team: true },
        },
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update current user profile
app.patch('/api/me', requireAuth, async (req, res) => {
  try {
    const { initials, color, phone, location, department, jobTitle, bio, skills } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.auth!.user!.id },
      data: {
        initials,
        color,
        phone,
        location,
        department,
        jobTitle,
        bio,
        skills,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ===========================================
// USERS/MEMBERS ROUTES
// ===========================================

// Get all team members (users in same organization)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: req.auth!.user!.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        initials: true,
        color: true,
        role: true,
        department: true,
        jobTitle: true,
        location: true,
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get specific user profile
app.get('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Handle "me" as alias for current user
    const targetId = userId === 'me' ? req.auth!.user!.id : userId;
    
    const user = await prisma.user.findFirst({
      where: {
        id: targetId,
        organizationId: req.auth!.user!.organizationId,
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        memberOfTeams: {
          include: { team: { select: { id: true, name: true, color: true } } },
        },
        assignedNodes: {
          where: {
            status: { not: 'cancelled' },
          },
          select: {
            id: true,
            text: true,
            status: true,
            priority: true,
            dueDate: true,
            completedAt: true,
            mindMap: { select: { id: true, title: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        holidayRequests: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            assignedNodes: true,
            createdNodes: true,
            comments: true,
          },
        },
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Calculate stats
    const completedTasks = await prisma.node.count({
      where: { assigneeId: targetId, status: 'completed' },
    });
    
    const inProgressTasks = await prisma.node.count({
      where: { assigneeId: targetId, status: 'in_progress' },
    });
    
    const overdueTasks = await prisma.node.count({
      where: {
        assigneeId: targetId,
        status: { notIn: ['completed', 'cancelled'] },
        dueDate: { lt: new Date() },
      },
    });
    
    const totalAssigned = await prisma.node.count({
      where: { assigneeId: targetId },
    });
    
    // Get recent activity (last 10 completed tasks)
    const recentActivity = await prisma.node.findMany({
      where: { assigneeId: targetId },
      select: {
        id: true,
        text: true,
        status: true,
        updatedAt: true,
        mindMap: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    
    res.json({
      ...user,
      stats: {
        completed: completedTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
        total: totalAssigned,
        successRate: totalAssigned > 0 ? Math.round((completedTasks / totalAssigned) * 100) : 0,
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.status,
        task: activity.text,
        time: activity.updatedAt,
        project: activity.mindMap?.title || 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update specific user (admin only or self)
app.patch('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const isAdmin = req.auth!.user!.role === 'admin';
    const isSelf = userId === req.auth!.user!.id;
    
    if (!isAdmin && !isSelf) {
      res.status(403).json({ error: 'Not authorized to update this user' });
      return;
    }
    
    const { name, initials, color, phone, location, department, jobTitle, bio, skills, linkedinUrl, githubUrl, websiteUrl } = req.body;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        initials,
        color,
        phone,
        location,
        department,
        jobTitle,
        bio,
        skills,
        linkedinUrl,
        githubUrl,
        websiteUrl,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ===========================================
// MINDMAPS ROUTES
// ===========================================

// Get all mindmaps for current user
app.get('/api/mindmaps', requireAuth, async (req, res) => {
  try {
    const mindMaps = await prisma.mindMap.findMany({
      where: {
        OR: [
          { createdById: req.auth!.user!.id },
          { sharedWithUsers: { some: { userId: req.auth!.user!.id } } },
          { isPublic: true },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        nodes: { select: { id: true, text: true, status: true, priority: true } },
        _count: { select: { nodes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    res.json(mindMaps);
  } catch (error) {
    console.error('Error fetching mindmaps:', error);
    res.status(500).json({ error: 'Failed to fetch mindmaps' });
  }
});

// Get single mindmap
app.get('/api/mindmaps/:id', requireAuth, async (req, res) => {
  try {
    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { createdById: req.auth!.user!.id },
          { sharedWithUsers: { some: { userId: req.auth!.user!.id } } },
          { isPublic: true },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        nodes: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            comments: { include: { author: { select: { id: true, name: true, avatar: true } } } },
          },
        },
        connections: true,
      },
    });
    
    if (!mindMap) {
      res.status(404).json({ error: 'MindMap not found' });
      return;
    }
    
    res.json(mindMap);
  } catch (error) {
    console.error('Error fetching mindmap:', error);
    res.status(500).json({ error: 'Failed to fetch mindmap' });
  }
});

// Create mindmap
app.post('/api/mindmaps', requireAuth, async (req, res) => {
  try {
    const { title, description, color, projectId } = req.body;
    
    const mindMap = await prisma.mindMap.create({
      data: {
        title,
        description,
        color,
        projectId,
        createdById: req.auth!.user!.id,
      },
    });
    
    res.status(201).json(mindMap);
  } catch (error) {
    console.error('Error creating mindmap:', error);
    res.status(500).json({ error: 'Failed to create mindmap' });
  }
});

// Update mindmap
app.patch('/api/mindmaps/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, color, isFavorite, isPublic } = req.body;
    
    // Check ownership
    const existing = await prisma.mindMap.findFirst({
      where: { id: req.params.id, createdById: req.auth!.user!.id },
    });
    
    if (!existing) {
      res.status(404).json({ error: 'MindMap not found or access denied' });
      return;
    }
    
    const mindMap = await prisma.mindMap.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        color,
        isFavorite,
        isPublic,
        lastModifiedById: req.auth!.user!.id,
      },
    });
    
    res.json(mindMap);
  } catch (error) {
    console.error('Error updating mindmap:', error);
    res.status(500).json({ error: 'Failed to update mindmap' });
  }
});

// Delete mindmap
app.delete('/api/mindmaps/:id', requireAuth, async (req, res) => {
  try {
    // Check ownership
    const existing = await prisma.mindMap.findFirst({
      where: { id: req.params.id, createdById: req.auth!.user!.id },
    });
    
    if (!existing) {
      res.status(404).json({ error: 'MindMap not found or access denied' });
      return;
    }
    
    await prisma.mindMap.delete({ where: { id: req.params.id } });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting mindmap:', error);
    res.status(500).json({ error: 'Failed to delete mindmap' });
  }
});

// ===========================================
// NODES ROUTES
// ===========================================

// Create node in mindmap
app.post('/api/mindmaps/:mindMapId/nodes', requireAuth, async (req, res) => {
  try {
    const { text, x, y, bgColor, fontColor, shapeType, emoji, status, priority, parentId } = req.body;
    
    // Get mindmap's project
    const mindMap = await prisma.mindMap.findUnique({
      where: { id: req.params.mindMapId },
      select: { projectId: true },
    });
    
    const node = await prisma.node.create({
      data: {
        text,
        x: x || 0,
        y: y || 0,
        bgColor,
        fontColor,
        shapeType,
        emoji,
        status: status || 'not_started',
        priority: priority || 'medium',
        parentId,
        mindMapId: req.params.mindMapId,
        projectId: mindMap?.projectId,
        createdById: req.auth!.user!.id,
      },
    });
    
    res.status(201).json(node);
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// Update node
app.patch('/api/nodes/:id', requireAuth, async (req, res) => {
  try {
    const node = await prisma.node.update({
      where: { id: req.params.id },
      data: req.body,
    });
    
    res.json(node);
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// Delete node
app.delete('/api/nodes/:id', requireAuth, async (req, res) => {
  try {
    await prisma.node.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// ===========================================
// CONNECTIONS ROUTES
// ===========================================

// Create connection
app.post('/api/mindmaps/:mindMapId/connections', requireAuth, async (req, res) => {
  try {
    const { fromId, toId, label, style, color } = req.body;
    
    const connection = await prisma.nodeConnection.create({
      data: {
        fromId,
        toId,
        label,
        style,
        color,
        mindMapId: req.params.mindMapId,
      },
    });
    
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Delete connection
app.delete('/api/connections/:id', requireAuth, async (req, res) => {
  try {
    await prisma.nodeConnection.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// ===========================================
// ADMIN ROUTES
// ===========================================

// Get all users (admin only)
app.get('/api/admin/users', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===========================================
// START SERVER
// ===========================================

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Start server
    app.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();

export default app;
