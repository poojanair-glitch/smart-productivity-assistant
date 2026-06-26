import { NextResponse } from 'next/server';
import { summarizeDocument } from '@/lib/gemini';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await db.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';

    let textContent = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === 'txt') {
      textContent = buffer.toString('utf-8');
    } else if (fileType === 'pdf') {
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        textContent = textResult.text || '';
      } catch (err) {
        console.error('PDF parsing failed, using buffer string conversion:', err);
        textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
      }
    } else if (fileType === 'docx') {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        textContent = result.value || '';
      } catch (err: any) {
        console.error('DOCX parsing failed, using buffer string conversion fallback:', err);
        textContent = `[DOCX FILE: ${fileName}]\n` + buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
      }
      if (textContent.length > 8000) {
        textContent = textContent.substring(0, 8000);
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, DOCX, or TXT' }, { status: 400 });
    }

    if (!textContent || textContent.trim() === '') {
      textContent = `Empty document content or failed to parse text from ${fileName}.`;
    }

    // Call Gemini to summarize
    const aiResult = await summarizeDocument(fileName, textContent.substring(0, 8000));

    // Save results to notes
    const savedNote = await db.addNote({
      user_id: user.id,
      title: aiResult.title || fileName.replace(/\.[^/.]+$/, ''),
      content: textContent,
      category: 'Document Analysis',
      ai_summary: aiResult.summary,
      action_items: aiResult.actionItems,
      file_name: fileName,
      file_url: `/uploads/${fileName}`
    });

    // Auto-generate tasks
    const createdTasks = [];
    if (aiResult.generatedTasks && Array.isArray(aiResult.generatedTasks)) {
      for (const t of aiResult.generatedTasks) {
        const newTask = await db.addTask({
          user_id: user.id,
          title: t.title,
          description: `Auto-generated from document: ${fileName}`,
          category: 'Document Task',
          priority: t.priority || 'medium',
          status: 'pending',
          due_date: t.due_date || new Date().toISOString().split('T')[0]
        });
        createdTasks.push(newTask);
      }
    }

    return NextResponse.json({
      success: true,
      note: savedNote,
      tasks: createdTasks,
      summary: aiResult.summary,
      actionItems: aiResult.actionItems
    });
  } catch (error: any) {
    console.error('File parsing route failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to process file' }, { status: 500 });
  }
}
