import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ role: 'guest', user: null });
  }
  // Assume user role is stored in user.user_metadata.role or public/profiles table
  const role = user.user_metadata?.role || 'user';
  // Optionally, fetch from public.profiles if needed
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (profile?.role) role = profile.role;
  return NextResponse.json({
    id: user.id,
    email: user.email,
    role,
    user,
  });
}
