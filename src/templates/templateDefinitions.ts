/**
 * Template Definitions for Mind Planning
 * Pre-built mind map structures for common use cases
 */

import type { Node, Connection } from '../types/mindmap';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'meeting' | 'analysis' | 'brainstorm' | 'personal';
  thumbnail: string;
  tags: string[];
  nodeStructure: {
    nodes: Omit<Node, 'id'>[];
    connections: Omit<Connection, 'id'>[];
    layout: 'spider-web' | 'tree' | 'radial' | 'grid';
  };
  customization: {
    allowColorChange: boolean;
    allowStructureChange: boolean;
    requiredFields: string[];
  };
}

export const templates: Template[] = [
  // 1. Project Planning Template
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Structured template for planning projects with goals, milestones, and tasks. Perfect for organizing complex projects with clear phases.',
    category: 'project',
    thumbnail: '📋',
    tags: ['project', 'planning', 'goals', 'tasks', 'management'],
    nodeStructure: {
      nodes: [
        { text: 'Project Name', x: 0, y: 0, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Goals', x: -350, y: -200, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'Timeline', x: 350, y: -200, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { text: 'Resources', x: -350, y: 200, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Risks & Challenges', x: 350, y: 200, bgColor: '#EF4444', fontColor: '#FFFFFF' },
        { text: 'Goal 1', x: -650, y: -300, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Goal 2', x: -650, y: -200, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Goal 3', x: -650, y: -100, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Phase 1', x: 650, y: -300, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Phase 2', x: 650, y: -200, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Phase 3', x: 650, y: -100, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Team', x: -650, y: 100, bgColor: '#A78BFA', fontColor: '#FFFFFF' },
        { text: 'Budget', x: -650, y: 200, bgColor: '#A78BFA', fontColor: '#FFFFFF' },
        { text: 'Risk 1', x: 650, y: 100, bgColor: '#F87171', fontColor: '#FFFFFF' },
        { text: 'Risk 2', x: 650, y: 200, bgColor: '#F87171', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'goals' },
        { from: 'root', to: 'timeline' },
        { from: 'root', to: 'resources' },
        { from: 'root', to: 'risks' },
        { from: 'goals', to: 'goal1' },
        { from: 'goals', to: 'goal2' },
        { from: 'goals', to: 'goal3' },
        { from: 'timeline', to: 'phase1' },
        { from: 'timeline', to: 'phase2' },
        { from: 'timeline', to: 'phase3' },
        { from: 'resources', to: 'team' },
        { from: 'resources', to: 'budget' },
        { from: 'risks', to: 'risk1' },
        { from: 'risks', to: 'risk2' },
      ],
      layout: 'spider-web'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },

  // 2. Meeting Notes Template
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Capture meeting discussions, attendees, agenda items, and action items. Keep your meetings organized and actionable.',
    category: 'meeting',
    thumbnail: '📝',
    tags: ['meeting', 'notes', 'agenda', 'actions', 'discussion'],
    nodeStructure: {
      nodes: [
        { text: 'Meeting Title', x: 0, y: 0, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Attendees', x: -350, y: -250, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Agenda', x: 350, y: -250, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'Discussion Points', x: -350, y: 150, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { text: 'Action Items', x: 350, y: 150, bgColor: '#EF4444', fontColor: '#FFFFFF' },
        { text: 'Person 1', x: -650, y: -350, bgColor: '#A78BFA', fontColor: '#FFFFFF' },
        { text: 'Person 2', x: -650, y: -250, bgColor: '#A78BFA', fontColor: '#FFFFFF' },
        { text: 'Topic 1', x: 650, y: -350, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Topic 2', x: 650, y: -250, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Discussion 1', x: -650, y: 50, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Discussion 2', x: -650, y: 150, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Action 1', x: 650, y: 50, bgColor: '#F87171', fontColor: '#FFFFFF' },
        { text: 'Action 2', x: 650, y: 150, bgColor: '#F87171', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'attendees' },
        { from: 'root', to: 'agenda' },
        { from: 'root', to: 'discussion' },
        { from: 'root', to: 'actions' },
        { from: 'attendees', to: 'person1' },
        { from: 'attendees', to: 'person2' },
        { from: 'agenda', to: 'topic1' },
        { from: 'agenda', to: 'topic2' },
        { from: 'discussion', to: 'disc1' },
        { from: 'discussion', to: 'disc2' },
        { from: 'actions', to: 'action1' },
        { from: 'actions', to: 'action2' },
      ],
      layout: 'spider-web'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },

  // 3. SWOT Analysis Template
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Strategic planning framework to identify Strengths, Weaknesses, Opportunities, and Threats. Perfect for business strategy.',
    category: 'analysis',
    thumbnail: '📊',
    tags: ['analysis', 'swot', 'strategy', 'planning', 'business'],
    nodeStructure: {
      nodes: [
        { text: 'SWOT Analysis', x: 0, y: 0, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Strengths', x: -350, y: -200, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'Weaknesses', x: 350, y: -200, bgColor: '#EF4444', fontColor: '#FFFFFF' },
        { text: 'Opportunities', x: -350, y: 200, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Threats', x: 350, y: 200, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { text: 'Strong brand', x: -650, y: -300, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Skilled team', x: -650, y: -200, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Good reputation', x: -650, y: -100, bgColor: '#34D399', fontColor: '#FFFFFF' },
        { text: 'Limited budget', x: 650, y: -300, bgColor: '#F87171', fontColor: '#FFFFFF' },
        { text: 'Small team', x: 650, y: -200, bgColor: '#F87171', fontColor: '#FFFFFF' },
        { text: 'Old technology', x: 650, y: -100, bgColor: '#F87171', fontColor: '#FFFFFF' },
        { text: 'Market growth', x: -650, y: 100, bgColor: '#60A5FA', fontColor: '#FFFFFF' },
        { text: 'New technology', x: -650, y: 200, bgColor: '#60A5FA', fontColor: '#FFFFFF' },
        { text: 'Partnerships', x: -650, y: 300, bgColor: '#60A5FA', fontColor: '#FFFFFF' },
        { text: 'Competition', x: 650, y: 100, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Economic downturn', x: 650, y: 200, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
        { text: 'Regulations', x: 650, y: 300, bgColor: '#FBBF24', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'strengths' },
        { from: 'root', to: 'weaknesses' },
        { from: 'root', to: 'opportunities' },
        { from: 'root', to: 'threats' },
        { from: 'strengths', to: 'str1' },
        { from: 'strengths', to: 'str2' },
        { from: 'strengths', to: 'str3' },
        { from: 'weaknesses', to: 'weak1' },
        { from: 'weaknesses', to: 'weak2' },
        { from: 'weaknesses', to: 'weak3' },
        { from: 'opportunities', to: 'opp1' },
        { from: 'opportunities', to: 'opp2' },
        { from: 'opportunities', to: 'opp3' },
        { from: 'threats', to: 'thr1' },
        { from: 'threats', to: 'thr2' },
        { from: 'threats', to: 'thr3' },
      ],
      layout: 'spider-web'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },

  // 4. OKR Template
  {
    id: 'okr-template',
    name: 'OKR (Objectives & Key Results)',
    description: 'Goal-setting framework with objectives and measurable key results. Track progress towards quarterly or annual goals.',
    category: 'project',
    thumbnail: '🎯',
    tags: ['okr', 'goals', 'objectives', 'results', 'tracking'],
    nodeStructure: {
      nodes: [
        { text: 'Q1 2025 OKRs', x: 0, y: 0, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Objective 1', x: 0, y: -200, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Objective 2', x: 0, y: 100, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Objective 3', x: 0, y: 400, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'KR 1.1: Metric target', x: -300, y: -300, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 1.2: Metric target', x: -300, y: -200, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 1.3: Metric target', x: -300, y: -100, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 2.1: Metric target', x: -300, y: 0, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 2.2: Metric target', x: -300, y: 100, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 2.3: Metric target', x: -300, y: 200, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 3.1: Metric target', x: -300, y: 300, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 3.2: Metric target', x: -300, y: 400, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'KR 3.3: Metric target', x: -300, y: 500, bgColor: '#10B981', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'obj1' },
        { from: 'root', to: 'obj2' },
        { from: 'root', to: 'obj3' },
        { from: 'obj1', to: 'kr11' },
        { from: 'obj1', to: 'kr12' },
        { from: 'obj1', to: 'kr13' },
        { from: 'obj2', to: 'kr21' },
        { from: 'obj2', to: 'kr22' },
        { from: 'obj2', to: 'kr23' },
        { from: 'obj3', to: 'kr31' },
        { from: 'obj3', to: 'kr32' },
        { from: 'obj3', to: 'kr33' },
      ],
      layout: 'tree'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },

  // 5. Brainstorming Template
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    description: 'Free-flowing idea generation template. Perfect for creative sessions with minimal structure.',
    category: 'brainstorm',
    thumbnail: '💡',
    tags: ['brainstorm', 'ideas', 'creative', 'innovation', 'thinking'],
    nodeStructure: {
      nodes: [
        { text: 'Main Topic', x: 0, y: 0, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { text: 'Idea 1', x: -300, y: -150, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Idea 2', x: 300, y: -150, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Idea 3', x: -300, y: 150, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'Idea 4', x: 300, y: 150, bgColor: '#EF4444', fontColor: '#FFFFFF' },
        { text: 'Idea 5', x: 0, y: 250, bgColor: '#EC4899', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'idea1' },
        { from: 'root', to: 'idea2' },
        { from: 'root', to: 'idea3' },
        { from: 'root', to: 'idea4' },
        { from: 'root', to: 'idea5' },
      ],
      layout: 'radial'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },

  // 6. Weekly Planning Template
  {
    id: 'weekly-planning',
    name: 'Weekly Planning',
    description: 'Organize your week with priorities, goals, and daily focus areas. Perfect for weekly reviews and planning.',
    category: 'personal',
    thumbnail: '📅',
    tags: ['planning', 'weekly', 'tasks', 'personal', 'productivity'],
    nodeStructure: {
      nodes: [
        { text: 'This Week', x: 0, y: 0, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Top 3 Priorities', x: 0, y: -250, bgColor: '#EF4444', fontColor: '#FFFFFF' },
        { text: 'Work/Projects', x: -400, y: -100, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { text: 'Personal Goals', x: 400, y: -100, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { text: 'Health & Fitness', x: -400, y: 100, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { text: 'Learning & Growth', x: 400, y: 100, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { text: 'Weekend Plans', x: 0, y: 250, bgColor: '#EC4899', fontColor: '#FFFFFF' },
      ],
      connections: [
        { from: 'root', to: 'priorities' },
        { from: 'root', to: 'work' },
        { from: 'root', to: 'personal' },
        { from: 'root', to: 'health' },
        { from: 'root', to: 'learning' },
        { from: 'root', to: 'weekend' },
      ],
      layout: 'spider-web'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter(t => t.category === category);
}

export function searchTemplates(query: string): Template[] {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(t => 
    t.name.toLowerCase().includes(lowercaseQuery) ||
    t.description.toLowerCase().includes(lowercaseQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
