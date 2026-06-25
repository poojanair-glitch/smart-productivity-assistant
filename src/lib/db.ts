import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { mockDb } from './mockDb';

const isSupabaseConfigured = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return false;

  const urlLower = url.toLowerCase();
  const keyLower = key.toLowerCase();
  if (
    urlLower.includes('placeholder') ||
    urlLower.includes('your_') ||
    keyLower.includes('placeholder') ||
    keyLower.includes('your_')
  ) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
})();

// Interfaces mapping directly to database fields
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
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
  updated_at?: string;
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
  updated_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  remind_at: string;
  status: 'active' | 'snoozed' | 'dismissed';
  created_at: string;
  updated_at?: string;
}

export interface AISummary {
  id: string;
  user_id: string;
  week_start_date: string;
  summary_text: string;
  productivity_score: number;
  created_at: string;
  updated_at?: string;
}

export const db = {
  // Current authenticated user profile helper
  getCurrentUser: async (): Promise<User | null> => {
    try {
      if (!isSupabaseConfigured) {
        const cookieStore = await cookies();
        const userId = cookieStore.get('sb-mock-session')?.value;
        if (!userId) return null;

        const user = mockDb.getUserById(userId);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at
        };
      }

      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      // Query Profile data synchronized via signup trigger
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || 'Smart User',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        created_at: user.created_at
      };
    } catch (e) {
      console.error('Failed to get current user session:', e);
      return null;
    }
  },

  // TASKS CRUD
  getTasks: async (userId: string): Promise<Task[]> => {
    if (!isSupabaseConfigured) {
      return mockDb.getTasks(userId) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('getTasks query failed:', error.message);
      throw error;
    }
    return data as Task[];
  },

  addTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    if (!isSupabaseConfigured) {
      return mockDb.addTask(task) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    if (error) {
      console.error('addTask insert failed:', error.message);
      throw error;
    }
    return data as Task;
  },

  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> => {
    if (!isSupabaseConfigured) {
      return mockDb.updateTask(id, updates) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('updateTask patch failed:', error.message);
      throw error;
    }
    return data as Task;
  },

  deleteTask: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      return mockDb.deleteTask(id);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('deleteTask remove failed:', error.message);
      throw error;
    }
    return true;
  },

  // NOTES CRUD
  getNotes: async (userId: string): Promise<Note[]> => {
    if (!isSupabaseConfigured) {
      return mockDb.getNotes(userId) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('getNotes query failed:', error.message);
      throw error;
    }
    return data as Note[];
  },

  addNote: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    if (!isSupabaseConfigured) {
      return mockDb.addNote(note) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    if (error) {
      console.error('addNote insert failed:', error.message);
      throw error;
    }
    return data as Note;
  },

  updateNote: async (id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<Note | null> => {
    if (!isSupabaseConfigured) {
      return mockDb.updateNote(id, updates) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('updateNote patch failed:', error.message);
      throw error;
    }
    return data as Note;
  },

  deleteNote: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      return mockDb.deleteNote(id);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('deleteNote remove failed:', error.message);
      throw error;
    }
    return true;
  },

  // REMINDERS CRUD
  getReminders: async (userId: string): Promise<Reminder[]> => {
    if (!isSupabaseConfigured) {
      return mockDb.getReminders(userId) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('remind_at', { ascending: true });
    if (error) {
      console.error('getReminders query failed:', error.message);
      throw error;
    }
    return data as Reminder[];
  },

  addReminder: async (reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> => {
    if (!isSupabaseConfigured) {
      return mockDb.addReminder(reminder) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reminders')
      .insert([reminder])
      .select()
      .single();
    if (error) {
      console.error('addReminder insert failed:', error.message);
      throw error;
    }
    return data as Reminder;
  },

  updateReminder: async (id: string, updates: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>): Promise<Reminder | null> => {
    if (!isSupabaseConfigured) {
      return mockDb.updateReminder(id, updates) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reminders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('updateReminder patch failed:', error.message);
      throw error;
    }
    return data as Reminder;
  },

  deleteReminder: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      return mockDb.deleteReminder(id);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('deleteReminder remove failed:', error.message);
      throw error;
    }
    return true;
  },

  // WEEKLY REPORT SUMMARIES CRUD
  getSummaries: async (userId: string): Promise<AISummary[]> => {
    if (!isSupabaseConfigured) {
      return mockDb.getSummaries(userId) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });
    if (error) {
      console.error('getSummaries query failed:', error.message);
      throw error;
    }
    return data as AISummary[];
  },

  addSummary: async (summary: Omit<AISummary, 'id' | 'created_at' | 'updated_at'>): Promise<AISummary> => {
    if (!isSupabaseConfigured) {
      return mockDb.addSummary(summary) as any;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('weekly_summaries')
      .insert([summary])
      .select()
      .single();
    if (error) {
      console.error('addSummary insert failed:', error.message);
      throw error;
    }
    return data as AISummary;
  }
};
