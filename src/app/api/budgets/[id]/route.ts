// src/app/api/budgets/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { amount, month, categoryId } = await request.json();
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        amount,
        month: new Date(`${month}-01T00:00:00.000Z`),
        categoryId,
      },
    });
    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.budget.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}