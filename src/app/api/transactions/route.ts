import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const cacheKey = 'transactions:list';
  try {
    const cachedTransactions = await redis.get(cacheKey);

    if (cachedTransactions) {
      if (typeof cachedTransactions === 'string') {
        return NextResponse.json(JSON.parse(cachedTransactions));
      } else {
        // If it's already parsed (an object), return it directly
        return NextResponse.json(cachedTransactions);
      }
    }

    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
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
    const { amount, description, date } = await request.json();
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: new Date(date),
      },
    });

    await redis.del(cacheKey);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cacheKey = 'transactions:list';

  try {
    const body = await request.json();
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: body,
    });

    await redis.del(cacheKey);
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
