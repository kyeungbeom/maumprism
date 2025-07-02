'use client';
import React, { useEffect, useState, useRef } from 'react';
import AppWidgetLayout from '../../components/AppWidgetLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingWidget from '../../components/LoadingWidget';
import ErrorWidget from '../../components/ErrorWidget';
import Image from 'next/image';
import { useProtectedPage } from '../../hooks/useProtectedPage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const MBTI_LIST = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
];

interface Profile {
  name?: string;
  mbti?: string;
  hobbies?: string;
  interests?: string;
  bio?: string;
  contact?: string;
  avatar_url?: string;
  sns_instagram?: string;
  sns_facebook?: string;
  sns_twitter?: string;
  job?: string;
  region?: string;
  birthdate?: string;
  gender?: string;
}

export default function ProfileEditPage() {
  const { session, isLoading: isSessionLoading } = useProtectedPage();
  const userId = session?.user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState('');
  const [mbti, setMbti] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [interests, setInterests] = useState('');
  const [bio, setBio] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snsInstagram, setSnsInstagram] = useState('');
  const [snsFacebook, setSnsFacebook] = useState('');
  const [snsTwitter, setSnsTwitter] = useState('');
  const [job, setJob] = useState('');
  const [region, setRegion] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');

  // 유저 정보 fetch
  const {
    data: userProfile,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', userId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setNickname(userProfile.name || '');
      setMbti(userProfile.mbti || '');
      setHobbies(userProfile.hobbies || '');
      setInterests(userProfile.interests || '');
      setBio(userProfile.bio || '');
      setContact(userProfile.contact || '');
      setImageUrl(userProfile.avatar_url || '/maumprism-logo.png');
      setSnsInstagram(userProfile.sns_instagram || '');
      setSnsFacebook(userProfile.sns_facebook || '');
      setSnsTwitter(userProfile.sns_twitter || '');
      setJob(userProfile.job || '');
      setRegion(userProfile.region || '');
      setBirthdate(userProfile.birthdate || '');
      setGender(userProfile.gender || '');
    }
  }, [userProfile]);

  // 프로필 업데이트
  const { mutate: updateProfile, isPending: isSaving } = useMutation({
    mutationFn: async ({ name, image }: { name: string; image: string }) => {
      if (!userId) throw new Error('로그인 정보가 없습니다.');
      const { error } = await supabase
        .from('profiles')
        .update({ name, avatar_url: image })
        .eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: '프로필이 저장되었습니다!' });
    },
    onError: (err: { message?: string }) => {
      setError(err.message || '저장에 실패했습니다.');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    let uploadedImageUrl = imageUrl;
    if (imageFile) {
      // 이미지 업로드 API 호출
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        uploadedImageUrl = data.url;
      } else {
        setLoading(false);
        setError(data.error || '이미지 업로드 실패');
        return;
      }
    }
    updateProfile({ name: nickname, image: uploadedImageUrl });
    setLoading(false);
    setSuccess(true);
  };

  if (isSessionLoading || isLoading || isSaving)
    return (
      <AppWidgetLayout>
        <LoadingWidget />
      </AppWidgetLayout>
    );
  if (fetchError || error)
    return (
      <AppWidgetLayout>
        <ErrorWidget message={fetchError?.message || error} onRetry={() => setError('')} />
      </AppWidgetLayout>
    );

  return (
    <AppWidgetLayout>
      <form className="flex flex-col gap-4 items-center" onSubmit={handleSave}>
        <div className="relative w-20 h-20 mb-2">
          <Image
            src={imageUrl}
            alt="프로필 이미지"
            fill
            className="rounded-full object-cover border-2 border-pink-300"
          />
          <button
            type="button"
            className="absolute inset-0 w-full h-full rounded-full overflow-hidden bg-gray-800 bg-opacity-50 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-gray-400">이미지 변경</span>
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <Input
          placeholder="닉네임"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <div>
          <label className="block mb-1 font-semibold">MBTI</label>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
          >
            <option value="">선택</option>
            {MBTI_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="취미"
          type="text"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="관심사"
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="자기소개"
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="연락처"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <div>
          <label className="block mb-1 font-semibold">Instagram</label>
          <Input
            placeholder="@your_instagram"
            type="text"
            value={snsInstagram}
            onChange={(e) => setSnsInstagram(e.target.value)}
            className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Facebook</label>
          <Input
            placeholder="facebook.com/yourid"
            type="text"
            value={snsFacebook}
            onChange={(e) => setSnsFacebook(e.target.value)}
            className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Twitter</label>
          <Input
            placeholder="@your_twitter"
            type="text"
            value={snsTwitter}
            onChange={(e) => setSnsTwitter(e.target.value)}
            className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
          />
        </div>
        <Input
          placeholder="직업"
          type="text"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="지역"
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="생년월일"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <div>
          <label className="block mb-1 font-semibold">성별</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="남성"
                checked={gender === '남성'}
                onChange={(e) => setGender(e.target.value)}
              />{' '}
              남성
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="여성"
                checked={gender === '여성'}
                onChange={(e) => setGender(e.target.value)}
              />{' '}
              여성
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="기타"
                checked={gender === '기타'}
                onChange={(e) => setGender(e.target.value)}
              />{' '}
              기타
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value=""
                checked={gender === ''}
                onChange={(e) => setGender('')}
              />{' '}
              선택안함
            </label>
          </div>
        </div>
        {success && <div className="text-green-600 text-sm text-center">저장되었습니다.</div>}
        <Button
          className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
          type="submit"
        >
          저장
        </Button>
      </form>
    </AppWidgetLayout>
  );
}
