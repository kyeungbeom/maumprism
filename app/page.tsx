'use client';

export default function IntroPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
      <h1 className="text-3xl font-bold mb-4">마음프리즘에 오신 것을 환영합니다!</h1>
      <p className="text-lg text-gray-700 mb-8">
        감정 기록과 상담을 통해 더 나은 하루를 시작해보세요.
      </p>
      <a
        href="/login"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        로그인 또는 회원가입
      </a>
    </main>
  );
}
