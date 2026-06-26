import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task, Note, Reminder } from './db';

// Enforce environment validation
const getApiKey = (): string => {
  let key = '';
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envLocalPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, 'utf8');
        const match = content.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
        if (match && match[1]) {
          const val = match[1].trim().replace(/^["']|["']$/g, '');
          if (val && !val.toLowerCase().includes('placeholder') && val !== 'YOUR_GEMINI_API_KEY') {
            key = val;
          }
        }
      }
    } catch (e) {
      // Ignore error
    }
  }
  return key || process.env.GEMINI_API_KEY || '';
};

const apiKey = getApiKey();
export const isGeminiConfigured = !!apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && !apiKey.toLowerCase().includes('placeholder');

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

// Date Context helper
const getCurrentDateContext = () => {
  const now = new Date();
  return `Current Date: ${now.toDateString()}, Current Time: ${now.toLocaleTimeString()}, Day of week: ${now.toLocaleDateString('en-US', { weekday: 'long' })}.`;
};

export interface ParsedItem {
  type: 'task' | 'note' | 'reminder' | 'todo';
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // YYYY-MM-DD
  remind_at?: string; // ISO datetime
}

// 1. Natural Language Input Parser
export async function parseNaturalLanguage(text: string): Promise<ParsedItem> {
  if (!isGeminiConfigured || !genAI) {
    return parseNaturalLanguageFallback(text);
  }

  try {
    const dateContext = getCurrentDateContext();
    const prompt = `
You are an AI assistant parsing user productivity inputs.
Context:
- ${dateContext}

Parse the following user input: "${text}"

Determine if it is a "task", "note", "reminder", or "todo".
Output JSON matching the following schema. Resolve relative dates like "tomorrow", "next monday", "by friday" to absolute dates based on the current context date.
For reminders, provide "remind_at" as an ISO string.
For tasks, provide "due_date" as "YYYY-MM-DD".
Choose a fitting category (e.g. Work, Education, Personal, Finance, Health) and a priority (low, medium, high).

Schema:
{
  "type": "task" | "note" | "reminder" | "todo",
  "title": "Short descriptive title",
  "description": "More context if present, otherwise empty",
  "category": "Work" | "Education" | "Personal" | "Finance" | "Health" | "General",
  "priority": "low" | "medium" | "high",
  "due_date": "YYYY-MM-DD" (optional),
  "remind_at": "ISO-8601 string" (optional)
}

Output ONLY the raw JSON. No markdown tags, no wrap.
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    const jsonText = result.response.text().trim();
    return JSON.parse(jsonText) as ParsedItem;
  } catch (error) {
    console.error('Gemini API call failed, falling back to local parsing:', error);
    return parseNaturalLanguageFallback(text);
  }
}

// 2. Weekly summary generator
export async function generateWeeklyAIReport(
  tasks: Task[],
  notes: Note[],
  reminders: Reminder[]
): Promise<{ summary: string; score: number }> {
  if (!isGeminiConfigured || !genAI) {
    return generateWeeklyAIReportFallback(tasks, notes, reminders);
  }

  try {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const noteCount = notes.length;

    const prompt = `
You are a productivity performance analyst. Summarize this user's work this week:
- Tasks: ${total} total, ${completed} completed.
- Notes taken: ${noteCount}.
- Reminders set: ${reminders.length}.
- Task list: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, category: t.category, priority: t.priority })))}

Generate a friendly weekly summary of accomplishments, focus categories, and areas for improvement.
Include a numerical Productivity Score from 0 to 100 representing their week based on completed vs total tasks, priorities, etc.

Output JSON only in this format:
{
  "summary": "You focused primarily on [Categories] this week. You completed [X] of [Y] tasks...",
  "productivity_score": 85
}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text().trim());
    let score = parsed.productivity_score;
    if (total === 0 || completed === 0) {
      score = 0;
    }
    return {
      summary: parsed.summary,
      score: score
    };
  } catch (error) {
    console.error('Gemini report generation failed, falling back to local analysis:', error);
    return generateWeeklyAIReportFallback(tasks, notes, reminders);
  }
}

