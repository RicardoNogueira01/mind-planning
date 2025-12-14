# 💼 Management Features Guide

## Overview
This guide covers the three new advanced management features added to your Mind Planning application:
1. **Budget Tracker** - Financial monitoring and cost control
2. **Resource Matrix** - Team capacity planning and allocation
3. **Project Health** - Real-time project status monitoring

---

## 📊 Budget Tracker

### What It Does
Tracks project costs, monitors burn rate, calculates budget runway, and provides early warnings for budget overruns.

### How to Access
1. Open the Mind Map view
2. Click on the **toolbar at the bottom** (enhanced features)
3. Select **"Budget"** icon (will need to be added to toolbar)
4. Or access from the dashboard management panel

### Key Features

#### 1. **Budget Overview**
- **Total Budget**: Set your project budget (default: $50,000)
- **Remaining**: Real-time calculation of budget left
- **Percentage Used**: Visual progress bar showing budget utilization

#### 2. **Financial Metrics**
- **Burn Rate**: Daily spending rate based on completed work
- **Runway**: Days until budget exhausted at current burn rate
- **Projected Total**: Estimated total cost based on all tasks
- **Variance**: Difference between budget and projected cost

#### 3. **Spending Breakdown**
- **By Category**: See spending across Design, Development, Testing, etc.
- **By Team Member**: Track individual contributor costs
- **Visual Charts**: Color-coded bars showing distribution

### How It Works

#### Budget Calculation
```javascript
// For each task:
Cost = (Estimated Hours × Hourly Rate) / Number of Assignees

// If task is completed:
Spent += Cost

// If task is incomplete:
Estimated Total += Cost
```

#### Hourly Rates
Configure team member rates in your project settings:
```javascript
const hourlyRates = {
  'user-id-1': 75,  // Senior Developer $75/hr
  'user-id-2': 50,  // Designer $50/hr
  'user-id-3': 45   // Junior Developer $45/hr
};
```

#### Category Detection
Tasks are automatically categorized based on keywords:
- **Design**: design, ui, ux, mockup, wireframe
- **Development**: develop, code, build, implement, feature
- **Testing**: test, qa, quality, bug
- **Marketing**: market, content, campaign
- **Research**: research, analysis, study

### Alerts & Warnings

#### 🔴 Critical (Red)
- Budget exceeded
- Immediate action required

#### 🟡 Warning (Amber)
- >80% budget used
- Projected to exceed budget
- Runway < 30 days

#### 🟢 Healthy (Green)
- Budget on track
- Healthy runway
- Good spending rate

### Best Practices
1. **Set realistic budgets** based on project scope
2. **Update hourly rates** to reflect actual costs
3. **Track regularly** - check daily or weekly
4. **Act on warnings** - adjust scope or resources when amber
5. **Use categories** - analyze which areas consume most budget

---

## 👥 Resource Matrix

### What It Does
Visualizes team capacity, identifies overallocation, and helps prevent burnout through visual heat mapping.

### How to Access
1. From Mind Map enhanced features toolbar
2. Click **"Resource"** or **"Team"** icon
3. Or from dashboard team management section

### Key Features

#### 1. **Time Period Views**
- **Week**: Day-by-day allocation (7 days)
- **Month**: Week-by-week allocation (4 weeks)
- **Quarter**: Month-by-month allocation (3 months)

#### 2. **Capacity Matrix**
Visual grid showing:
- **Rows**: Team members
- **Columns**: Time periods
- **Cells**: Hours allocated (color-coded)

#### 3. **Summary Statistics**
- **Total Team Members**: Count of collaborators
- **Average Utilization**: Team-wide percentage
- **Overallocated Count**: Members exceeding capacity
- **Available Capacity**: Members under 50% utilization

### How to Read the Matrix

#### Cell Colors
- 🔵 **Blue (0-50%)**: Available capacity
- 🟢 **Green (50-80%)**: Optimal workload
- 🟡 **Amber (80-100%)**: Busy but manageable
- 🔴 **Red (>100%)**: Overloaded - needs attention

#### Numbers in Cells
- Shows total hours allocated for that period
- Hover to see task count
- Click cell for task details

### Understanding Utilization

```
Utilization Rate = (Allocated Hours / Available Hours) × 100

Available Hours:
- Week view: 5 days × 8 hours = 40 hours
- Month view: 20 days × 8 hours = 160 hours
- Quarter view: 60 days × 8 hours = 480 hours
```

### Use Cases

#### 1. **Prevent Overallocation**
- Identify red cells
- Redistribute tasks from overloaded members
- Hire contractors for peak periods

