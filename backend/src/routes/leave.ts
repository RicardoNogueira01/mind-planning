/**
 * Leave/Holiday Routes
 * 
 * API endpoints for leave management (US-2.1.1, US-2.1.2, US-2.2.1, US-2.2.2)
 */

import express from 'express';
import LeaveService from '../services/leaveService';

const router = express.Router();

// ============================================
// MIDDLEWARE
// ============================================

const requireAuth = async (req: any, res: any, next: any) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    } catch (error) {
        console.error('[LeaveRoutes] Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// LEAVE TYPES
// ============================================

/**
 * GET /api/leave/types
 * Get all leave types
 */
router.get('/types', requireAuth, async (req: any, res) => {
    try {
        const organizationId = req.query.organizationId as string;
        const types = await LeaveService.getLeaveTypes(organizationId);
        res.json({ success: true, types });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get types error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/leave/types/defaults
 * Create default leave types
 */
router.post('/types/defaults', requireAuth, async (req: any, res) => {
    try {
        const types = await LeaveService.createDefaultLeaveTypes();
        res.json({ success: true, types });
    } catch (error: any) {
        console.error('[LeaveRoutes] Create defaults error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// LEAVE BALANCES
// ============================================

/**
 * GET /api/leave/balances
 * Get user's leave balances
 */
router.get('/balances', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const year = req.query.year ? parseInt(req.query.year as string) : undefined;

        const balances = await LeaveService.getUserBalances(userId, year);
        res.json({ success: true, balances });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get balances error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leave/balances/:userId
 * Get specific user's leave balances (for managers)
 */
router.get('/balances/:userId', requireAuth, async (req: any, res) => {
    try {
        const { userId } = req.params;
        const year = req.query.year ? parseInt(req.query.year as string) : undefined;

        const balances = await LeaveService.getUserBalances(userId, year);
        res.json({ success: true, balances });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get user balances error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// LEAVE REQUESTS
// ============================================

/**
 * POST /api/leave/requests
 * Create a new leave request
 */
router.post('/requests', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const { leaveTypeId, startDate, endDate, reason, isHalfDayStart, isHalfDayEnd } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const request = await LeaveService.createLeaveRequest({
            userId,
            leaveTypeId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            isHalfDayStart,
            isHalfDayEnd
        });

        res.status(201).json({ success: true, request });
    } catch (error: any) {
        console.error('[LeaveRoutes] Create request error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/leave/requests
 * Get user's leave requests
 */
router.get('/requests', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const status = req.query.status as any;

        const requests = await LeaveService.getUserRequests(userId, status);
        res.json({ success: true, requests });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get requests error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leave/requests/pending
 * Get pending requests for manager approval
 */
router.get('/requests/pending', requireAuth, async (req: any, res) => {
    try {
        const managerId = req.auth?.userId;
        const requests = await LeaveService.getPendingRequestsForManager(managerId);
        res.json({ success: true, requests });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get pending error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/leave/requests/:id/approve
 * Approve a leave request
 */
router.post('/requests/:id/approve', requireAuth, async (req: any, res) => {
    try {
        const reviewerId = req.auth?.userId;
        const { id } = req.params;
        const { notes } = req.body;

        const request = await LeaveService.approveRequest(id, reviewerId, notes);
        res.json({ success: true, request });
    } catch (error: any) {
        console.error('[LeaveRoutes] Approve error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/leave/requests/:id/reject
 * Reject a leave request
 */
router.post('/requests/:id/reject', requireAuth, async (req: any, res) => {
    try {
        const reviewerId = req.auth?.userId;
        const { id } = req.params;
        const { notes } = req.body;

        const request = await LeaveService.rejectRequest(id, reviewerId, notes);
        res.json({ success: true, request });
    } catch (error: any) {
        console.error('[LeaveRoutes] Reject error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/leave/requests/:id/cancel
 * Cancel a leave request
 */
router.post('/requests/:id/cancel', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;
        const { reason } = req.body;

        const request = await LeaveService.cancelRequest(id, userId, reason);
        res.json({ success: true, request });
    } catch (error: any) {
        console.error('[LeaveRoutes] Cancel error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/leave/requests/batch-approve
 * Batch approve multiple requests
 */
router.post('/requests/batch-approve', requireAuth, async (req: any, res) => {
    try {
        const reviewerId = req.auth?.userId;
        const { requestIds } = req.body;

        if (!requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({ error: 'requestIds array is required' });
        }

        const results = await LeaveService.batchApprove(requestIds, reviewerId);
        res.json({ success: true, results });
    } catch (error: any) {
        console.error('[LeaveRoutes] Batch approve error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CALENDAR & STATS
// ============================================

/**
 * GET /api/leave/calendar
 * Get team calendar for a month
 */
router.get('/calendar', requireAuth, async (req: any, res) => {
    try {
        const managerId = req.auth?.userId;
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

        const calendar = await LeaveService.getTeamCalendar(managerId, year, month);
        res.json({ success: true, calendar });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get calendar error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leave/whos-out
 * Get who's out today/this week
 */
router.get('/whos-out', requireAuth, async (req: any, res) => {
    try {
        const managerId = req.query.team === 'true' ? req.auth?.userId : undefined;
        const data = await LeaveService.getWhosOut(managerId);
        res.json({ success: true, ...data });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get whos out error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leave/stats
 * Get leave stats for current user
 */
router.get('/stats', requireAuth, async (req: any, res) => {
    try {
        const userId = req.auth?.userId;
        const stats = await LeaveService.getUserStats(userId);
        res.json({ success: true, stats });
    } catch (error: any) {
        console.error('[LeaveRoutes] Get stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
