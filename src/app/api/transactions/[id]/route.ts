// src/app/api/transactions/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const cacheKey = 'transactions:list';
  const { id } = await params;
  try {
    const { amount, description, date, categoryId } = await request.json();
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        description,
        date: new Date(date),
        categoryId,
      },
    });
    await redis.del(cacheKey);
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const cacheKey = 'transactions:list';
  const { id } = await params;
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    await redis.del(cacheKey);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}