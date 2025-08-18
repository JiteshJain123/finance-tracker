// src/app/page.tsx
'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpenseChart } from '@/components/MonthlyExpenseChart';
import { AddTransactionForm } from '@/components/AddTransactionForm';


interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleTransactionSave = () => {
    // Incrementing the key forces re-render of child components
    setRefreshKey(prevKey => prevKey + 1);
    setEditingTransaction(null);
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <AddTransactionForm
              transaction={editingTransaction}
              onSave={handleTransactionSave}
              onCancel={handleCancelEdit}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Monthly Expenses</h2>
            <MonthlyExpenseChart key={refreshKey} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Transactions</h2>
          {/* Pass a prop to the list component to trigger a refresh on delete */}
          <TransactionList onEdit={handleEditTransaction} onTransactionDeleted={() => setRefreshKey(prevKey => prevKey + 1)} key={refreshKey} />
        </section>
      </div>
    </main>
  );
}