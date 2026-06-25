import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isGeminiConfigured } from '@/lib/gemini';

export async function GET() {
  return NextResponse.json({
    isSupabaseConfigured,
    isGeminiConfigured
  });
}
