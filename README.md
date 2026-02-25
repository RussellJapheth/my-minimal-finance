# my-personal-finance

A sleek, intuitive, and privacy-focused personal finance tracker built with SvelteKit. Monitor your expenses, track your income, manage monthly budgets, and visualize your financial health—all entirely in your browser using local storage (IndexedDB).

## Features

- **Local Storage First:** All transactional data and categories are stored directly on your device using IndexedDB. No server database required.
- **Budgeting & Categories:** Set monthly budgets for custom expense categories and track your spending against them in real-time.
- **Dynamic Insights:** Visualize your spending habits with interactive charts and month-over-month summaries.
- **Streamlined Transactions:** Quickly add, edit, or delete transactions. Recent transactions are editable right from the dashboard.
- **Data Portability:** Export your complete financial picture, or granular subsets (only expenses, only income, or just categories) to JSON, and import backups whenever needed.
- **Responsive & Modern UI:** A beautiful, animated, clean interface designed to feel like a premium mobile app.

## Tech Stack

- **Framework:** SvelteKit (Svelte 5 Runes)
- **Styling:** Tailwind CSS
- **Database:** IndexedDB (via `idb` wrapper)
- **Charts:** Chart.js

## Getting Started

### Prerequisites
You will need Node.js installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/my-personal-finance.git
   cd my-personal-finance
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Deployment

This app is configured to use `@sveltejs/adapter-netlify` for easy deployment to Netlify Edge.
To build the app for production:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Privacy

`my-personal-finance` is designed with absolute privacy in mind. Because it uses IndexedDB, your financial data never leaves your browser. There are no tracking scripts or external database calls transmitting your personal information.
