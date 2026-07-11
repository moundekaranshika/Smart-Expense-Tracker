import { Response } from 'express';
import { Transaction, ITransaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { AuthenticatedRequest } from '../middleware/auth';

// @desc    Get all transactions with optional pagination, sorting, filtering, and search
// @route   GET /api/transactions
export async function getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'date:desc',
      type,
      category,
      timeframe,
      startDate,
      endDate,
      search
    } = req.query;

    const query: any = { userId };

    // Apply type filter ('income' | 'expense')
    if (type) {
      query.type = type;
    }

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply timeframe / date range filters
    const now = new Date();
    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      query.date = { $gte: oneWeekAgo.toISOString().split('T')[0], $lte: now.toISOString().split('T')[0] };
    } else if (timeframe === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      query.date = { $gte: oneMonthAgo.toISOString().split('T')[0], $lte: now.toISOString().split('T')[0] };
    } else if (timeframe === 'yearly') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      query.date = { $gte: oneYearAgo.toISOString().split('T')[0], $lte: now.toISOString().split('T')[0] };
    } else if (timeframe === 'custom' && startDate && endDate) {
      query.date = { $gte: String(startDate), $lte: String(endDate) };
    }

    // Fetch matching transactions (unpaginated for manual local filtering or database execution)
    let transactions = await Transaction.find(query);

    // Apply textual search locally if search term is provided (handles local DB & mongoose beautifully)
    if (search) {
      const term = String(search).toLowerCase();
      transactions = transactions.filter(tx => 
        tx.description.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.paymentMode.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term) ||
        tx.date.includes(term)
      );
    }

    // Apply sorting
    const [sortField, sortOrder] = String(sortBy).split(':');
    transactions.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Parse dates for accurate comparison
      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortField === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    // Pagination
    const pageNum = parseInt(String(page)) || 1;
    const limitNum = parseInt(String(limit)) || 10;
    const totalTransactions = transactions.length;
    const paginatedTransactions = transactions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      transactions: paginatedTransactions,
      pagination: {
        total: totalTransactions,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalTransactions / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions.' });
  }
}

// @desc    Get dashboard metrics and analytics data
// @route   GET /api/transactions/stats
export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const transactions = await Transaction.find({ userId });

    let totalIncome = 0;
    let totalExpenses = 0;

    // Monthly data aggregator (recent 6 months)
    const monthlyStatsMap = new Map<string, { month: string; income: number; expense: number }>();
    const categoryStatsMap = new Map<string, number>();

    // Seed recent 6 months to ensure Recharts gets sequential data
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().substring(0, 7); // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyStatsMap.set(monthKey, { month: label, income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }

      // Group by Month
      const txMonthKey = tx.date.substring(0, 7); // YYYY-MM
      if (monthlyStatsMap.has(txMonthKey)) {
        const stats = monthlyStatsMap.get(txMonthKey)!;
        if (tx.type === 'income') {
          stats.income += amount;
        } else {
          stats.expense += amount;
        }
      } else {
        // If older or newer, let's still parse it if relevant
        const d = new Date(tx.date);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyStatsMap.set(txMonthKey, {
          month: label,
          income: tx.type === 'income' ? amount : 0,
          expense: tx.type === 'expense' ? amount : 0
        });
      }

      // Group Expenses by Category for Pie Chart
      if (tx.type === 'expense') {
        const currentCatTotal = categoryStatsMap.get(tx.category) || 0;
        categoryStatsMap.set(tx.category, currentCatTotal + amount);
      }
    });

    const totalBalance = totalIncome - totalExpenses;
    const savings = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Format monthly data for Recharts (sorted chronologically)
    const monthlyTrends = Array.from(monthlyStatsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, val]) => val);

    // Format category distribution
    const categoryDistribution = Array.from(categoryStatsMap.entries()).map(([category, value]) => ({
      category,
      value
    }));

    // Find the current month's spending vs previous month for dashboard badges
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = lastMonthDate.toISOString().substring(0, 7);

    const currentMonthExpenses = transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthKey))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const prevMonthExpenses = transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(lastMonthKey))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    res.status(200).json({
      summary: {
        totalBalance,
        totalIncome,
        totalExpenses,
        savings: Math.max(0, parseFloat(savings.toFixed(1))),
        currentMonthExpenses,
        prevMonthExpenses,
      },
      monthlyTrends,
      categoryDistribution,
      recentTransactions: transactions.slice(0, 5) // Return top 5 recent
    });
  } catch (error) {
    console.error('Error compiling analytics:', error);
    res.status(500).json({ message: 'Error retrieving analytics statistics.' });
  }
}

