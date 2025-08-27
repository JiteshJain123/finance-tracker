// src/components/BudgetList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Budget {
  id: string;
  amount: number;
  month: string;
  category: { name: string } | null;
  categoryId: string;
}

interface BudgetListProps {
  onEdit: (budget: Budget) => void;
  onBudgetDeleted: () => void;
}

export function BudgetList({ onEdit, onBudgetDeleted }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/budgets');
        const data: Budget[] = await res.json();
        setBudgets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch budgets', error);
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [onBudgetDeleted]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      onBudgetDeleted();
    } catch (error) {
      console.error('Failed to delete budget', error);
    }
  };

  if (loading) return <div>Loading budgets...</div>;
  if (budgets.length === 0) return <div>No budgets found.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Month</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => (
          <TableRow key={budget.id}>
            <TableCell>{budget.category?.name || 'Uncategorized'}</TableCell>
            <TableCell>{new Date(budget.month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</TableCell>
            <TableCell className="text-right">${Number(budget.amount).toFixed(2)}</TableCell>
            <TableCell className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => onEdit(budget)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(budget.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}