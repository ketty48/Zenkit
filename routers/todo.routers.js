import express from 'express';
import todoControllers from '../controllers/todo.controller.js';
import { addTaskValidation } from '../utils/validation.js';
import { setTime } from '../middleware/time.js';
import { requireAuth } from '../middleware/auth.js';


const router = express.Router();

// Apply requireAuth middleware to routes that require authentication
router.use(requireAuth);

router.post('/createTask',setTime, addTaskValidation,todoControllers.addTask)
router.get('/getAllTasks',todoControllers.getTasks);
router.get('/:id',todoControllers.findById)
router.put('/:id',todoControllers.updateTask)
router.delete('/:id',todoControllers.deleteTask);
router.get('/listByStatus',todoControllers.findByStatus)
router.get('/listByTag',todoControllers.findByTag)
router.get('/parentTaskList',todoControllers.findByParentId)

export default router;