#### 2. **Balance Workload**
- Move tasks from red/amber to blue/green members
- Ensure fair distribution
- Prevent burnout

#### 3. **Capacity Planning**
- See upcoming availability
- Plan new project starts
- Make hiring decisions

#### 4. **Spot Bottlenecks**
- Find consistently overloaded members
- Identify skills gaps
- Plan training or hiring

### Best Practices
1. **Check weekly** - review allocation before sprint starts
2. **Target 70-80%** - optimal utilization range
3. **Buffer time** - leave 20% for meetings, breaks
4. **Redistribute early** - before tasks start
5. **Monitor trends** - are same people always overloaded?

---

## 🏥 Project Health Dashboard

### What It Does
Calculates real-time health scores for all projects based on multiple factors, providing early warning of issues.

### How to Access
1. **Dashboard**: Appears as a card on main dashboard
2. Automatically calculates for all active projects
3. Updates in real-time as tasks change

### Health Score Calculation

The health score starts at **100** and deducts points based on issues:

#### Schedule Health (30 points max)
- **Overdue Tasks**: -5 points per task (max -30)
- Critical if >3 tasks overdue

#### Team Workload (25 points max)
- **Overloaded Members**: -10 points per person (max -25)
- Overloaded = >40 hours/week
- Critical if >2 members overloaded

#### Risk Level (20 points max)
- **Unassigned High-Priority Tasks**: -5 points each (max -20)
- Critical if >2 high-priority tasks unassigned

#### Progress (15 points max)
- **Low Completion Rate**: -15 points if <30% complete
- Warning if project stalled

#### Blockers (10 points max)
- **Blocked Tasks**: -5 points per task (max -10)
- Tasks waiting on incomplete dependencies

### Health Status

#### 🟢 Healthy (80-100)
- Project on track
- Minor issues only
- Continue monitoring

#### 🟡 At Risk (60-79)
- Moderate issues present
- Requires attention
- Create action plan

#### 🔴 Critical (0-59)
- Serious problems
- Immediate intervention needed
- Escalate to stakeholders

### Dashboard Display

#### Overall Metrics
- **Average Health**: All projects combined
- **Healthy Count**: Projects scoring 80+
- **At Risk Count**: Projects scoring 60-79
- **Critical Count**: Projects scoring <60

#### Per Project
- **Health Score**: Large number (0-100)
- **Status Badge**: Healthy/At Risk/Critical
- **Completion %**: Task completion rate
- **Team Size**: Number of collaborators
- **Issue Tags**: Top 3 issues with icons
- **Progress Bar**: Visual health indicator

### Issue Types & Icons

- 🕐 **Schedule**: Overdue tasks
- ⚖️ **Workload**: Team overload
- ⚠️ **Risk**: Unassigned priorities
- 📊 **Progress**: Low completion
- 🚧 **Blockers**: Dependencies blocking work

### How to Use

#### Daily Review
1. Check overall health score
2. Review any critical projects
3. Read issue summaries
4. Take immediate action on red flags

#### Weekly Planning
1. Compare project health trends
2. Identify recurring issues
3. Adjust resource allocation
4. Update project priorities

#### Monthly Reports
1. Track health score over time
2. Analyze patterns and trends
3. Measure improvement actions
4. Report to stakeholders

### Action Recommendations

#### If Score Drops Below 80
1. **Identify root cause** - which factor dropped?
2. **Create action plan** - specific tasks to improve
3. **Assign ownership** - who will fix it?
4. **Set deadline** - when should score recover?
5. **Monitor daily** - track improvement

#### Common Remedies
- **Overdue tasks** → Extend deadlines or add resources
- **Overload** → Redistribute work or hire help
- **Unassigned** → Assign high-priority items immediately
- **Low progress** → Remove blockers, add resources
- **Blockers** → Complete dependencies first

---

## 🔧 Configuration & Setup

### Initial Setup

#### 1. Configure Budget
```javascript
// In your project settings or MindMap component
const projectBudget = 50000; // $50,000
const hourlyRates = {
  'john-id': 75,
  'sarah-id': 60,
  'alex-id': 45
};
```

#### 2. Add Collaborators
Ensure team members are added with:
- **Name**: Full name
- **Initials**: For avatars
- **Color**: Unique identifier color
- **Hourly Rate**: For budget calculations

#### 3. Set Task Estimates
For accurate tracking, add to tasks:
- **Estimated Hours**: Time to complete
- **Due Date**: For capacity planning
- **Priority**: For health calculations
- **Assignees**: Link to collaborators

### Integration with Existing Features

#### Mind Map
- Budget/Resource buttons added to enhanced toolbar
- Access alongside AI, Dependencies, Workload, etc.

