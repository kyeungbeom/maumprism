'use client';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">로그인 또는 회원가입</h1>
      <form className="flex flex-col gap-4 w-full max-w-xs">
        <input type="email" placeholder="이메일" className="border p-2 rounded" required />
        <input type="password" placeholder="비밀번호" className="border p-2 rounded" required />
        <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          로그인
        </button>
      </form>
      <p className="mt-4 text-gray-500">
        아직 계정이 없으신가요?{' '}
        <a href="#" className="text-blue-500 underline">
          회원가입
        </a>
      </p>
    </main>
  );
}
