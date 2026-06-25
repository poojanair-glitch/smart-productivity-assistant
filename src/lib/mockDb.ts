import fs from 'fs';
import path from 'path';

// Define DB paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

// Interface structures
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  password?: string; // added to store password in local mock db
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  completed_at?: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  ai_summary?: string;
  action_items?: string[];
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  remind_at: string;
  status: 'active' | 'snoozed' | 'dismissed';
  created_at: string;
}

export interface AISummary {
  id: string;
  user_id: string;
  week_start_date: string;
  summary_text: string;
  productivity_score: number;
  created_at: string;
}

export interface DbSchema {
  users: User[];
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  summaries: AISummary[];
}

// Initial seed data
const SEED_DATA: DbSchema = {
  users: [
    {
      id: 'default-user-id',
      email: 'alex.hackathon@example.com',
      full_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      created_at: new Date().toISOString(),
      password: 'password', // default password
    }
  ],
  tasks: [
    {
      id: 'task-1',
      user_id: 'default-user-id',
      title: 'Finish DSA revision by Friday',
      description: 'Revise Trees, Graphs, and Dynamic Programming algorithms.',
      category: 'Education',
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-2',
      user_id: 'default-user-id',
      title: 'Deploy AWS CloudNetSentinel backend',
      description: 'Set up ECS, IAM policies, and VPC routing rules.',
      category: 'Work',
      priority: 'high',
      status: 'in_progress',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day later
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-3',
      user_id: 'default-user-id',
      title: 'Write project guidelines documentation',
      description: 'Document standard developer workflow, lint rules, and PR requirements.',
      category: 'Work',
      priority: 'low',
      status: 'completed',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-4',
      user_id: 'default-user-id',
      title: 'Submit productivity report',
      description: 'Prepare and submit the weekly stats summary to team lead.',
      category: 'Work',
      priority: 'medium',
      status: 'pending',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
  ],
  notes: [
    {
      id: 'note-1',
      user_id: 'default-user-id',
      title: 'AWS IAM Best Practices',
      category: 'Cloud Computing',
      content: '1. Lock root user access keys.\n2. Create individual IAM users and use groups.\n3. Grant least privilege policies.\n4. Configure MFA for root and high-privileged roles.',
      ai_summary: 'Critical security protocols for AWS Identity and Access Management (IAM), emphasizing MFA configuration, least-privilege policies, and root credential security.',
      action_items: ['Enable MFA for AWS root account', 'Review and prune unused IAM roles'],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'note-2',
      user_id: 'default-user-id',
      title: 'DSA Revision Notes',
      category: 'Education',
      content: 'Core DSA revision topics. Trees (DFS, BFS, Binary Search Tree traversals). Graphs (Dijkstra, Bellman-Ford, Kruskal). Dynamic Programming (Knapsack, Longest Common Subsequence). Practice tree traversals and graph algorithms.',
      ai_summary: 'Study guide for key DSA topics including tree traversals, graph shortest-paths, and common DP paradigms.',
      action_items: ['Practice tree traversals', 'Implement Dijkstra from scratch'],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  reminders: [
    {
      id: 'reminder-1',
      user_id: 'default-user-id',
      title: 'Call Alex',
      remind_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'reminder-2',
      user_id: 'default-user-id',
      title: 'Pay electricity bill',
      remind_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'reminder-3',
      user_id: 'default-user-id',
      title: 'Attend team sync meeting',
      remind_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: 'dismissed',
      created_at: new Date().toISOString(),
    }
  ],
  summaries: [
    {
      id: 'summary-1',
      user_id: 'default-user-id',
      week_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      summary_text: 'You focused primarily on Cloud Computing, DSA, and Interview Preparation this week. You completed 12 of 20 tasks and improved productivity by 18%. Keep up the work on AWS deployments and DSA challenges.',
      productivity_score: 82,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]
};

// Initialize DB file if not exists
export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
  }
}

// Read database file
export function readDb(): DbSchema {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read local DB file. Resetting to seed data...', error);
    return SEED_DATA;
  }
}

// Write database file
export function writeDb(data: DbSchema) {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// CRUD Operations wrapper
export const mockDb = {
  // Users
  getUsers: () => readDb().users,
  getUserById: (id: string) => readDb().users.find(u => u.id === id),
  addUser: (user: Omit<User, 'id' | 'created_at'>) => {
    const db = readDb();
    const newUser: User = {
      ...user,
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },
  getUserByEmail: (email: string) => {
    return readDb().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  // Tasks
  getTasks: (userId: string) => readDb().tasks.filter(t => t.user_id === userId),
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => {
    const db = readDb();
    const newTask: Task = {
      ...task,
      id: `task-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString()
    };
    db.tasks.push(newTask);
    writeDb(db);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>) => {
    const db = readDb();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.tasks[idx] = {
      ...db.tasks[idx],
      ...updates,
      completed_at: updates.status === 'completed' && db.tasks[idx].status !== 'completed' 
        ? new Date().toISOString() 
        : updates.status && updates.status !== 'completed' 
          ? undefined 
          : db.tasks[idx].completed_at
    };
    writeDb(db);
    return db.tasks[idx];
  },
  deleteTask: (id: string) => {
    const db = readDb();
    const initialLen = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== id);
    if (db.tasks.length === initialLen) return false;
    writeDb(db);
    return true;
  },

  // Notes
  getNotes: (userId: string) => readDb().notes.filter(n => n.user_id === userId),
  addNote: (note: Omit<Note, 'id' | 'created_at'>) => {
    const db = readDb();
    const newNote: Note = {
      ...note,
      id: `note-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString()
    };
    db.notes.push(newNote);
    writeDb(db);
    return newNote;
  },
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>) => {
    const db = readDb();
    const idx = db.notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    db.notes[idx] = { ...db.notes[idx], ...updates };
    writeDb(db);
    return db.notes[idx];
  },
  deleteNote: (id: string) => {
    const db = readDb();
    const initialLen = db.notes.length;
    db.notes = db.notes.filter(n => n.id !== id);
    if (db.notes.length === initialLen) return false;
    writeDb(db);
    return true;
  },

  // Reminders
  getReminders: (userId: string) => readDb().reminders.filter(r => r.user_id === userId),
  addReminder: (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
    const db = readDb();
    const newReminder: Reminder = {
      ...reminder,
      id: `reminder-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString()
    };
    db.reminders.push(newReminder);
    writeDb(db);
    return newReminder;
  },
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id' | 'created_at'>>) => {
    const db = readDb();
    const idx = db.reminders.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.reminders[idx] = { ...db.reminders[idx], ...updates };
    writeDb(db);
    return db.reminders[idx];
  },
  deleteReminder: (id: string) => {
    const db = readDb();
    const initialLen = db.reminders.length;
    db.reminders = db.reminders.filter(r => r.id !== id);
    if (db.reminders.length === initialLen) return false;
    writeDb(db);
    return true;
  },

  // Weekly summaries
  getSummaries: (userId: string) => readDb().summaries.filter(s => s.user_id === userId),
  addSummary: (summary: Omit<AISummary, 'id' | 'created_at'>) => {
    const db = readDb();
    const newSummary: AISummary = {
      ...summary,
      id: `summary-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString()
    };
    db.summaries.push(newSummary);
    writeDb(db);
    return newSummary;
  }
};
