// src/components/RecentTransactions.tsx
'use client';

import { useEffect, useState } from 'react';
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

interface RecentTransactionsProps {
  selectedMonth: string;
}

export function RecentTransactions({ selectedMonth }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        const data: Transaction[] = await res.json();
        
        if (Array.isArray(data)) {
          const filteredTransactions = data.filter(t => new Date(t.date).toISOString().startsWith(selectedMonth));
          setTransactions(filteredTransactions.slice(0, 5));
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch recent transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedMonth]);

  if (loading) return <div>Loading...</div>;
  if (transactions.length === 0) return <div>No recent transactions.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className="text-right">${Number(transaction.amount).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}