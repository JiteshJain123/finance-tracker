// src/components/TransactionList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: { name: string } | null;
}

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onTransactionDeleted: () => void;
}

export function TransactionList({ onEdit, onTransactionDeleted }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        const data: Transaction[] = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [onTransactionDeleted]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      onTransactionDeleted();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  if (loading) return <div>Loading transactions...</div>;
  if (transactions.length === 0) return <div>No transactions found.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-10"></TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className="text-right">${Number(transaction.amount).toFixed(2)}</TableCell>
            <TableCell></TableCell>
            <TableCell>{transaction.category?.name || 'Uncategorized'}</TableCell>
            <TableCell className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => onEdit(transaction)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(transaction.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}