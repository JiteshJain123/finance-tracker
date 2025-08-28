// prisma/seed.ts
/* eslint-disable @typescript-eslint/no-require-imports */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  'Food & Groceries',
  'Housing & Rent',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Personal Care',
  'Education',
  'Travel',
  'Debt Payments',
  'Savings',
  'Investments',
  'Gifts & Donations',
  'Miscellaneous',
]

async function main() {
  console.log('🌱 Seeding categories...')

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('✅ Categories seeded successfully.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
