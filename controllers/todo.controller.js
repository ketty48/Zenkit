import { NotFoundError, BadRequestError } from '../errors/index.js';
import TaskModel from '../models/todo.model.js';
import { validationResult } from 'express-validator';

 const test = (req, res, next) => {
    res.send('Hello World!');
}

const addTask = async (req, res, next) => {
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            next(new BadRequestError(errors.array()[0].msg));
        }
  
        const newTask = await TaskModel.create(req.body);
        return res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
};

const getTasks = async (req, res, next) => {
    try {
        const tasks = await TaskModel.find({});
        if (tasks) {
            return res.status(200).json(tasks);
        }
    } catch (error) {
        next(error);
    }
}
export const updateTask = async (req, res, next) => {
    const errors = validationResult(req);
    const taskId = req.query.id;
    const updates = req.body;

    try {
        if (!errors.isEmpty()) {
            next(new BadRequestError(errors.array()[0].msg));
        }
  
        const updatedTask = await TaskModel.findByIdAndUpdate(taskId, updates, { new: true });
        if (!updatedTask) {
            return next(new NotFoundError(`Task not found`));
        } 
        return res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
}

 const findById = async (req, res, next) => {
    const taskId = req.query.id;
    
    try {
        const foundTask = await TaskModel.findById(taskId);
        if (!foundTask) {
            return next(new NotFoundError(`Task not found`));
        }
        return res.status(200).json(foundTask);
    } catch (error) {
        next(error);
    }
}
const findByStatus = async (req, res, next) => {
    const taskStatus = req.query.status;
    
    try {
        const foundTasks = await TaskModel.find({ status: taskStatus });
        return res.status(200).json({
            size: foundTasks.length,
            foundTasks
        });
    } catch (error) {
        next(error);
    }
};

 const findByParentId = async (req, res, next) => {
    const parentId = req.query.parent;
    
    try {
        const foundTasks = await TaskModel.find({ parentTask: parentId });
        return res.status(200).json({
            size: foundTasks.length,
            foundTasks
        });
    } catch (error) {
        next(error);
    }
};

const findByTag = async (req, res, next) => {
    const tagId = req.query.tag;
    
    try {
        const allTasks = await TaskModel.find({});
        const foundTasks = [];
        allTasks.forEach(task => {
            if (task.tags.includes(tagId)) {
                foundTasks.push(task);
            }
        });

        return res.status(200).json({
            size: foundTasks.length,
            foundTasks
        });
    } catch (error) {
        next(error);
    }
}

const deleteTask = async (req, res, next) => {
    try {
        const deletedTask = await TaskModel.findByIdAndDelete(req.query.id);
        return res.status(200).json({ message: 'Task deleted'});
    } catch (error) {
        next(error);
    }
}
export default{
  test,
  addTask,
  getTasks,
  updateTask,
  findById,
  deleteTask,
  findByStatus,
  findByParentId,
  findByTag
}