// 3. Document/File summarization
export async function summarizeDocument(
  fileName: string,
  content: string
): Promise<{
  title: string;
  summary: string;
  actionItems: string[];
  generatedTasks: { title: string; priority: 'low' | 'medium' | 'high'; due_date: string }[];
}> {
  if (!isGeminiConfigured || !genAI) {
    return summarizeDocumentFallback(fileName, content);
  }

  try {
    const baseDate = new Date().toISOString().split('T')[0];
    
    const prompt = `
Analyze the text content from uploaded file "${fileName}".
Content:
"""
${content}
"""

Perform the following:
1. Extract a clear title for the note.
2. Summarize the text content (max 3 sentences).
3. Extract up to 4 key action items.
4. Auto-generate up to 3 structured Tasks from the action items (assign reasonable priority: low/medium/high, and a due_date in YYYY-MM-DD relative to current date ${baseDate}).

Output JSON only:
{
  "title": "Title of Note",
  "summary": "Short 2-3 sentence summary...",
  "actionItems": ["Action Item 1", "Action Item 2"],
  "generatedTasks": [
    { "title": "Task title", "priority": "low"|"medium"|"high", "due_date": "YYYY-MM-DD" }
  ]
}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Gemini document summary failed, falling back to local summary:', error);
    return summarizeDocumentFallback(fileName, content);
  }
}

// 4. AI Chatbot Assistant
export async function askAIChat(
  userMsg: string,
  history: { role: 'user' | 'model'; parts: string }[],
  context: { tasks: Task[]; notes: Note[]; reminders: Reminder[] }
): Promise<string> {
  if (!isGeminiConfigured || !genAI) {
    return askAIChatFallback(userMsg, history, context);
  }

  try {
    const dateContext = getCurrentDateContext();
    
    const parsedHistory = history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.parts }]
    }));

    const systemInstruction = `
You are the Smart Productivity Assistant chatbot. You are helpful, professional, and friendly.
You have access to the user's current productivity items:
- Tasks: ${JSON.stringify(context.tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status, category: t.category, due_date: t.due_date })))}
- Notes: ${JSON.stringify(context.notes.map(n => ({ title: n.title, content: n.content.substring(0, 100) + '...', category: n.category })))}
- Reminders: ${JSON.stringify(context.reminders.map(r => ({ title: r.title, remind_at: r.remind_at, status: r.status })))}

Current Time Context:
- ${dateContext}

Capabilities:
1. Answer queries about tasks, notes, reminders. E.g. "What are my pending tasks?" or "What should I finish today?"
2. Provide general personal organization, study tips, or work scheduling guidelines.
3. Help users summarize notes, list high-priority work, or list action items.

Always format your response with clean Markdown. Keep it direct, structured, and helpful.
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction
    });
    
    const chat = model.startChat();
    
    const result = await chat.sendMessage(userMsg);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini chat failed, falling back to offline helper response:', error);
    return askAIChatFallback(userMsg, history, context, error);
  }
}

// ==========================================
// LOCAL HEURISTIC FALLBACK ALGORITHMS (OFFLINE)
// ==========================================

