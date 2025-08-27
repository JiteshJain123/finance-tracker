# FinSight – Personal Finance Tracker

### Project Links
* **GitHub Repository**: [Link to your GitHub Repository](https://github.com/JiteshJain123/finance-tracker)
* **Live Demo**: [Link to your Vercel Deployment](https://finance-tracker-wpg1.vercel.app/)

---

### Project Overview
FinSight is a comprehensive, responsive, full-stack web application designed to provide users with a powerful and intuitive platform for managing their personal finances. The app goes beyond simple transaction tracking to offer budgeting, category-wise breakdowns, and spending insights, all within a clean and modern user interface.

The application is built with a robust tech stack, including:
* **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui, and Recharts.
* **Backend**: A serverless API using Next.js API Routes, Prisma ORM, a PostgreSQL database (via Docker for local development), and Redis (via Upstash) for caching.

---

### Features Implemented (Stages 1, 2, & 3)
This project successfully implements all features across all three stages, offering a complete personal finance management solution.

#### Stage 1: Transaction Tracker
* **Transaction Management**: Add, edit, and delete transactions with a clean, validated form.
* **Transaction History**: View a list of all transactions in a sortable table.
* **Monthly Expenses Chart**: A bar chart that dynamically visualizes total spending by month.

#### Stage 2: Categories & Dashboard
* **Predefined Categories**: Assign transactions to predefined categories (e.g., Food & Groceries, Rent, Travel).
* **Category-wise Pie Chart**: A pie chart that provides a visual breakdown of spending by category.
* **Dashboard Summary**: A dashboard that includes total monthly expenses and recent transactions.

#### Stage 3: Budgeting & Insights
* **Budgeting**: Set and manage monthly budgets for each category.
* **Budget vs. Actual Chart**: A bar chart that compares your budgeted amount against your actual spending for each category.
* **Spending Insights**: The dashboard provides simple insights, including over-budget alerts and your top spending category for the month.

---

### Setup Instructions

Follow these steps to get a local copy of the project up and running.

#### Prerequisites
* **Node.js & npm**: [LTS version recommended](https://nodejs.org/en/)
* **Docker**: Required to run the local PostgreSQL database.
* **Upstash Account**: A free account to set up your Redis cache.

#### Getting Started
1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/JiteshJain123/finance-tracker.git](https://github.com/JiteshJain123/finance-tracker.git)
    cd finance-tracker
    ```
2.  **Install project dependencies**:
    ```bash
    npm install
    ```

#### Database & Cache Setup
1.  Start the local PostgreSQL database using the `docker-compose.yml` file.
    ```bash
    docker-compose up -d
    ```
2.  Create a `.env` file in the root of your project.
3.  Add your database and Redis credentials to the file. You will need to get your Upstash credentials from your Upstash dashboard.

    ```env
    DATABASE_URL="postgresql://finance_user:finance_password@localhost:5432/finance_db?schema=public"
    UPSTASH_REDIS_REST_URL="<YOUR_UPSTASH_REDIS_REST_URL>"
    UPSTASH_REDIS_REST_TOKEN="<YOUR_UPSTASH_REDIS_REST_TOKEN>"
    ```

#### Running the Application
1.  **Run Prisma Migrations and Seeding**:
    This will apply the database schema and populate your categories.
    ```bash
    npx prisma migrate reset
    npm run prisma:seed
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```

The application will now be running on `http://localhost:3000`.