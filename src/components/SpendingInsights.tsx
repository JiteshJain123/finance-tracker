// src/components/SpendingInsights.tsx
'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Insight {
  overBudget: { category: string; spent: number; budget: number; month: string }[];
  topCategory: { category: string; spent: number } | null;
  spendingTrend: string;
}

interface Budget {
  amount: number;
  month: string;
  category: { name: string };
  categoryId: string;
}

interface Transaction {
  amount: number;
  date: string;
  categoryId: string;
}

interface SpendingInsightsProps {
  selectedMonth: string;
}

export function SpendingInsights({ selectedMonth }: SpendingInsightsProps) {
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, transactionsRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/transactions'),
        ]);
        
        const budgets: Budget[] = await budgetsRes.json();
        const transactions: Transaction[] = await transactionsRes.json();

        if (!Array.isArray(budgets) || !Array.isArray(transactions)) {
          setInsights(null);
          return;
        }

        const monthlyBudgets = budgets.filter(b => b.month.startsWith(selectedMonth));
        const monthlyTransactions = transactions.filter(t => new Date(t.date).toISOString().startsWith(selectedMonth));

        const categoryTotals: { [key: string]: number } = {};
        monthlyTransactions.forEach(t => {
          categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        });

        const overBudget = monthlyBudgets
          .filter(b => categoryTotals[b.categoryId] > b.amount)
          .map(b => ({
            category: b.category.name,
            spent: categoryTotals[b.categoryId],
            budget: b.amount,
            month: new Date(b.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          }));

        const topCategory = Object.entries(categoryTotals)
          .reduce((top, [categoryId, spent]) => {
            if (!top || spent > top.spent) {
              const category = monthlyBudgets.find(b => b.categoryId === categoryId)?.category.name || 'Uncategorized';
              return { category, spent };
            }
            return top;
          }, null as { category: string; spent: number } | null);

        setInsights({ overBudget, topCategory, spendingTrend: 'Stable' });
      } catch (error) {
        console.error('Failed to fetch spending insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  if (loading) return <div>Loading insights...</div>;
  if (!insights) return <div>No insights available.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Over-budget Alerts</h3>
        {insights.overBudget.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {insights.overBudget.map(item => (
              <li key={item.category} className="text-red-500">
                You are **${(item.spent - item.budget).toFixed(2)}** over budget for **{item.category}** in **{item.month}**.
                <Progress value={(item.spent / item.budget) * 100} className="mt-1" indicatorClassName="bg-red-500" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-500">All categories are within budget.</p>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold">Top Spending Category</h3>
        {insights.topCategory ? (
          <p>Your top spending category is **{insights.topCategory.category}** with **${insights.topCategory.spent.toFixed(2)}** spent.</p>
        ) : (
          <p>No transactions this month.</p>
        )}
      </div>
    </div>
  );
}