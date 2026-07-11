import { Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { AuthenticatedRequest } from '../middleware/auth';

// @desc    Get all monthly budgets with current month spending analysis
// @route   GET /api/budgets
export async function getBudgets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const { month = new Date().toISOString().substring(0, 7) } = req.query; // YYYY-MM

    const budgets = await Budget.find({ userId, month: String(month) });
    const transactions = await Transaction.find({ userId });

    // Filter transactions for this specific month
    const currentMonthExpenses = transactions.filter(tx => 
      tx.type === 'expense' && 
      tx.date.startsWith(String(month))
    );

    // Calculate spent amount per category
    const budgetAnalysis = budgets.map(b => {
      const isOverall = b.category === 'All';
      
      const spent = currentMonthExpenses
        .filter(tx => isOverall ? true : tx.category === b.category)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const remaining = b.limit - spent;
      const percentSpent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

      return {
        _id: b._id || b.id,
        id: b.id || b._id,
        category: b.category,
        limit: b.limit,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentSpent: parseFloat(percentSpent.toFixed(1)),
        isExceeded: spent > b.limit,
        month: b.month
      };
    });

    res.status(200).json({ budgets: budgetAnalysis });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Error retrieving budget details.' });
  }
}

// @desc    Create or update a budget limit
// @route   POST /api/budgets
export async function setBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { category, limit, month } = req.body;

    if (!category || limit === undefined || !month) {
      res.status(400).json({ message: 'Please provide category, limit, and month (YYYY-MM).' });
      return;
    }

    const numLimit = parseFloat(String(limit));
    if (isNaN(numLimit) || numLimit < 0) {
      res.status(400).json({ message: 'Budget limit must be a positive number.' });
      return;
    }

    // Check if budget exists for this category and month
    const existingBudget = await Budget.findOne({ userId, category, month });

    let budget;
    if (existingBudget) {
      budget = await Budget.findByIdAndUpdate(existingBudget.id || existingBudget._id || '', { limit: numLimit });
    } else {
      budget = await Budget.create({
        userId,
        category,
        limit: numLimit,
        month
      });
    }

    // Return analyzed budget object
    const transactions = await Transaction.find({ userId });
    const currentMonthExpenses = transactions.filter(tx => 
      tx.type === 'expense' && 
      tx.date.startsWith(month)
    );

    const isOverall = category === 'All';
    const spent = currentMonthExpenses
      .filter(tx => isOverall ? true : tx.category === category)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const remaining = numLimit - spent;
    const percentSpent = numLimit > 0 ? (spent / numLimit) * 100 : 0;

    res.status(200).json({
      message: 'Budget limit configured successfully.',
      budget: {
        _id: budget?._id || budget?.id,
        id: budget?.id || budget?._id,
        category,
        limit: numLimit,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentSpent: parseFloat(percentSpent.toFixed(1)),
        isExceeded: spent > numLimit,
        month
      }
    });
  } catch (error) {
    console.error('Error setting budget:', error);
    res.status(500).json({ message: 'Error configuring budget limit.' });
  }
}

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
export async function deleteBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const budgetId = req.params.id;

    if (!userId || !budgetId) {
      res.status(400).json({ message: 'Required budget ID missing.' });
      return;
    }

    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) {
      res.status(404).json({ message: 'Budget target not found or unauthorized.' });
      return;
    }

    await Budget.findByIdAndDelete(budgetId);

    res.status(200).json({ message: 'Budget limit deleted successfully.' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget limit.' });
  }
}
