import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'edge';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  // Next.js API Route에서는 formData()를 지원하지 않습니다. 파일 업로드는 미들웨어(multer 등) 필요
  return res.status(501).json({ error: '파일 업로드는 지원되지 않습니다. (formData 미지원)' });
}
