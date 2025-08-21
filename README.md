# 💸 FinSight – Personal Finance Tracker

## 🔗 Project Links

- 📂 **GitHub Repository:** [Repo Link](https://github.com/JiteshJain123/finance-tracker)
- 🌍 **Live Demo:** [Vercel Deployment](https://finance-tracker-wpg1.vercel.app/)

---

## 📖 Project Overview

**FinSight** is a responsive, full-stack web application designed to provide a clean and intuitive way to manage personal finances.  
With FinSight, users can **track, edit, and delete transactions** while getting a clear **visual overview of monthly spending**.

⚡ Built with a modern stack:

- 🎨 **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui, Recharts
- ⚙️ **Backend:** Next.js API Routes (Serverless), Prisma ORM
- 🗄️ **Database:** PostgreSQL hosted on [Neon](https://neon.tech/)
- 🚀 **Caching:** Redis with [Upstash](https://upstash.com/)

---

## ✅ Features Implemented (Stage 1)

✨ **Transaction Management:** Add new transactions with amount, description, and date.  
📝 **Edit & Delete:** Modify or remove transactions directly from the list.  
📊 **Dynamic Charts:** Monthly expense bar chart updates in real-time on add/edit/delete.  
✔️ **Form Validation:** Ensures proper input formatting before submission.

---

## 🛠️ Setup Instructions

### 📌 Prerequisites

- Node.js & npm (LTS version recommended)
- Neon Account (for PostgreSQL)
- Upstash Account (for Redis cache)

---

### 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/JiteshJain123/finance-tracker.git
   cd finance-tracker

   ```

2. **Install dependencies**

   ```bash
   npm install

   ```

3. **Setup Environment Variables**
   ```env
   DATABASE_URL="<YOUR_NEON_DATABASE_URL>"
   UPSTASH_REDIS_REST_URL="<YOUR_UPSTASH_REDIS_REST_URL>"
   UPSTASH_REDIS_REST_TOKEN="<YOUR_UPSTASH_REDIS_REST_TOKEN>"

4. **Run Prisma Migrations**
    ```bash
    npx prisma migrate dev --name init

5. **Start the development server**
    ```bash
    npm run dev

Now open 👉 http://localhost:3000