function parseNaturalLanguageFallback(text: string): ParsedItem {
  const lower = text.toLowerCase();
  
  // 1. Detect item type
  let type: 'task' | 'note' | 'reminder' | 'todo' = 'task';
  if (lower.includes('remind') || lower.includes('alarm') || lower.includes('alert') || lower.includes('schedule')) {
    type = 'reminder';
  } else if (lower.includes('note') || lower.includes('remember that') || lower.includes('write down') || lower.includes('memo')) {
    type = 'note';
  } else if (lower.includes('todo') || lower.includes('to-do') || lower.includes('checklist')) {
    type = 'todo';
  }

  // 2. Category classification
  let category = 'General';
  if (lower.includes('work') || lower.includes('office') || lower.includes('meeting') || lower.includes('deploy') || lower.includes('aws') || lower.includes('project')) {
    category = 'Work';
  } else if (lower.includes('study') || lower.includes('learn') || lower.includes('dsa') || lower.includes('exam') || lower.includes('revision') || lower.includes('course') || lower.includes('read')) {
    category = 'Education';
  } else if (lower.includes('pay') || lower.includes('bill') || lower.includes('buy') || lower.includes('grocery') || lower.includes('rent') || lower.includes('finance')) {
    category = 'Finance';
  } else if (lower.includes('doctor') || lower.includes('gym') || lower.includes('workout') || lower.includes('run') || lower.includes('meds') || lower.includes('health')) {
    category = 'Health';
  } else if (lower.includes('call') || lower.includes('mom') || lower.includes('friend') || lower.includes('birthday') || lower.includes('dinner')) {
    category = 'Personal';
  }

  // 3. Priority detection
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('important') || lower.includes('critical') || lower.includes('high')) {
    priority = 'high';
  } else if (lower.includes('low') || lower.includes('someday') || lower.includes('backlog') || lower.includes('maybe')) {
    priority = 'low';
  }

  // 4. Scheduling & Dates
  const now = new Date();
  let dueDate = now.toISOString().split('T')[0];
  let remindAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now default

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    dueDate = tomorrow.toISOString().split('T')[0];
    // Set default reminder tomorrow at 9 AM
    tomorrow.setHours(9, 0, 0, 0);
    remindAt = tomorrow.toISOString();
  } else if (lower.includes('next week') || lower.includes('next monday')) {
    const nextMon = new Date(now);
    nextMon.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    dueDate = nextMon.toISOString().split('T')[0];
    nextMon.setHours(9, 0, 0, 0);
    remindAt = nextMon.toISOString();
  } else if (lower.includes('tonight') || lower.includes('today')) {
    const tonight = new Date(now);
    tonight.setHours(20, 0, 0, 0);
    remindAt = tonight.toISOString();
  }

  // Parse time indicators like "at 6 pm" or "at 3:30 pm"
  const timeRegex = /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  const match = timeRegex.exec(text);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3].toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const schedDate = new Date(dueDate);
    schedDate.setHours(hours, minutes, 0, 0);
    remindAt = schedDate.toISOString();
  }

  // 5. Clean up title
  let title = text
    .replace(/remind me to/i, '')
    .replace(/create a task to/i, '')
    .replace(/add a note about/i, '')
    .replace(/remember to/i, '')
    .replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)/i, '')
    .replace(/tomorrow/i, '')
    .replace(/today/i, '')
    .replace(/tonight/i, '')
    .replace(/next monday/i, '')
    .trim();

  // Strip leading punctuation
  title = title.replace(/^[:\s,]+/, '');
  
  if (!title) {
    title = type.charAt(0).toUpperCase() + type.slice(1) + ' Item';
  } else {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    type,
    title,
    category,
    priority,
    due_date: dueDate,
    remind_at: remindAt,
    description: `Captured offline using Natural Language Processing. Raw input: "${text}"`
  };
}

function generateWeeklyAIReportFallback(
  tasks: Task[],
  notes: Note[],
  reminders: Reminder[]
): { summary: string; score: number } {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  
  // Calculate a mock performance score
  const score = (total > 0 && completed > 0) ? Math.round((completed / total) * 100) : 0;

  // Determine top categories
  const categories: Record<string, number> = {};
  tasks.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  const topCategories = Object.keys(categories)
    .sort((a, b) => categories[b] - categories[a])
    .slice(0, 2)
    .join(' and ');

  const focusStr = topCategories ? `Your primary focus areas this week were ${topCategories}.` : 'You have maintained balanced task categorization this week.';

  let summary = `You completed ${completed} of ${total} tasks this week. ${focusStr} `;
  if (score >= 80) {
    summary += 'Outstanding progress! Your completion velocity is optimal, and you are resolving high-priority work efficiently. Keep up this momentum.';
  } else if (score >= 50) {
    summary += 'Good effort! You made steady progress on your tasks. Next week, try breaking down remaining tasks into smaller sub-tasks to improve your velocity.';
  } else {
    summary += 'A quieter week on tasks completion. We recommend scheduling 15 minutes tomorrow to review your backlog and set up high-priority reminders for upcoming deadlines.';
  }

  return {
    summary,
    score
  };
}

