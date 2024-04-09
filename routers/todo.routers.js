import express from 'express';
import todoControllers from '../controllers/todo.controller.js';

import { requireAuth } from '../middleware/auth.js'; // Import the requireAuth middleware

const router = express.Router();

// Apply requireAuth middleware to routes that require authentication
router.use(requireAuth);

router.route('/createTask').post(todoControllers.createTask);
router.route('/getAllTasks').get(todoControllers.getAllTasks);
router.route('/:id').get(todoControllers.getTaskById).put(todoControllers.updateTask).delete(todoControllers.deleteTask);

export default router;
