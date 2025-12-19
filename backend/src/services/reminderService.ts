/**
 * Reminder Service
 * 
 * Handles all reminder and overdue alert logic for US-1.1.1 and US-1.1.2
 * This service is responsible for:
 * - Checking tasks approaching deadlines
 * - Detecting overdue tasks
 * - Sending notifications (in-app and email)
 * - Managing reminder rules
 * - Escalation logic for managers
 */

import { PrismaClient, TaskStatus, TaskPriority, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

interface ReminderRuleCreate {
    name: string;
    description?: string;
    daysBefore: number;
    notifyOwner?: boolean;
    notifyManager?: boolean;
    notifyCreator?: boolean;
    taskPriority?: TaskPriority;
    taskStatus?: TaskStatus;
    projectId?: string;
    escalationHours?: number;
    sendEmail?: boolean;
    sendInApp?: boolean;
    createdById: string;
    organizationId?: string;
}

interface TaskWithDeadline {
    id: string;
    text: string;
    dueDate: Date;
    assigneeId: string | null;
    createdById: string;
    projectId: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    mindMap: {
        id: string;
        title: string;
    };
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

/**
 * Check if user has manager role or above
 */
export async function isManagerOrAbove(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user) return false;

    const managerRoles: UserRole[] = ['admin', 'team_manager'];
    return managerRoles.includes(user.role);
}

/**
 * Validate manager access for reminder rules
 */
export async function validateManagerAccess(userId: string): Promise<void> {
    const hasAccess = await isManagerOrAbove(userId);
    if (!hasAccess) {
        throw new Error('FORBIDDEN: Only managers can access this feature');
    }
}

// ============================================
// REMINDER RULES CRUD (Manager only)
// ============================================

/**
 * Create a new reminder rule
 */
export async function createReminderRule(data: ReminderRuleCreate) {
    await validateManagerAccess(data.createdById);

    return prisma.reminderRule.create({
        data: {
            name: data.name,
            description: data.description,
            daysBefore: data.daysBefore,
            notifyOwner: data.notifyOwner ?? true,
            notifyManager: data.notifyManager ?? false,
            notifyCreator: data.notifyCreator ?? false,
            taskPriority: data.taskPriority,
            taskStatus: data.taskStatus,
            projectId: data.projectId,
            escalationHours: data.escalationHours,
            sendEmail: data.sendEmail ?? false,
            sendInApp: data.sendInApp ?? true,
            createdById: data.createdById,
            organizationId: data.organizationId,
            isActive: true
        }
    });
}

/**
 * Get all reminder rules for an organization
 */
export async function getReminderRules(organizationId: string, userId: string) {
    await validateManagerAccess(userId);

    return prisma.reminderRule.findMany({
        where: {
            organizationId,
            isActive: true
        },
        orderBy: { daysBefore: 'desc' }
    });
}

/**
 * Update a reminder rule
 */
export async function updateReminderRule(
    ruleId: string,
    userId: string,
    data: Partial<ReminderRuleCreate>
) {
    await validateManagerAccess(userId);

    return prisma.reminderRule.update({
        where: { id: ruleId },
        data: {
            ...data,
            updatedAt: new Date()
        }
    });
}

/**
 * Delete (deactivate) a reminder rule
 */
export async function deleteReminderRule(ruleId: string, userId: string) {
    await validateManagerAccess(userId);

    return prisma.reminderRule.update({
        where: { id: ruleId },
        data: { isActive: false }
    });
}

// ============================================
// DEFAULT REMINDER RULES
// ============================================

/**
 * Create default reminder rules for an organization
 */
export async function createDefaultReminderRules(organizationId: string, createdById: string) {
    const defaultRules = [
        {
            name: '7-Day Deadline Warning',
            description: 'Warn task owners 7 days before deadline',
            daysBefore: 7,
            notifyOwner: true,
            notifyManager: false,
            sendEmail: false,
            sendInApp: true
        },
        {
            name: '3-Day Deadline Reminder',
            description: 'Remind task owners 3 days before deadline',
            daysBefore: 3,
            notifyOwner: true,
            notifyManager: false,
            sendEmail: false,
            sendInApp: true
        },
        {
            name: '1-Day Urgent Reminder',
            description: 'Urgent reminder 1 day before deadline',
            daysBefore: 1,
            notifyOwner: true,
            notifyManager: true,
            sendEmail: true,
            sendInApp: true
        },
        {
            name: 'Overdue Escalation',
            description: 'Escalate overdue tasks to manager after 24 hours',
            daysBefore: 0,
            notifyOwner: true,
            notifyManager: true,
            escalationHours: 24,
            sendEmail: true,
            sendInApp: true
        }
    ];

    for (const rule of defaultRules) {
        await prisma.reminderRule.create({
            data: {
                ...rule,
                createdById,
                organizationId,
                isActive: true
            }
        });
    }
}

// ============================================
// DEADLINE REMINDER PROCESSING (Cron Job)
// ============================================

/**
 * Find tasks approaching their deadline
 */
export async function findTasksApproachingDeadline(daysBefore: number): Promise<TaskWithDeadline[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysBefore);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return prisma.node.findMany({
        where: {
            dueDate: {
                gte: targetDate,
                lt: nextDay
            },
            completed: false,
            status: {
                notIn: ['completed', 'cancelled']
            }
        },
        select: {
            id: true,
            text: true,
            dueDate: true,
            assigneeId: true,
            createdById: true,
            projectId: true,
            status: true,
            priority: true,
            mindMap: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    }) as Promise<TaskWithDeadline[]>;
}

/**
 * Find overdue tasks
 */
export async function findOverdueTasks(): Promise<TaskWithDeadline[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.node.findMany({
        where: {
            dueDate: {
                lt: today
            },
            completed: false,
            status: {
                notIn: ['completed', 'cancelled']
            }
        },
        select: {
            id: true,
            text: true,
            dueDate: true,
            assigneeId: true,
            createdById: true,
            projectId: true,
            status: true,
            priority: true,
            mindMap: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    }) as Promise<TaskWithDeadline[]>;
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Check if reminder was already sent
 */
export async function wasReminderAlreadySent(
    nodeId: string,
    recipientId: string,
    type: string,
    daysBefore?: number
): Promise<boolean> {
    const existing = await prisma.sentReminder.findFirst({
        where: {
            nodeId,
            recipientId,
            type,
            daysBefore: daysBefore ?? undefined,
            createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
            }
        }
    });

    return !!existing;
}

/**
 * Create in-app notification
 */
export async function createReminderNotification(
    recipientId: string,
    nodeId: string,
    type: 'deadline_reminder' | 'task_overdue',
    title: string,
    message: string,
    triggeredById?: string
) {
    return prisma.notification.create({
        data: {
            type,
            title,
            message,
            userId: recipientId,
            nodeId,
            triggeredById,
            actionUrl: `/mindmap?node=${nodeId}`
        }
    });
}

/**
 * Record that a reminder was sent
 */
export async function recordSentReminder(
    nodeId: string,
    recipientId: string,
    type: string,
    ruleId?: string,
    daysBefore?: number,
    daysOverdue?: number
) {
    // Use upsert to handle unique constraint
    return prisma.sentReminder.upsert({
        where: {
            nodeId_recipientId_type_daysBefore: {
                nodeId,
                recipientId,
                type,
                daysBefore: daysBefore ?? 0
            }
        },
        update: {
            inAppSent: true,
            inAppSentAt: new Date()
        },
        create: {
            nodeId,
            recipientId,
            type,
            ruleId,
            daysBefore,
            daysOverdue,
            inAppSent: true,
            inAppSentAt: new Date()
        }
    });
}

/**
 * Get manager for a user
 */
export async function getManagerForUser(userId: string): Promise<string | null> {
    // Get user's team and find the manager
    const teamMember = await prisma.teamMember.findFirst({
        where: { userId },
        include: {
            team: {
                select: { managerId: true }
            }
        }
    });

    return teamMember?.team?.managerId || null;
}

/**
 * Process deadline reminders for a specific rule
 */
export async function processDeadlineReminders(rule: any) {
    const tasks = await findTasksApproachingDeadline(rule.daysBefore);

    let processed = 0;
    let notified = 0;

    for (const task of tasks) {
        processed++;

        // Apply filters
        if (rule.taskPriority && task.priority !== rule.taskPriority) continue;
        if (rule.taskStatus && task.status !== rule.taskStatus) continue;
        if (rule.projectId && task.projectId !== rule.projectId) continue;

        // Notify owner/assignee
        if (rule.notifyOwner && task.assigneeId) {
            const alreadySent = await wasReminderAlreadySent(
                task.id,
                task.assigneeId,
                'deadline_reminder',
                rule.daysBefore
            );

            if (!alreadySent) {
                await createReminderNotification(
                    task.assigneeId,
                    task.id,
                    'deadline_reminder',
                    `⏰ Deadline in ${rule.daysBefore} day${rule.daysBefore > 1 ? 's' : ''}`,
                    `Task "${task.text}" is due in ${rule.daysBefore} day${rule.daysBefore > 1 ? 's' : ''}.`
                );

                await recordSentReminder(
                    task.id,
                    task.assigneeId,
                    'deadline_reminder',
                    rule.id,
                    rule.daysBefore
                );

                notified++;
            }
        }

        // Notify manager
        if (rule.notifyManager && task.assigneeId) {
            const managerId = await getManagerForUser(task.assigneeId);
            if (managerId) {
                const alreadySent = await wasReminderAlreadySent(
                    task.id,
                    managerId,
                    'deadline_reminder_manager',
                    rule.daysBefore
                );

                if (!alreadySent) {
                    await createReminderNotification(
                        managerId,
                        task.id,
                        'deadline_reminder',
                        `⏰ Team Task Deadline in ${rule.daysBefore} day${rule.daysBefore > 1 ? 's' : ''}`,
                        `Task "${task.text}" assigned to your team member is due soon.`
                    );

                    await recordSentReminder(
                        task.id,
                        managerId,
                        'deadline_reminder_manager',
                        rule.id,
                        rule.daysBefore
                    );
                }
            }
        }

        // Notify creator
        if (rule.notifyCreator && task.createdById !== task.assigneeId) {
            const alreadySent = await wasReminderAlreadySent(
                task.id,
                task.createdById,
                'deadline_reminder_creator',
                rule.daysBefore
            );

            if (!alreadySent) {
                await createReminderNotification(
                    task.createdById,
                    task.id,
                    'deadline_reminder',
                    `⏰ Your Task Deadline in ${rule.daysBefore} day${rule.daysBefore > 1 ? 's' : ''}`,
                    `Task "${task.text}" that you created is due soon.`
                );

                await recordSentReminder(
                    task.id,
                    task.createdById,
                    'deadline_reminder_creator',
                    rule.id,
                    rule.daysBefore
                );
            }
        }
    }

    return { processed, notified };
}

/**
 * Process overdue tasks and send alerts
 */
export async function processOverdueTasks() {
    const overdueTasks = await findOverdueTasks();

    let processed = 0;
    let notified = 0;

    for (const task of overdueTasks) {
        processed++;
        const daysOverdue = calculateDaysOverdue(task.dueDate);

        // Track overdue task
        await prisma.overdueTask.upsert({
            where: { nodeId: task.id },
            update: {
                daysOverdue,
                updatedAt: new Date()
            },
            create: {
                nodeId: task.id,
                overdueAt: task.dueDate,
                daysOverdue
            }
        });

        // Notify owner/assignee
        if (task.assigneeId) {
            const alreadySent = await wasReminderAlreadySent(
                task.id,
                task.assigneeId,
                'overdue_alert',
                0
            );

            if (!alreadySent) {
                await createReminderNotification(
                    task.assigneeId,
                    task.id,
                    'task_overdue',
                    `🚨 Task Overdue - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`,
                    `Task "${task.text}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`
                );

                await recordSentReminder(
                    task.id,
                    task.assigneeId,
                    'overdue_alert',
                    undefined,
                    0,
                    daysOverdue
                );

                // Update overdue tracking
                await prisma.overdueTask.update({
                    where: { nodeId: task.id },
                    data: {
                        ownerNotified: true,
                        ownerNotifiedAt: new Date()
                    }
                });

                notified++;
            }
        }

        // Check for escalation to manager (after X hours)
        const overdueRecord = await prisma.overdueTask.findUnique({
            where: { nodeId: task.id }
        });

        if (overdueRecord && !overdueRecord.managerNotified && task.assigneeId) {
            const hoursSinceOverdue = (Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60);

            // Escalate after 24 hours by default
            if (hoursSinceOverdue >= 24) {
                const managerId = await getManagerForUser(task.assigneeId);

                if (managerId) {
                    const alreadySent = await wasReminderAlreadySent(
                        task.id,
                        managerId,
                        'escalation',
                        0
                    );

                    if (!alreadySent) {
                        await createReminderNotification(
                            managerId,
                            task.id,
                            'task_overdue',
                            `🚨 ESCALATION: Task ${daysOverdue} days overdue`,
                            `Task "${task.text}" is overdue and requires your attention!`
                        );

                        await recordSentReminder(
                            task.id,
                            managerId,
                            'escalation',
                            undefined,
                            0,
                            daysOverdue
                        );

                        await prisma.overdueTask.update({
                            where: { nodeId: task.id },
                            data: {
                                managerNotified: true,
                                managerNotifiedAt: new Date()
                            }
                        });
                    }
                }
            }
        }
    }

    return { processed, notified };
}

// ============================================
// MAIN CRON JOB FUNCTION
// ============================================

/**
 * Run the daily reminder job
 * This should be called by a cron scheduler (e.g., node-cron)
 */
export async function runDailyReminderJob() {
    console.log('[ReminderService] Starting daily reminder job...');

    const startTime = Date.now();
    const results = {
        reminderRulesProcessed: 0,
        tasksChecked: 0,
        remindersScheduled: 0,
        overdueTasksProcessed: 0,
        overdueNotifications: 0,
        errors: [] as string[]
    };

    try {
        // Get all active reminder rules
        const rules = await prisma.reminderRule.findMany({
            where: { isActive: true }
        });

        results.reminderRulesProcessed = rules.length;

        // Process each rule
        for (const rule of rules) {
            try {
                const { processed, notified } = await processDeadlineReminders(rule);
                results.tasksChecked += processed;
                results.remindersScheduled += notified;
            } catch (error) {
                results.errors.push(`Rule ${rule.id}: ${error}`);
            }
        }

        // Process overdue tasks
        try {
            const { processed, notified } = await processOverdueTasks();
            results.overdueTasksProcessed = processed;
            results.overdueNotifications = notified;
        } catch (error) {
            results.errors.push(`Overdue processing: ${error}`);
        }

    } catch (error) {
        results.errors.push(`Job failed: ${error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[ReminderService] Job completed in ${duration}ms`, results);

    return results;
}

// ============================================
// STATS & REPORTING (Manager Dashboard)
// ============================================

/**
 * Get reminder statistics for manager dashboard
 */
export async function getReminderStats(organizationId: string, userId: string) {
    await validateManagerAccess(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalOverdue,
        dueToday,
        dueThisWeek,
        remindersSentToday,
        activeRules
    ] = await Promise.all([
        // Count overdue tasks
        prisma.node.count({
            where: {
                dueDate: { lt: today },
                completed: false,
                status: { notIn: ['completed', 'cancelled'] }
            }
        }),

        // Count tasks due today
        prisma.node.count({
            where: {
                dueDate: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                },
                completed: false
            }
        }),

        // Count tasks due this week
        prisma.node.count({
            where: {
                dueDate: {
                    gte: today,
                    lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                },
                completed: false
            }
        }),

        // Count reminders sent today
        prisma.sentReminder.count({
            where: {
                createdAt: { gte: today }
            }
        }),

        // Count active rules
        prisma.reminderRule.count({
            where: {
                organizationId,
                isActive: true
            }
        })
    ]);

    return {
        totalOverdue,
        dueToday,
        dueThisWeek,
        remindersSentToday,
        activeRules
    };
}

/**
 * Get overdue tasks list for manager
 */
export async function getOverdueTasksList(organizationId: string, userId: string) {
    await validateManagerAccess(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.node.findMany({
        where: {
            dueDate: { lt: today },
            completed: false,
            status: { notIn: ['completed', 'cancelled'] }
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            mindMap: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    });
}

export default {
    // RBAC
    isManagerOrAbove,
    validateManagerAccess,

    // Reminder Rules CRUD
    createReminderRule,
    getReminderRules,
    updateReminderRule,
    deleteReminderRule,
    createDefaultReminderRules,

    // Processing
    findTasksApproachingDeadline,
    findOverdueTasks,
    calculateDaysOverdue,
    processDeadlineReminders,
    processOverdueTasks,
    runDailyReminderJob,

    // Stats
    getReminderStats,
    getOverdueTasksList
};
