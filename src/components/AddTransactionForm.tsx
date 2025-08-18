// src/components/AddTransactionForm.tsx

'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

// Define the Zod schema for validation.
const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive.'),
  description: z.string().min(1, 'Description is required.'),
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), 'Invalid date format.')
});

// Infer the TypeScript type for the final, validated form data.
type TransactionFormValues = z.infer<typeof transactionSchema>;

// Define the props interface for the component.
interface AddTransactionFormProps {
  onSave: () => void;
  transaction?: TransactionFormValues | null;
  onCancel?: () => void;
}

export function AddTransactionForm({ onSave, transaction, onCancel }: AddTransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: '',
    },
  });

  useEffect(() => {
    if (transaction) {
      const formattedDate = new Date(transaction.date).toISOString().split('T')[0];
      reset({
        ...transaction,
        date: formattedDate,
      });
    } else {
      reset({
        amount: 0,
        description: '',
        date: '',
      });
    }
  }, [transaction, reset]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    try {
      const isEditing = !!transaction;
      const url = isEditing ? `/api/transactions/${transaction?.id}` : '/api/transactions';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
          throw new Error(`Failed to ${isEditing ? 'update' : 'save'} transaction`);
      }

      console.log('Transaction saved successfully!', data);
      onSave();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          type="date" 
          {...register('date')}
          readOnly={!!transaction}
          className={!!transaction ? "bg-gray-200 cursor-not-allowed" : ""}
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (transaction ? 'Update Transaction' : 'Save Transaction')}
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