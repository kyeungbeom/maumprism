import { useState } from 'react';

export function useAuth() {
  // 임시: 실제 인증 로직은 추후 구현
  const [user, setUser] = useState<{ email: string } | null>(null);
  return { user, setUser };
}
