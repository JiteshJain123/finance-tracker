// src/app/page.tsx
'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpenseChart } from '@/components/MonthlyExpenseChart';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleRefresh = () => {
    // This function will be called on save or delete to trigger a refresh
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };
  
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Finance Tracker</h1>
          <p className="mt-2 text-lg text-gray-600">Track your personal finances with ease</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white p-6 rounded-lg shadow-md overflow-visible">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddTransactionForm
                transaction={editingTransaction}
                onSave={handleRefresh}
                onCancel={handleCancelEdit}
              />
            </CardContent>
          </Card>
          <Card className="bg-white p-6 rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyExpenseChart key={refreshKey} />
            </CardContent>
          </Card>
        </section>

        <Card className="bg-white p-6 rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              onEdit={handleEditTransaction} 
              onTransactionDeleted={handleRefresh} 
              key={refreshKey} 
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}