// app/api/chats/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from 'auth';
const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};


export async function GET(
    request: Request, 
    { params }: { params: Promise<{ id: string }> } // 类型定义
) {
  const { id } = await params; // 从 params 中获取 id

  try {
    const session = await auth();
    if (!session) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await db
      .select()
      .from(chats)
      .where(
        and(
          isUUID(id) ? eq(chats.id, id) : eq(chats.urlId, id),
          eq(chats.userId, session.user.id)
        )
      )
      .limit(1)

    if (!chat.length) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat[0]);
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}