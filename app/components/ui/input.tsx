'use client';
import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-300 transition-all"
      {...props}
    />
  );
}
