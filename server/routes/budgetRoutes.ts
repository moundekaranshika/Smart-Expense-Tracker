import { Router } from 'express';
import {
  getBudgets,
  setBudget,
  deleteBudget
} from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

// Secure all budget routes with protect middleware
router.use(protect as any);

router.get('/', getBudgets as any);
router.post('/', setBudget as any);
router.delete('/:id', deleteBudget as any);

export default router;
