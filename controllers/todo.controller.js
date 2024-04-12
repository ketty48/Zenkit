import Task from '../models/todo.model.js'
import {body, validationResult} from 'express-validator'
  // Validate the 'name' field
  const createTaskValidation = [
    // Validate the 'name' field
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    
    // Exclude validation for the 'status' field
    body('status').optional(),
  ]

const createTask = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const taskData = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log("Start Date:", taskData.dueDate.startDate);
    console.log("End Date:", taskData.dueDate.endDate);
if (taskData.dueDate) {
    setDefaultTime(taskData.dueDate);
    generateDurationAndType(taskData.dueDate);

    // Ensure endDate is generated before parsing start and end times
    if (!taskData.dueDate.endDate) {
        taskData.dueDate.endDate = calculateEndDate(taskData.dueDate);
    }

    parseTime(taskData.dueDate.startTime);
    parseTime(taskData.dueDate.endTime);
    determineTaskStatus(taskData, currentDate);
}

    console.log("Task data before creating:", taskData);

    const createdTask = await Task.create(taskData);

    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};


const setDefaultTime = (dueDate) => {
  if (dueDate.startDate && !dueDate.startTime) {
    dueDate.startTime = "12:00";
  }
  if (dueDate.endDate && !dueDate.endTime) {
    dueDate.endTime = "23:59";
  }
};

const parseTime = (timeString) => {
  const [time, period] = timeString.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  const parsedTime = { hours, minutes };
  console.log("Parsed time:", parsedTime);
  return parsedTime;
};

const calculateEndDate = (dueDate) => {
  const { startDate, duration, durationType } = dueDate;
  const newEndDate = new Date(startDate);
  switch (durationType) {
    case "Minutes":
      newEndDate.setMinutes(newEndDate.getMinutes() + duration);
      break;
    case "Hours":
      newEndDate.setHours(newEndDate.getHours() + duration);
      break;
    case "Days":
      newEndDate.setDate(newEndDate.getDate() + duration);
      break;
    case "Weeks":
      newEndDate.setDate(newEndDate.getDate() + (duration * 7));
      break;
    case "Months":
      newEndDate.setMonth(newEndDate.getMonth() + duration);
      break;
    default:
      throw new Error("Invalid duration type");
  }
  newEndDate.setHours(23, 59, 59, 999);
  return newEndDate;
};

const determineTaskStatus = (taskData, currentDate) => {
  const { startDate, endDate, status } = taskData;

  if (endDate) {
    const currentDateTime = new Date(currentDate);
    const endDateTime = new Date(endDate);

    if (currentDateTime > endDateTime && status !== "Completed") {
      taskData.status = "Overdue";
    } else if (currentDateTime >= startDate && currentDateTime <= endDateTime) {
      taskData.status = "Progress";
    } else {
      taskData.status = "Todo";
    }
  } else if (currentDate > startDate) {
    taskData.status = "Late";
  }
};



const generateDurationAndType = (dueDate) => {
  const { startDate, endDate, duration, durationType } = dueDate;

  if (!startDate) {
    throw new Error("Start date is required.");
  }

  if (!endDate && duration && durationType) {
    dueDate.endDate = calculateEndDate(dueDate);
  }

  if (!endDate && (!duration || !durationType)) {
    throw new Error("Either end date or duration and duration type are required.");
  }

  if (endDate && !duration && !durationType) {
    // Calculate duration and duration type based on start and end dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const durationMs = parsedEndDate.getTime() - parsedStartDate.getTime();
    if (durationMs < 0) {
      throw new Error("End date must be after start date.");
    }


    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    let calculatedDurationType;
    if (durationHours < 1) {
      calculatedDurationType = "Minutes";
      dueDate.duration = durationMs / (1000 * 60);
    } else if (durationHours >= 1 && durationHours < 24) {
      calculatedDurationType = "Hours";
      dueDate.duration = durationHours;
    } else if (durationHours >= 24 && durationHours < (24 * 7)) {
      calculatedDurationType = "Days";
      dueDate.duration = durationHours / 24;
    } else if (durationHours >= (24 * 7) && durationHours < (24 * 30)) {
      calculatedDurationType = "Weeks";
      dueDate.duration = durationHours / (24 * 7);
    } else {
      calculatedDurationType = "Months";
      dueDate.duration = durationHours / (24 * 30);
    }
    dueDate.durationType = calculatedDurationType;
  }
};

const getAllTasks = async (req, res,next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
next(err);
    }
};
const getTaskById=async (req,res,next) => {
    try{
        const task = await Task.findById(req.params.id)
        res.status(200).json(task)
    }catch (err) {
  next(err)
    }
}
const updateTask = async (req, res,next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update task properties based on request body
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.status = req.body.status || task.status;

 // If only start date is provided, set start time to 12:00 AM
        const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
        if (task.status !== 'COMPLETED' && task.endDate && task.endDate < twentyFourHoursAgo) {
            task.status = 'OVER-DUE';
        }
 // If only end date is provided, set end time to midnight of the next day
        if (task.status !== 'COMPLETED' && !task.isOverdue && task.endDate && task.endDate < Date.now()) {
            task.status = 'LATE';
        }

   
        await task.save();

        res.status(200).json(task);
    } catch (err) {
      next(err);
    }
};

const deleteTask = async (req, res,next) => {
  try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
          return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json(task);
  } catch (err) {
     next(err);
  }
}


const todoControllers={
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    createTaskValidation
}
export default todoControllers