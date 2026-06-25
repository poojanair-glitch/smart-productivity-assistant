import { NextResponse } from 'next/server';
import { generateWeeklyAIReport } from '@/lib/gemini';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const summaries = await db.getSummaries(user.id);
    return NextResponse.json({ summaries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch summaries' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user items as context
    const tasks = await db.getTasks(user.id);
    const notes = await db.getNotes(user.id);
    const reminders = await db.getReminders(user.id);

    // Call Gemini to analyze performance
    const report = await generateWeeklyAIReport(tasks, notes, reminders);

    // Save summary to database
    const savedSummary = await db.addSummary({
      user_id: user.id,
      week_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      summary_text: report.summary,
      productivity_score: report.score
    });

    return NextResponse.json({ summary: savedSummary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate weekly summary' }, { status: 500 });
  }
}
