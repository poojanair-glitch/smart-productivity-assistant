import { NextResponse } from 'next/server';
import { askAIChat } from '@/lib/gemini';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Fetch all user state for the chatbot context
    const tasks = await db.getTasks(user.id);
    const notes = await db.getNotes(user.id);
    const reminders = await db.getReminders(user.id);

    const chatHistory = history || [];
    const reply = await askAIChat(message, chatHistory, { tasks, notes, reminders });

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Chatbot error' }, { status: 500 });
  }
}
