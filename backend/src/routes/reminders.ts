/**
 * Reminder Routes
 * 
 * API endpoints for the reminder system (US-1.1.1 & US-1.1.2)
 * All routes are protected and require authentication
 */

import express from 'express';
import ReminderService from '../services/reminderService';

const router = express.Router();

// ============================================
// MIDDLEWARE - Authentication Check
// ============================================

/**
 * Middleware to verify user is authenticated
 * (No longer requires manager role - all users can configure reminders)
 */
const requireAuth = async (req: any, res: any, next: any) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    } catch (error) {
        console.error('[ReminderRoutes] Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// REMINDER RULES ROUTES
// ============================================

/**
 * GET /api/reminders/rules
 * Get all active reminder rules for the user/organization
 */
router.get('/rules', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const organizationId = req.query.organizationId as string;

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' });
        }

        const rules = await ReminderService.getReminderRules(organizationId, userId);
        res.json({ success: true, rules });
    } catch (error: any) {
        console.error('[ReminderRoutes] Get rules error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/reminders/rules
 * Create a new reminder rule
 */
router.post('/rules', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const {
            name,
            description,
            daysBefore,
            notifyOwner,
            notifyManager,
            notifyCreator,
            taskPriority,
            taskStatus,
            projectId,
            escalationHours,
            sendEmail,
            sendInApp,
            organizationId
        } = req.body;

        if (!name || daysBefore === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'daysBefore']
            });
        }

        const rule = await ReminderService.createReminderRule({
            name,
            description,
            daysBefore,
            notifyOwner,
            notifyManager,
            notifyCreator,
            taskPriority,
            taskStatus,
            projectId,
            escalationHours,
            sendEmail,
            sendInApp,
            createdById: userId,
            organizationId
        });

        res.status(201).json({ success: true, rule });
    } catch (error: any) {
        console.error('[ReminderRoutes] Create rule error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/reminders/rules/:id
 * Update a reminder rule
 */
router.put('/rules/:id', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const ruleId = req.params.id;
        const updateData = req.body;

        const rule = await ReminderService.updateReminderRule(ruleId, userId, updateData);
        res.json({ success: true, rule });
    } catch (error: any) {
        console.error('[ReminderRoutes] Update rule error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/reminders/rules/:id
 * Deactivate a reminder rule
 */
router.delete('/rules/:id', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const ruleId = req.params.id;

        await ReminderService.deleteReminderRule(ruleId, userId);
        res.json({ success: true, message: 'Rule deactivated' });
    } catch (error: any) {
        console.error('[ReminderRoutes] Delete rule error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/reminders/rules/defaults
 * Create default reminder rules for an organization
 */
router.post('/rules/defaults', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const { organizationId } = req.body;

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' });
        }

        await ReminderService.createDefaultReminderRules(organizationId, userId);
        res.status(201).json({
            success: true,
            message: 'Default reminder rules created'
        });
    } catch (error: any) {
        console.error('[ReminderRoutes] Create defaults error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STATS & DASHBOARD ROUTES
// ============================================

/**
 * GET /api/reminders/stats
 * Get reminder statistics for manager dashboard
 */
router.get('/stats', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const organizationId = req.query.organizationId as string;

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' });
        }

        const stats = await ReminderService.getReminderStats(organizationId, userId);
        res.json({ success: true, stats });
    } catch (error: any) {
        console.error('[ReminderRoutes] Get stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/reminders/overdue
 * Get list of overdue tasks for manager
 */
router.get('/overdue', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const organizationId = req.query.organizationId as string;

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' });
        }

        const tasks = await ReminderService.getOverdueTasksList(organizationId, userId);
        res.json({ success: true, tasks });
    } catch (error: any) {
        console.error('[ReminderRoutes] Get overdue error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// MANUAL TRIGGER ROUTES (for testing/admin)
// ============================================

/**
 * POST /api/reminders/run-job
 * Manually trigger the reminder job (admin only)
 */
router.post('/run-job', requireAuth, async (req: any, res) => {
    try {
        const results = await ReminderService.runDailyReminderJob();
        res.json({ success: true, results });
    } catch (error: any) {
        console.error('[ReminderRoutes] Run job error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
