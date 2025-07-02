'use server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function updateName(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    throw new Error('로그인 필요');
  }
  const email = session.user.email;
  const name = formData.get('name') as string;
  if (!name) {
    throw new Error('이름을 입력하세요');
  }
  const user = await prisma.user.update({
    where: { email },
    data: { name },
  });
  return { ok: true, name: user.name };
}
