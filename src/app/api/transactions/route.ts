// src/app/api/transactions/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/transactions
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// This function handles POST requests to /api/transactions
export async function POST(request: Request) {
  try {
    const { amount, description, date } = await request.json();
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: new Date(date),
      },
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}