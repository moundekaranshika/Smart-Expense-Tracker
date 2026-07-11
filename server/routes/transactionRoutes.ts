import { Router } from 'express';
import {
  getTransactions,
  getStats,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';

const router = Router();

// Secure all transaction routes with the protect middleware
router.use(protect as any);

router.get('/', getTransactions as any);
router.get('/stats', getStats as any);
router.post('/', createTransaction as any);
router.put('/:id', updateTransaction as any);
router.delete('/:id', deleteTransaction as any);
router.get('/export/csv', exportCSV as any);

export default router;
