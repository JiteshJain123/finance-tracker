// src/app/api/budgets/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { category: true },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('GET Budget API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch budgets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, month, categoryId } = body;
    
    // Validation
    if (!amount || !month || !categoryId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Amount, month, and categoryId are required'
      }, { status: 400 });
    }

    // Validate amount is a number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount',
        details: 'Amount must be a positive number'
      }, { status: 400 });
    }

    // Validate month format (should be YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json({ 
        error: 'Invalid month format',
        details: 'Month must be in YYYY-MM format'
      }, { status: 400 });
    }

    // Create proper date
    const budgetDate = new Date(`${month}-01T00:00:00.000Z`);
    if (isNaN(budgetDate.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date',
        details: 'Could not parse the provided month'
      }, { status: 400 });
    }

    // Check if categoryId exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return NextResponse.json({ 
        error: 'Category not found',
        details: 'The specified category does not exist'
      }, { status: 400 });
    }

    // Use upsert with the compound unique constraint
    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month: {
          categoryId: categoryId,
          month: budgetDate
        }
      },
      update: {
        amount: numericAmount,
      },
      create: {
        amount: numericAmount,
        month: budgetDate,
        categoryId: categoryId,
      },
      include: {
        category: true,
      }
    });

    return NextResponse.json(budget, { status: 201 });

  } catch (error) {
    console.error('POST Budget API Error:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'Budget conflict',
          details: 'A budget for this category and month already exists'
        }, { status: 409 });
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: 'Invalid category',
          details: 'The specified category does not exist'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create budget',
      details: error instanceof Error ? error.message : 'Unknown server error'
    }, { status: 500 });
  }
}