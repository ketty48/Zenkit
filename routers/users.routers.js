import express from 'express';
import userControllers from '../controllers/user.controller.js';

const router = express.Router();

// Public routes for user registration and login (no authentication required)
router.post('/register', userControllers.register);
router.post('/login', userControllers.login);



export default router;