#### Dashboard
- Project Health card displays automatically
- Integrates with existing dashboard cards
- Updates in real-time

#### Task Properties
Enhanced node properties to include:
```javascript
{
  id: 'task-1',
  text: 'Develop login feature',
  estimatedHours: 8,
  dueDate: '2025-01-15',
  priority: 'high',
  collaborators: ['john-id', 'sarah-id'],
  completed: false
}
```

---

## 📱 Mobile Considerations

All three features are fully responsive:

### Small Screens (<640px)
- **Budget**: Scrollable breakdown sections
- **Resource**: Horizontal scroll for matrix
- **Health**: Stacked card layout

### Tablets (640px-1024px)
- **Budget**: Side-by-side metrics
- **Resource**: Partial matrix visible
- **Health**: 2-column layout

### Desktop (>1024px)
- **Budget**: Full breakdown visible
- **Resource**: Complete matrix view
- **Health**: Full dashboard card

---

## 🎯 Tips for Success

### Budget Management
1. **Update weekly** - keep estimates current
2. **Track actuals** - compare estimated vs actual
3. **Plan buffers** - add 20% contingency
4. **Monitor trends** - is burn rate increasing?

### Resource Planning
1. **Plan sprints** - check capacity before committing
2. **Leave slack** - target 80% not 100%
3. **Cross-train** - reduce single points of failure
4. **Communicate** - share matrix with team

### Health Monitoring
1. **Daily check** - quick glance at scores
2. **Act on amber** - don't wait for red
3. **Track trends** - improving or declining?
4. **Share openly** - transparency builds trust

---

## 🆘 Troubleshooting

### Budget Shows $0
- Check if tasks have `estimatedHours` set
- Verify `hourlyRates` are configured
- Ensure tasks are assigned to team members

### Resource Matrix Empty
- Add `dueDate` to tasks
- Assign tasks to `collaborators`
- Check date range matches task due dates

### Health Score Stuck at 100
- Add task priorities
- Set due dates
- Assign tasks to team members
- Mark some tasks as completed

### Data Not Updating
- Refresh the component
- Check if tasks are saved
- Verify collaborators exist
- Look for console errors

---

## 📈 Advanced Usage

### Custom Reports
Export data for executive summaries:
```javascript
// Budget summary
const budgetReport = {
  allocated: projectBudget,
  spent: budgetAnalysis.totalSpent,
  remaining: budgetAnalysis.remaining,
  projected: budgetAnalysis.estimatedTotal,
  health: budgetAnalysis.isAtRisk ? 'At Risk' : 'Healthy'
};

// Resource summary
const resourceReport = allocationData.map(member => ({
  name: member.name,
  utilization: member.utilizationRate,
  totalHours: member.totalHours,
  status: member.utilizationRate > 100 ? 'Overallocated' : 'Available'
}));

// Health summary
const healthReport = healthMetrics.map(project => ({
  name: project.name,
  score: project.healthScore,
  status: project.status,
  issues: project.issues.length
}));
```

### Integration with External Tools
Connect to time tracking, invoicing, or HR systems:
- Export budget data to accounting software
- Sync resource data with time tracking tools
- Share health reports with project stakeholders

---

## 🔐 Permissions & Access

### Who Can View
- **Budget**: Project managers, finance team
- **Resource Matrix**: Managers, team leads
- **Health Dashboard**: All team members

### Who Can Edit
- **Budget Settings**: Project managers only
- **Resource Allocation**: Managers can reassign
- **Health Scores**: Auto-calculated (read-only)

---

## 📞 Need Help?

If you encounter issues or have questions:
1. Check this documentation first
2. Review console for error messages
3. Verify all prerequisites are met
4. Check that data is properly formatted
5. Contact support with specific error details

---

## 🎓 Learning Path

### Beginner
1. Start with **Project Health** - easiest to understand
2. Learn to read the health scores
3. Understand what causes score drops
4. Take corrective actions

### Intermediate
5. Move to **Resource Matrix**
6. Learn capacity planning basics
7. Practice redistributing workload
8. Set up recurring reviews

### Advanced
9. Implement **Budget Tracker**
10. Configure hourly rates
11. Analyze spending patterns
12. Create custom reports

---

## 🚀 Future Enhancements

Planned improvements:
- **Budget**: Forecasting, multiple budgets per project
- **Resource**: Skills matrix, PTO calendar integration
- **Health**: Custom scoring weights, historical trends
- **All**: Email alerts, Slack notifications, API access

---

**Last Updated**: December 13, 2025  
**Version**: 1.0.0  
**Author**: Mind Planning Team
