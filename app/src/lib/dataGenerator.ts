import type { Task, TaskStatus, TaskPriority, User } from '@/types';
import { USER_POOL } from '@/types';

// Sample task titles for random generation
const TASK_TITLES = [
  'Implement user authentication',
  'Design database schema',
  'Create API endpoints',
  'Write unit tests',
  'Fix navigation bug',
  'Update documentation',
  'Optimize query performance',
  'Add error handling',
  'Refactor legacy code',
  'Setup CI/CD pipeline',
  'Implement search functionality',
  'Add pagination support',
  'Create dashboard widgets',
  'Fix memory leak',
  'Update dependencies',
  'Implement caching layer',
  'Add logging system',
  'Create user profile page',
  'Fix responsive layout',
  'Add dark mode support',
  'Implement notifications',
  'Create export feature',
  'Add data validation',
  'Fix accessibility issues',
  'Optimize bundle size',
  'Implement rate limiting',
  'Add multi-language support',
  'Create admin panel',
  'Fix cross-browser issues',
  'Add analytics tracking',
  'Implement file upload',
  'Create email templates',
  'Add password reset',
  'Fix security vulnerability',
  'Implement OAuth login',
  'Add sorting functionality',
  'Create reporting module',
  'Fix data sync issues',
  'Add bulk operations',
  'Implement webhooks',
  'Create onboarding flow',
  'Add keyboard shortcuts',
  'Fix mobile scrolling',
  'Implement drag and drop',
  'Add print styles',
  'Create backup system',
  'Fix session timeout',
  'Add two-factor auth',
  'Implement real-time updates',
  'Create API documentation',
  'Add input masks',
  'Fix form validation',
  'Implement lazy loading',
  'Add image optimization',
  'Create sitemap',
  'Fix SEO meta tags',
  'Add social sharing',
  'Implement comments',
  'Create activity log',
  'Add user roles',
  'Fix permission checks',
  'Implement data export',
  'Add import functionality',
  'Create help center',
  'Add tooltips',
  'Fix modal focus trap',
  'Implement infinite scroll',
  'Add skeleton loaders',
  'Create error pages',
  'Fix routing issues',
  'Add breadcrumbs',
  'Implement filters',
  'Add date picker',
  'Fix timezone handling',
  'Create data migration',
  'Add health checks',
  'Implement feature flags',
  'Add A/B testing',
  'Fix race conditions',
  'Create monitoring dashboard',
  'Add alert system',
  'Implement soft deletes',
  'Add audit logging',
  'Fix connection pooling',
  'Create load balancer',
  'Add SSL certificates',
  'Implement CDN caching',
  'Add DDoS protection',
  'Fix SQL injection',
  'Create backup strategy',
  'Add disaster recovery',
  'Implement auto-scaling',
  'Add cost optimization',
  'Fix resource leaks',
  'Create runbooks',
  'Add incident response',
  'Implement chaos engineering',
  'Add performance budgets',
  'Fix memory fragmentation',
  'Create capacity planning',
];

const DESCRIPTIONS = [
  'This task requires careful planning and implementation.',
  'High priority item that needs immediate attention.',
  'Coordinate with the design team before starting.',
  'Review existing code for similar implementations.',
  'Test thoroughly across all supported browsers.',
  'Document all changes in the wiki.',
  'Consider edge cases during implementation.',
  'Update related tests after changes.',
  'Get approval from team lead before merging.',
  'Follow the established coding standards.',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUser(index: number): User {
  const userData = USER_POOL[index % USER_POOL.length];
  const now = new Date();
  return {
    id: generateId(),
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const statuses: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'done'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

  // Pre-generate users
  const users: User[] = USER_POOL.map((_, index) => generateUser(index));

  for (let i = 0; i < count; i++) {
    const status = getRandomItem(statuses);
    const priority = getRandomItem(priorities);
    const assignee = getRandomItem(users);
    
    // Generate due date with some overdue tasks
    let dueDate: Date;
    const overdueChance = Math.random();
    if (overdueChance < 0.15) {
      // 15% overdue tasks (1-14 days overdue)
      const daysOverdue = Math.floor(Math.random() * 14) + 1;
      dueDate = new Date(now.getTime() - daysOverdue * 24 * 60 * 60 * 1000);
    } else if (overdueChance < 0.25) {
      // 10% due today
      dueDate = new Date(now);
    } else {
      // 75% future due dates
      dueDate = getRandomDate(now, twoMonthsFromNow);
    }

    // Generate start date (some tasks may not have start dates)
    let startDate: Date | null = null;
    if (status !== 'todo' && Math.random() > 0.1) {
      // 90% of non-todo tasks have start dates
      const daysBeforeDue = Math.floor(Math.random() * 14) + 1;
      startDate = new Date(dueDate.getTime() - daysBeforeDue * 24 * 60 * 60 * 1000);
      // Ensure start date is not before one month ago
      if (startDate < oneMonthAgo) {
        startDate = oneMonthAgo;
      }
    }

    // Generate created date
    const createdAt = getRandomDate(oneMonthAgo, now);

    const task: Task = {
      id: generateId(),
      title: `${getRandomItem(TASK_TITLES)} ${i + 1}`,
      description: getRandomItem(DESCRIPTIONS),
      status,
      priority,
      assignee,
      startDate,
      dueDate,
      createdAt,
      updatedAt: createdAt,
      tags: [],
      dependencies: [],
      comments: [],
      attachments: [],
      subtasks: [],
      progressPercentage: 0,
      isOverdue: false,
      isCompleted: false,
      timeRemaining: null,
    };

    tasks.push(task);
  }

  return tasks;
}

// Generate initial seed data
export const SEED_TASKS = generateTasks(500);

// Generate active collaboration users
export function generateActiveUsers(count: number = 3): { id: string; name: string; initials: string; color: string }[] {
  const names = [
    { name: 'Tom Baker', initials: 'TB' },
    { name: 'Anna Lee', initials: 'AL' },
    { name: 'Chris Wong', initials: 'CW' },
    { name: 'Maria Garcia', initials: 'MG' },
  ];
  
  const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];
  
  return names.slice(0, count).map((user, index) => ({
    id: generateId(),
    name: user.name,
    initials: user.initials,
    color: colors[index % colors.length],
  }));
}

export const ACTIVE_USERS = generateActiveUsers(3);
