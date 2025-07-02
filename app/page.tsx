export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fef7f3] to-[#f0f9ff] p-8">
      <div className="rounded-2xl shadow-xl bg-white p-10 w-full max-w-md text-center space-y-4">
        <img src="/logo.png" alt="Maum Prism Logo" className="w-24 h-24 mx-auto" />
        <h1 className="text-3xl font-bold text-[#333]">마음 프리즘에 오신 것을 환영해요 💖</h1>
        <p className="text-[#555]">마음을 다채로운 빛으로 비추는 감정 기록 위젯 서비스입니다.</p>
      </div>
    </main>
  );
}
