import { NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/gemini';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    const parsed = await parseNaturalLanguage(text);
    
    let createdItem: any = null;

    if (parsed.type === 'task') {
      createdItem = await db.addTask({
        user_id: user.id,
        title: parsed.title,
        description: parsed.description || '',
        category: parsed.category,
        priority: parsed.priority,
        status: 'pending',
        due_date: parsed.due_date || new Date().toISOString().split('T')[0]
      });
    } else if (parsed.type === 'todo') {
      createdItem = await db.addTask({
        user_id: user.id,
        title: parsed.title,
        description: parsed.description || '',
        category: 'Todo',
        priority: parsed.priority,
        status: 'pending',
        due_date: parsed.due_date || new Date().toISOString().split('T')[0]
      });
    } else if (parsed.type === 'note') {
      createdItem = await db.addNote({
        user_id: user.id,
        title: parsed.title,
        content: parsed.description || 'Quick note captured via natural language.',
        category: parsed.category,
        ai_summary: 'Automatically captured via voice/text parser.',
        action_items: []
      });
    } else if (parsed.type === 'reminder') {
      const remindAt = parsed.remind_at || new Date(Date.now() + 60 * 60 * 1000).toISOString();
      createdItem = await db.addReminder({
        user_id: user.id,
        title: parsed.title,
        remind_at: remindAt,
        status: 'active'
      });
    }

    return NextResponse.json({
      success: true,
      parsed,
      item: createdItem
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to parse natural language' }, { status: 500 });
  }
}