// @desc    Add a transaction and automatically run budget checks
// @route   POST /api/transactions
export async function createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const { amount, category, description, date, paymentMode, type } = req.body;

    if (!amount || !category || !description || !date || !paymentMode || !type) {
      res.status(400).json({ message: 'Please provide all transaction fields.' });
      return;
    }

    const numAmount = parseFloat(String(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number.' });
      return;
    }

    const newTx = await Transaction.create({
      userId,
      amount: numAmount,
      category,
      description,
      date,
      paymentMode,
      type
    });

    // --- Dynamic Budget Overspending Check ---
    let budgetAlert = null;
    if (type === 'expense') {
      const txMonth = date.substring(0, 7); // YYYY-MM
      
      // Fetch either category budget or "All" overall monthly budget
      const budgets = await Budget.find({ userId, month: txMonth });
      const matchedBudget = budgets.find(b => b.category === category || b.category === 'All');

      if (matchedBudget) {
        // Query other expenses in this category (or total expenses if overall budget)
        const allTxs = await Transaction.find({ userId });
        const monthExpenses = allTxs
          .filter(tx => {
            const isCorrectMonth = tx.date.startsWith(txMonth);
            const isCorrectType = tx.type === 'expense';
            const isCategoryMatch = matchedBudget.category === 'All' || tx.category === category;
            return isCorrectMonth && isCorrectType && isCategoryMatch;
          })
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        if (monthExpenses > matchedBudget.limit) {
          budgetAlert = {
            message: `⚠️ Overspent alert! Your expense of $${numAmount} in "${category}" has exceeded your monthly budget of $${matchedBudget.limit} for ${matchedBudget.category === 'All' ? 'Overall spending' : category}. Current Total: $${monthExpenses.toFixed(2)}.`,
            category: matchedBudget.category,
            limit: matchedBudget.limit,
            currentTotal: monthExpenses
          };
        }
      }
    }

    res.status(201).json({
      transaction: newTx,
      budgetAlert
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error recording transaction.' });
  }
}

// @desc    Edit a transaction
// @route   PUT /api/transactions/:id
export async function updateTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const txId = req.params.id;

    if (!userId || !txId) {
      res.status(400).json({ message: 'Required details missing.' });
      return;
    }

    const { amount, category, description, date, paymentMode, type } = req.body;

    const existingTx = await Transaction.findOne({ _id: txId, userId });
    if (!existingTx) {
      res.status(404).json({ message: 'Transaction not found or unauthorized access.' });
      return;
    }

    const numAmount = amount ? parseFloat(String(amount)) : existingTx.amount;

    const updatedTx = await Transaction.findByIdAndUpdate(txId, {
      amount: numAmount,
      category: category || existingTx.category,
      description: description || existingTx.description,
      date: date || existingTx.date,
      paymentMode: paymentMode || existingTx.paymentMode,
      type: type || existingTx.type
    });

    res.status(200).json({ transaction: updatedTx });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction details.' });
  }
}

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
export async function deleteTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const txId = req.params.id;

    if (!userId || !txId) {
      res.status(400).json({ message: 'Required details missing.' });
      return;
    }

    const tx = await Transaction.findOne({ _id: txId, userId });
    if (!tx) {
      res.status(404).json({ message: 'Transaction not found or unauthorized.' });
      return;
    }

    await Transaction.findByIdAndDelete(txId);

    res.status(200).json({ message: 'Transaction successfully deleted.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction.' });
  }
}

// @desc    Export transactions as CSV file contents
// @route   GET /api/transactions/export/csv
export async function exportCSV(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const transactions = await Transaction.find({ userId });
    
    // Header Row
    let csvContent = 'Date,Type,Category,Amount,Payment Mode,Description\r\n';
    
    // Body Rows
    transactions.forEach(tx => {
      const descriptionSafe = tx.description.replace(/"/g, '""');
      csvContent += `"${tx.date}","${tx.type.toUpperCase()}","${tx.category}",${tx.amount},"${tx.paymentMode}","${descriptionSafe}"\r\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error generating CSV file.' });
  }
}
