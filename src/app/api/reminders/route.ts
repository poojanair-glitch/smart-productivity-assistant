import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reminders = await db.getReminders(user.id);
    return NextResponse.json({ reminders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.remind_at) {
      return NextResponse.json({ error: 'Title and remind_at datetime are required' }, { status: 400 });
    }

    const newReminder = await db.addReminder({
      user_id: user.id,
      title: body.title,
      remind_at: body.remind_at,
      status: body.status || 'active'
    });

    return NextResponse.json({ reminder: newReminder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create reminder' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updatedReminder = await db.updateReminder(id, body);
    
    if (!updatedReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder: updatedReminder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const success = await db.deleteReminder(id);
    if (!success) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete reminder' }, { status: 500 });
  }
}