function summarizeDocumentFallback(
  fileName: string,
  content: string
): {
  title: string;
  summary: string;
  actionItems: string[];
  generatedTasks: { title: string; priority: 'low' | 'medium' | 'high'; due_date: string }[];
} {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
  const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  const wordCount = content.trim().split(/\s+/).length;

  const summary = `Parsed note "${title}" containing ${wordCount} words. The document outlines instructions, workflows, and deliverables related to productivity management.`;
  
  // Simple regex parser to grab lines containing action indicators
  const sentences = content.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 10);
  const actionIndicators = ['must', 'need to', 'should', 'implement', 'deploy', 'review', 'create', 'write', 'finish', 'complete'];
  
  const actionItems: string[] = [];
  for (const sentence of sentences) {
    const lowerSent = sentence.toLowerCase();
    if (actionIndicators.some(ind => lowerSent.includes(ind))) {
      actionItems.push(sentence.charAt(0).toUpperCase() + sentence.slice(1));
      if (actionItems.length >= 4) break;
    }
  }

  if (actionItems.length === 0) {
    actionItems.push('Review the main points discussed in the document.');
    actionItems.push('Formulate next steps checklist based on project contents.');
  }

  const baseDate = new Date();
  const generatedTasks = actionItems.slice(0, 3).map((item, idx) => {
    const taskDate = new Date(baseDate);
    taskDate.setDate(baseDate.getDate() + (idx + 2));
    
    return {
      title: item.length > 60 ? item.substring(0, 57) + '...' : item,
      priority: (idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      due_date: taskDate.toISOString().split('T')[0]
    };
  });

  return {
    title,
    summary,
    actionItems,
    generatedTasks
  };
}

function askAIChatFallback(
  userMsg: string,
  history: { role: 'user' | 'model'; parts: string }[],
  context: { tasks: Task[]; notes: Note[]; reminders: Reminder[] },
  error?: any
): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('task') || lower.includes('todo') || lower.includes('to-do') || lower.includes('pending')) {
    const pendingTasks = context.tasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length === 0) {
      return `You have **no pending tasks** right now! All caught up. Great job!`;
    }
    
    return `Here are your pending tasks:
${pendingTasks.map(t => `- **${t.title}** [Category: ${t.category} | Priority: ${t.priority.toUpperCase()} | Due: ${t.due_date}]`).join('\n')}

Would you like to resolve any of these or capture a new task?`;
  }

  if (lower.includes('reminder') || lower.includes('scheduled') || lower.includes('alarm')) {
    if (context.reminders.length === 0) {
      return `You don't have any active reminders set. Dictate a reminder to me (e.g. "Remind me to call Mom tomorrow at 6 PM") to set one!`;
    }
    
    return `Here are your active reminders:
${context.reminders.map(r => `- **${r.title}** (Scheduled for: ${new Date(r.remind_at).toLocaleString()})`).join('\n')}

I will send notifications when these times arrive.`;
  }

  if (lower.includes('note') || lower.includes('document')) {
    if (context.notes.length === 0) {
      return `Your notes library is currently empty. You can write note entries manually or upload text files/PDFs using the file capture widget.`;
    }

    return `Here are your notes:
${context.notes.map(n => `- **${n.title}** [Category: ${n.category}]`).join('\n')}

Type a query if you want me to search, summarize, or retrieve the contents of any specific note.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I am your AI Productivity Assistant, running locally in offline mode. 

I have access to your workspace context and can summarize, organize, and answer questions. Try asking:
- *What are my pending tasks?*
- *What reminders do I have?*
- *How did my productivity go?*`;
  }

  if (error) {
    return `I've received your query: "${userMsg}". 

Currently, I'm running in offline fallback mode because the Gemini API call failed. 

**Error details:** ${error.message || error}

Please check your \`GEMINI_API_KEY\` configuration, quota limits, or network connection. In the meantime, I can manage your tasks, check your reminders, and locate notes offline.`;
  }

  return `I've received your query: "${userMsg}". 

Currently, I'm running in offline fallback mode because no \`GEMINI_API_KEY\` was detected. I can manage your tasks, check your reminders, and locate notes offline. 

Let me know how you'd like to organize your day!`;
}
