/**
 * Leave/Holiday Management Service
 * 
 * Handles all business logic for leave requests, balances, and approvals
 * US-2.1.1, US-2.1.2, US-2.2.1, US-2.2.2
 */

import { PrismaClient, HolidayStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

interface CreateLeaveRequestInput {
    userId: string;
    leaveTypeId?: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
    isHalfDayStart?: boolean;
    isHalfDayEnd?: boolean;
}

interface LeaveStats {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    totalDaysUsed: number;
    totalDaysPending: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate business days between two dates (excluding weekends)
 */
function calculateBusinessDays(startDate: Date, endDate: Date, isHalfDayStart = false, isHalfDayEnd = false): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    // Adjust for half days
    if (isHalfDayStart && count > 0) count -= 0.5;
    if (isHalfDayEnd && count > 0) count -= 0.5;

    return count;
}

/**
 * Check if date ranges overlap
 */
function datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 <= end2 && end1 >= start2;
}

// ============================================
// LEAVE TYPE MANAGEMENT
// ============================================

const LeaveService = {
    /**
     * Get all leave types
     */
    async getLeaveTypes(organizationId?: string) {
        return prisma.leaveType.findMany({
            where: {
                isActive: true,
                OR: [
                    { organizationId: null },
                    { organizationId: organizationId }
                ]
            },
            orderBy: { sortOrder: 'asc' }
        });
    },

    /**
     * Create default leave types for an organization
     */
    async createDefaultLeaveTypes() {
        const defaults = [
            { code: 'ANNUAL', name: 'Annual Leave', color: '#3B82F6', icon: '🏖️', defaultDays: 22, requiresApproval: true, canCarryOver: true, maxCarryOver: 5, sortOrder: 1 },
            { code: 'SICK', name: 'Sick Leave', color: '#EF4444', icon: '🤒', defaultDays: 10, requiresApproval: true, autoApprove: true, sortOrder: 2 },
            { code: 'PERSONAL', name: 'Personal Day', color: '#8B5CF6', icon: '🏠', defaultDays: 3, requiresApproval: true, sortOrder: 3 },
            { code: 'BEREAVEMENT', name: 'Bereavement', color: '#6B7280', icon: '🕯️', defaultDays: 5, requiresApproval: false, autoApprove: true, sortOrder: 4 },
            { code: 'PARENTAL', name: 'Parental Leave', color: '#EC4899', icon: '👶', defaultDays: 0, requiresApproval: true, isPaidLeave: true, minNoticeDays: 30, sortOrder: 5 },
            { code: 'UNPAID', name: 'Unpaid Leave', color: '#9CA3AF', icon: '📋', defaultDays: 0, requiresApproval: true, isPaidLeave: false, sortOrder: 6 },
        ];

        for (const type of defaults) {
            await prisma.leaveType.upsert({
                where: { code: type.code },
                update: type,
                create: type
            });
        }

        return this.getLeaveTypes();
    },

    // ============================================
    // LEAVE BALANCE MANAGEMENT
    // ============================================

    /**
     * Get or create leave balance for a user
     */
    async getOrCreateBalance(userId: string, leaveTypeId: string, year?: number) {
        const targetYear = year || new Date().getFullYear();

        let balance = await prisma.leaveBalance.findUnique({
            where: {
                userId_leaveTypeId_year: {
                    userId,
                    leaveTypeId,
                    year: targetYear
                }
            },
            include: { leaveType: true }
        });

        if (!balance) {
            const leaveType = await prisma.leaveType.findUnique({
                where: { id: leaveTypeId }
            });

            if (!leaveType) {
                throw new Error('Leave type not found');
            }

            // Check for carry-over from previous year
            let carriedOver = 0;
            if (leaveType.canCarryOver) {
                const prevBalance = await prisma.leaveBalance.findUnique({
                    where: {
                        userId_leaveTypeId_year: {
                            userId,
                            leaveTypeId,
                            year: targetYear - 1
                        }
                    }
                });

                if (prevBalance) {
                    const available = prevBalance.totalDays + prevBalance.carriedOver - prevBalance.usedDays + prevBalance.adjustments;
                    carriedOver = Math.min(available, leaveType.maxCarryOver || available);
                }
            }

            balance = await prisma.leaveBalance.create({
                data: {
                    userId,
                    leaveTypeId,
                    year: targetYear,
                    totalDays: leaveType.defaultDays,
                    carriedOver
                },
                include: { leaveType: true }
            });
        }

        return balance;
    },

    /**
     * Get all balances for a user
     */
    async getUserBalances(userId: string, year?: number) {
        const targetYear = year || new Date().getFullYear();
        const leaveTypes = await this.getLeaveTypes();

        const balances = await Promise.all(
            leaveTypes.map(lt => this.getOrCreateBalance(userId, lt.id, targetYear))
        );

        return balances.map(b => ({
            ...b,
            available: b.totalDays + b.carriedOver - b.usedDays + b.adjustments,
            pending: b.pendingDays
        }));
    },

    /**
     * Update balance when leave is approved/cancelled
     */
    async updateBalance(userId: string, leaveTypeId: string, days: number, action: 'approve' | 'cancel' | 'submit') {
        const year = new Date().getFullYear();
        const balance = await this.getOrCreateBalance(userId, leaveTypeId, year);

        if (action === 'approve') {
            await prisma.leaveBalance.update({
                where: { id: balance.id },
                data: {
                    usedDays: { increment: days },
                    pendingDays: { decrement: days }
                }
            });
        } else if (action === 'cancel') {
            await prisma.leaveBalance.update({
                where: { id: balance.id },
                data: {
                    pendingDays: { decrement: days }
                }
            });
        } else if (action === 'submit') {
            await prisma.leaveBalance.update({
                where: { id: balance.id },
                data: {
                    pendingDays: { increment: days }
                }
            });
        }
    },

    // ============================================
    // LEAVE REQUEST MANAGEMENT
    // ============================================

    /**
     * Create a new leave request
     */
    async createLeaveRequest(input: CreateLeaveRequestInput) {
        const { userId, leaveTypeId, startDate, endDate, reason, isHalfDayStart, isHalfDayEnd } = input;

        // Calculate business days
        const totalDays = calculateBusinessDays(
            new Date(startDate),
            new Date(endDate),
            isHalfDayStart,
            isHalfDayEnd
        );

        if (totalDays <= 0) {
            throw new Error('Invalid date range: no business days selected');
        }

        // Check for conflicts with existing approved/pending requests
        const existingRequests = await prisma.holidayRequest.findMany({
            where: {
                userId,
                status: { in: ['pending', 'approved'] },
                OR: [
                    {
                        startDate: { lte: new Date(endDate) },
                        endDate: { gte: new Date(startDate) }
                    }
                ]
            }
        });

        if (existingRequests.length > 0) {
            throw new Error('You already have a leave request for these dates');
        }

        // Check balance if leave type specified
        if (leaveTypeId) {
            const balance = await this.getOrCreateBalance(userId, leaveTypeId);
            const available = balance.totalDays + balance.carriedOver - balance.usedDays - balance.pendingDays + balance.adjustments;

            if (totalDays > available) {
                throw new Error(`Insufficient balance. You have ${available} days available but requested ${totalDays} days.`);
            }
        }

        // Check if auto-approve
        let status: HolidayStatus = 'pending';
        let reviewedAt = null;

        if (leaveTypeId) {
            const leaveType = await prisma.leaveType.findUnique({
                where: { id: leaveTypeId }
            });
            if (leaveType?.autoApprove) {
                status = 'approved';
                reviewedAt = new Date();
            }
        }

        // Create the request
        const request = await prisma.holidayRequest.create({
            data: {
                userId,
                leaveTypeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalDays,
                reason,
                isHalfDayStart: isHalfDayStart || false,
                isHalfDayEnd: isHalfDayEnd || false,
                status,
                reviewedAt,
                submittedAt: new Date()
            },
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                leaveType: true
            }
        });

        // Update pending balance
        if (leaveTypeId) {
            await this.updateBalance(userId, leaveTypeId, totalDays, status === 'approved' ? 'approve' : 'submit');
        }

        // Create notification for manager
        await this.notifyManagerOfNewRequest(request);

        return request;
    },

    /**
     * Get leave requests for a user
     */
    async getUserRequests(userId: string, status?: HolidayStatus) {
        return prisma.holidayRequest.findMany({
            where: {
                userId,
                ...(status && { status })
            },
            include: {
                leaveType: true,
                reviewedBy: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    /**
     * Get pending requests for a manager
     */
    async getPendingRequestsForManager(managerId: string) {
        // Get teams where this user is manager
        const teams = await prisma.team.findMany({
            where: { managerId },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });

        const teamMemberIds = teams.flatMap(t => t.members.map(m => m.userId));
        const uniqueMemberIds = [...new Set(teamMemberIds)];

        return prisma.holidayRequest.findMany({
            where: {
                userId: { in: uniqueMemberIds },
                status: 'pending'
            },
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true, initials: true, color: true } },
                leaveType: true
            },
            orderBy: { createdAt: 'asc' }
        });
    },

    /**
     * Approve a leave request
     */
    async approveRequest(requestId: string, reviewerId: string, notes?: string) {
        const request = await prisma.holidayRequest.findUnique({
            where: { id: requestId },
            include: { leaveType: true }
        });

        if (!request) {
            throw new Error('Request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Request is not pending');
        }

        const updated = await prisma.holidayRequest.update({
            where: { id: requestId },
            data: {
                status: 'approved',
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                reviewNotes: notes
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                leaveType: true
            }
        });

        // Update balance: move from pending to used
        if (request.leaveTypeId) {
            await this.updateBalance(request.userId, request.leaveTypeId, request.totalDays, 'approve');
        }

        // Notify user
        await this.notifyUserOfDecision(updated, 'approved');

        return updated;
    },

    /**
     * Reject a leave request
     */
    async rejectRequest(requestId: string, reviewerId: string, notes?: string) {
        const request = await prisma.holidayRequest.findUnique({
            where: { id: requestId },
            include: { leaveType: true }
        });

        if (!request) {
            throw new Error('Request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Request is not pending');
        }

        const updated = await prisma.holidayRequest.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                reviewNotes: notes
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                leaveType: true
            }
        });

        // Update balance: remove from pending
        if (request.leaveTypeId) {
            await this.updateBalance(request.userId, request.leaveTypeId, request.totalDays, 'cancel');
        }

        // Notify user
        await this.notifyUserOfDecision(updated, 'rejected');

        return updated;
    },

    /**
     * Cancel a leave request
     */
    async cancelRequest(requestId: string, userId: string, reason?: string) {
        const request = await prisma.holidayRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error('Request not found');
        }

        if (request.userId !== userId) {
            throw new Error('You can only cancel your own requests');
        }

        if (request.status === 'cancelled') {
            throw new Error('Request is already cancelled');
        }

        // Can only cancel pending requests, or approved requests if they haven't started
        if (request.status === 'approved' && new Date(request.startDate) <= new Date()) {
            throw new Error('Cannot cancel a leave that has already started');
        }

        const updated = await prisma.holidayRequest.update({
            where: { id: requestId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelReason: reason
            }
        });

        // Update balance
        if (request.leaveTypeId) {
            if (request.status === 'pending') {
                await this.updateBalance(request.userId, request.leaveTypeId, request.totalDays, 'cancel');
            } else if (request.status === 'approved') {
                // Restore the days
                await prisma.leaveBalance.updateMany({
                    where: {
                        userId: request.userId,
                        leaveTypeId: request.leaveTypeId,
                        year: new Date().getFullYear()
                    },
                    data: {
                        usedDays: { decrement: request.totalDays }
                    }
                });
            }
        }

        return updated;
    },

    /**
     * Batch approve multiple requests
     */
    async batchApprove(requestIds: string[], reviewerId: string) {
        const results = await Promise.all(
            requestIds.map(id => this.approveRequest(id, reviewerId).catch(e => ({ id, error: e.message })))
        );
        return results;
    },

    // ============================================
    // CALENDAR & STATS
    // ============================================

    /**
     * Get team calendar data for a given month
     */
    async getTeamCalendar(managerId: string, year: number, month: number) {
        // Get teams where this user is manager
        const teams = await prisma.team.findMany({
            where: { managerId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatar: true, initials: true, color: true } } }
                }
            }
        });

        const teamMemberIds = teams.flatMap(t => t.members.map(m => m.userId));
        const uniqueMemberIds = [...new Set(teamMemberIds)];

        // Get start and end of month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        // Get all approved and pending requests
        const requests = await prisma.holidayRequest.findMany({
            where: {
                userId: { in: uniqueMemberIds },
                status: { in: ['approved', 'pending'] },
                OR: [
                    {
                        startDate: { lte: endOfMonth },
                        endDate: { gte: startOfMonth }
                    }
                ]
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, initials: true, color: true } },
                leaveType: true
            }
        });

        return {
            year,
            month,
            requests,
            teamMembers: teams.flatMap(t => t.members.map(m => m.user))
        };
    },

    /**
     * Get who's out today/this week
     */
    async getWhosOut(managerId?: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

        let userFilter = {};

        if (managerId) {
            const teams = await prisma.team.findMany({
                where: { managerId },
                include: { members: true }
            });
            const teamMemberIds = teams.flatMap(t => t.members.map(m => m.userId));
            userFilter = { userId: { in: teamMemberIds } };
        }

        const outToday = await prisma.holidayRequest.findMany({
            where: {
                ...userFilter,
                status: 'approved',
                startDate: { lte: today },
                endDate: { gte: today }
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, initials: true, color: true } },
                leaveType: true
            }
        });

        const outThisWeek = await prisma.holidayRequest.findMany({
            where: {
                ...userFilter,
                status: 'approved',
                startDate: { lte: endOfWeek },
                endDate: { gte: today }
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, initials: true, color: true } },
                leaveType: true
            }
        });

        return { outToday, outThisWeek };
    },

    /**
     * Get leave stats for a user
     */
    async getUserStats(userId: string): Promise<LeaveStats> {
        const requests = await prisma.holidayRequest.findMany({
            where: { userId }
        });

        return {
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length,
            totalDaysUsed: requests.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.totalDays, 0),
            totalDaysPending: requests.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.totalDays, 0)
        };
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================

    async notifyManagerOfNewRequest(request: any) {
        // Find user's manager(s)
        const userTeams = await prisma.teamMember.findMany({
            where: { userId: request.userId },
            include: { team: { include: { manager: true } } }
        });

        const managers = userTeams.map(tm => tm.team.manager);

        for (const manager of managers) {
            await prisma.notification.create({
                data: {
                    type: 'system',
                    title: 'New Leave Request',
                    message: `${request.user.name} has submitted a ${request.leaveType?.name || 'leave'} request from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}`,
                    userId: manager.id,
                    triggeredById: request.userId,
                    actionUrl: '/team-holidays'
                }
            });
        }
    },

    async notifyUserOfDecision(request: any, decision: 'approved' | 'rejected') {
        await prisma.notification.create({
            data: {
                type: decision === 'approved' ? 'holiday_approved' : 'holiday_rejected',
                title: `Leave Request ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
                message: `Your ${request.leaveType?.name || 'leave'} request from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been ${decision}. ${request.reviewNotes ? `Note: ${request.reviewNotes}` : ''}`,
                userId: request.userId,
                triggeredById: request.reviewedById,
                actionUrl: '/profile/holidays'
            }
        });
    }
};

export default LeaveService;
