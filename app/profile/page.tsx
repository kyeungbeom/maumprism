'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const emptyProfile = {
  email: '',
  name: '',
  gender: '',
  birth_date: '',
  birth_time: '',
  mbti: '',
  job: '',
  hobbies: '',
  interests: '',
  is_active: true,
};

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  type Profile = typeof emptyProfile;
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  // 자동 로그인 체크
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id, session.user.email ?? '');
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchProfile(data.session.user.id, data.session.user.email ?? '');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // 회원가입
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
    });
    if (error) setError(error.message);
    else setMode('signIn');
    setLoading(false);
  };

  // 로그인
  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authForm.email,
      password: authForm.password,
    });
    if (error) setError(error.message);
    setSession(data.session);
    if (data.session) fetchProfile(data.session.user.id, data.session.user.email ?? '');
    setLoading(false);
  };

  // 프로필 조회 및 자동 생성
  const fetchProfile = async (uid: string, email: string) => {
    setLoading(true);
    setError('');
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error && status !== 406) {
      setError(error.message);
    } else if (!data) {
      // row not found, 자동 생성
      await insertProfile(uid, email);
    } else {
      setProfile({
        ...data,
        hobbies: (data.hobbies || []).join(','),
        interests: (data.interests || []).join(','),
      });
    }
    setLoading(false);
  };

  // 프로필 신규 등록
  const insertProfile = async (uid: string, email: string) => {
    const { error } = await supabase.from('profiles').insert([
      {
        id: uid,
        user_id: uid,
        email,
        is_active: true,
      },
    ]);
    if (!error) fetchProfile(uid, email);
  };

  // 프로필 저장(upsert)
  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = session?.user;
    const hobbiesArr = profile.hobbies?.trim()
      ? profile.hobbies.split(',').map((v: string) => v.trim())
      : [];
    const interestsArr = profile.interests?.trim()
      ? profile.interests.split(',').map((v: string) => v.trim())
      : [];
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      user_id: user?.id,
      email: user?.email,
      name: profile.name,
      gender: profile.gender,
      birth_date: profile.birth_date,
      birth_time: profile.birth_time,
      mbti: profile.mbti,
      job: profile.job,
      hobbies: hobbiesArr,
      interests: interestsArr,
      is_active: profile.is_active,
    });
    if (error) setError(error.message);
    else fetchProfile(user?.id ?? '', user?.email ?? '');
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">{mode === 'signIn' ? '로그인' : '회원가입'}</h2>
        <form onSubmit={mode === 'signIn' ? signIn : signUp} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            type="email"
            placeholder="이메일"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="비밀번호"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? '처리 중...' : mode === 'signIn' ? '로그인' : '회원가입'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 underline"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          >
            {mode === 'signIn' ? '회원가입' : '로그인'}으로 전환
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">프로필 관리</h2>
      <form onSubmit={updateProfile} className="space-y-4">
        <input className="w-full border p-2 rounded" type="email" value={profile.email} disabled />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="이름"
          value={profile.name || ''}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="성별"
          value={profile.gender || ''}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="date"
          placeholder="생년월일"
          value={profile.birth_date || ''}
          onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="time"
          placeholder="출생시간"
          value={profile.birth_time || ''}
          onChange={(e) => setProfile({ ...profile, birth_time: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="MBTI"
          value={profile.mbti || ''}
          onChange={(e) => setProfile({ ...profile, mbti: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="직업"
          value={profile.job || ''}
          onChange={(e) => setProfile({ ...profile, job: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="취미(콤마로 구분)"
          value={profile.hobbies || ''}
          onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="관심사(콤마로 구분)"
          value={profile.interests || ''}
          onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profile.is_active}
            onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })}
          />
          <span>활성화</span>
        </label>
        <button
          className="w-full bg-green-500 text-white p-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? '저장 중...' : '프로필 저장'}
        </button>
      </form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
