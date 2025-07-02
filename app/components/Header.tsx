'use client';

import React from 'react';
// import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  // const { data: session } = useSession();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        background: '#f5f5f5',
      }}
    >
      <span style={{ fontWeight: 'bold' }}>MAUMPRISM</span>
      {/* session?.user ? (
        <span>
          👋 {session.user.name}님 <LogoutButton />
        </span>
      ) : ( */}
      <Link href="/login" legacyBehavior>
        <a>로그인</a>
      </Link>
    </header>
  );
}
