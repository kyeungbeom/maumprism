import { NextResponse } from 'next/server';
import { HistoryLog } from '@/utils/types';
import HistoryCard from '@/components/HistoryCard';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: { user_id: string } }) {
  // TODO: Replace with actual Supabase client logic for App Router
  // Example: const { user } = await supabase.auth.getUser();
  // For now, just return a placeholder
  return NextResponse.json({ data: [] });
}

export async function DELETE(req: Request, { params }: { params: { user_id: string } }) {
  // TODO: Replace with actual Supabase client logic for App Router
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { user_id, title, message, type, url } = await req.json();
  if (!user_id || !title || !message) {
    return NextResponse.json({ error: '필수값 누락' }, { status: 400 });
  }
  const { error } = await supabase
    .from('notifications')
    .insert([{ user_id, title, message, type, url }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function sendEmail(to: string, subject: string, text: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      text,
    }),
  });
}

async function logEmail(to: string, event: string) {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, event, sent_at: new Date().toISOString() }),
  });
}
