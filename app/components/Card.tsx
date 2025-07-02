import React from 'react';

export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto mb-4">
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">{title}</h2>
      <div className="text-gray-600 text-sm sm:text-base">{children}</div>
    </div>
  );
}
