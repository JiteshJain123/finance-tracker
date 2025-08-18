// src/app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Correct type definition for the route handler's second argument
interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    const { amount, description, date } = await request.json();
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        description,
        date: new Date(date),
      },
    });
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}