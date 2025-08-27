// src/components/CategoryPieChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#42b983', '#5d4037'];

interface CategoryData {
  name: string;
  value: number;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: { name: string } | null;
}

export function CategoryPieChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/transactions');
        const transactions: Transaction[] = await res.json();

        if (!Array.isArray(transactions)) {
          setData([]);
          return;
        }

        const categoryData: { [key: string]: { name: string; value: number } } = {};
        transactions.forEach((t: Transaction) => {
          const categoryName = t.category?.name || 'Uncategorized';
          if (!categoryData[categoryName]) {
            categoryData[categoryName] = { name: categoryName, value: 0 };
          }
          categoryData[categoryName].value += t.amount;
        });

        const chartData = Object.values(categoryData).filter(c => c.value > 0);
        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch data for pie chart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (data.length === 0) return <div>No data to display.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}