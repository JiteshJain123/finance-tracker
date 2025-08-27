// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const cacheKey = 'transactions:list';
  try {
    const cachedTransactions = await redis.get(cacheKey);
    if (cachedTransactions) {
      return NextResponse.json(cachedTransactions); 
    }

    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        category: { select: { name: true } },
      },
    });

    await redis.set(cacheKey, JSON.stringify(transactions), { ex: 60 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cacheKey = 'transactions:list';
  try {
    const { amount, description, date, categoryId } = await request.json();
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: new Date(date),
        categoryId,
      },
    });
    await redis.del(cacheKey);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}