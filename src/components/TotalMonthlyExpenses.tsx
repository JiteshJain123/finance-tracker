// src/components/TotalMonthlyExpenses.tsx
'use client';

import { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  amount: number;
  date: string;
}

interface TotalMonthlyExpensesProps {
  selectedMonth: string;
}

export function TotalMonthlyExpenses({ selectedMonth }: TotalMonthlyExpensesProps) {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        const transactions: Transaction[] = await res.json();
        
        if (!Array.isArray(transactions)) {
          setTotal(0);
          return;
        }

        const monthlyTotal = transactions
          .filter(t => new Date(t.date).toISOString().startsWith(selectedMonth))
          .reduce((sum, t) => sum + t.amount, 0);

        setTotal(monthlyTotal);
      } catch (error) {
        console.error('Failed to fetch total monthly expenses', error);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTotal();
  }, [selectedMonth]);

  return (
    <div>
      {loading ? (
        <div className="text-3xl font-bold">...</div>
      ) : (
        <div className="text-3xl font-bold text-green-600">
          ${total.toFixed(2)}
        </div>
      )}
    </div>
  );
}