// src/components/BudgetForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

const budgetSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  month: z.string().min(1, 'Month is required.'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSave: () => void;
  budget?: BudgetFormValues | null;
  onCancel?: () => void;
}

export function BudgetForm({ onSave, budget, onCancel }: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<
      z.input<typeof budgetSchema>, // input type
      unknown,
      z.output<typeof budgetSchema> // output type
    >({
    resolver: zodResolver(budgetSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (budget) {
        const formattedMonth = new Date(budget.month).toISOString().slice(0, 7);
        reset({
            ...budget,
            month: formattedMonth,
        });
        setValue('categoryId', budget.categoryId);
    } else {
        reset({
            amount: 0,
            month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
            categoryId: '',
        });
    }
  }, [budget, reset, setValue]);

  const onSubmit: SubmitHandler<BudgetFormValues> = async (data) => {
    try {
        const isEditing = !!budget;
        const url = isEditing ? `/api/budgets/${budget?.id}` : '/api/budgets';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to save budget');
        }

        onSave();
        reset();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const now = new Date();
  const monthInput = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => setValue('categoryId', value)} defaultValue={budget?.categoryId}>
          <SelectTrigger className="w-full" disabled={!!budget}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Budget Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="month">Month</Label>
        <Input id="month" type="month" {...register('month')} defaultValue={monthInput} disabled={!!budget} />
        {errors.month && <p className="text-red-500 text-sm">{errors.month.message}</p>}
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (budget ? 'Update Budget' : 'Set Budget')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}