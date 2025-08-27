// src/app/page.tsx
'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpenseChart } from '@/components/MonthlyExpenseChart';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalMonthlyExpenses } from '@/components/TotalMonthlyExpenses';
import { RecentTransactions } from '@/components/RecentTransactions';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetComparisonChart } from '@/components/BudgetComparisonChart';
import { SpendingInsights } from '@/components/SpendingInsights';
import { BudgetList } from '@/components/BudgetList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
  category?: { name: string } | null;
}

interface Budget {
    id: string;
    amount: number;
    month: string;
    categoryId: string;
    category: { name: string } | null;
}

export default function Home() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingBudget(null);
  };
  
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setEditingTransaction(null);
  };

  const availableMonths = ["2025-08", "2025-07", "2025-06", "2025-05"]; // Example: Populate dynamically from transactions later

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">FinSight Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Your personal finance tracker</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8 relative z-10">
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyExpenseChart key={refreshKey} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart key={refreshKey} />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-8 relative z-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Summary for</CardTitle>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <TotalMonthlyExpenses key={refreshKey} selectedMonth={selectedMonth} />
                <RecentTransactions key={refreshKey} selectedMonth={selectedMonth} />
              </CardContent>
            </Card>
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                    {editingBudget ? 'Edit Budget' : 'Set Budget'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetForm onSave={handleRefresh} budget={editingBudget} onCancel={handleCancelEdit} />
              </CardContent>
            </Card>
          </aside>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Budget vs. Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetComparisonChart key={refreshKey} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Spending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingInsights key={refreshKey} selectedMonth={selectedMonth} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList onEdit={handleEditTransaction} onTransactionDeleted={handleRefresh} key={refreshKey} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">All Budgets</CardTitle>
            </CardHeader>
            <CardContent>
                <BudgetList onEdit={handleEditBudget} onBudgetDeleted={handleRefresh} key={refreshKey} />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}