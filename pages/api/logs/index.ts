import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// 서비스 role key는 서버사이드에서만 사용! 노출 주의
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { emotion, note } = req.body;
    if (!emotion) {
      return res.status(400).json({ error: 'Emotion is required' });
    }
    // note XSS 방지 (간단한 태그 제거)
    const sanitizedNote = typeof note === 'string' ? note.replace(/<[^>]*>?/gm, '') : '';
    const { data, error } = await supabase
      .from('emotion_logs')
      .insert([{ emotion, note: sanitizedNote }]);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ message: 'Emotion saved', data });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
