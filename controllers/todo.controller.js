import Task from '../models/todo.model.js'
const createTask = async (req, res) => {
  try {
    const currentDate = new Date();
    const taskData = req.body;

    // Check if name and description are provided
    if (!taskData.name || !taskData.description) {
      throw new Error("Name and description are required fields.");
    }

    // Set default values for start and end time if not provided
    if (taskData.dueDate) {
      if (taskData.dueDate.startDate && !taskData.dueDate.startTime) {
        taskData.dueDate.startTime = "12:00";
      }
      if (taskData.dueDate.endDate && !taskData.dueDate.endTime) {
        taskData.dueDate.endTime = "23:59";
      }

      // Calculate end date and time based on duration if end date is not provided
      if (!taskData.dueDate.endDate && taskData.dueDate.startDate && taskData.dueDate.duration && taskData.dueDate.durationType) {
        const newEndDate = new Date(taskData.dueDate.startDate);
        switch (taskData.dueDate.durationType) {
          case "Minutes":
            newEndDate.setMinutes(newEndDate.getMinutes() + taskData.dueDate.duration);
            break;
          case "Hours":
            newEndDate.setHours(newEndDate.getHours() + taskData.dueDate.duration);
            break;
          case "Days":
            newEndDate.setDate(newEndDate.getDate() + taskData.dueDate.duration);
            break;
          case "Weeks":
            newEndDate.setDate(newEndDate.getDate() + (taskData.dueDate.duration * 7));
            break;
          case "Months":
            newEndDate.setMonth(newEndDate.getMonth() + taskData.dueDate.duration);
            break;
          default:
            throw new Error("Invalid duration type");
        }
        // Set end time to end of the day
        newEndDate.setHours(23, 59, 59, 999);
        taskData.dueDate.endDate = newEndDate;
        taskData.dueDate.endTime = "23:59";
      }

      // Determine task status based on current date and due date
      if (taskData.dueDate.endDate) {
        if (currentDate > taskData.dueDate.endDate && taskData.status !== "Completed") {
          taskData.status = "Over-due";
        } else if (currentDate >= taskData.dueDate.startDate || currentDate <= taskData.dueDate.endDate) {
          taskData.status = "Progress";
        } else {
          taskData.status = "Todo";
        }
      } else if (currentDate > taskData.dueDate.startDate) {
        taskData.status = "Late";
      }
      // Calculate duration and duration type based on start date, end date, start time, and end time
// Calculate duration and duration type based on start date, end date, start time, and end time
// Parse time and convert to 24-hour format
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
  return { hours, minutes };
};

// Calculate duration and duration type based on start date, end date, start time, and end time
console.log("Calculating duration...");
if (taskData.dueDate.startDate && taskData.dueDate.endDate && taskData.dueDate.startTime && taskData.dueDate.endTime) {
  const startDate = new Date(taskData.dueDate.startDate);
  const endDate = new Date(taskData.dueDate.endDate);
  const startTime = parseTime(taskData.dueDate.startTime);
  const endTime = parseTime(taskData.dueDate.endTime);



  const startDateTime = new Date(startDate);
  startDateTime.setHours(startTime.hours, startTime.minutes);
  const endDateTime = new Date(endDate);
  endDateTime.setHours(endTime.hours, endTime.minutes);


  const durationMs = endDateTime - startDateTime;


  // Convert duration to hours
  const durationHours = durationMs / (1000 * 60 * 60);


  // Determine duration type based on duration
  let durationType;
  if (durationHours < 1) {
    durationType = "Minutes";
    taskData.dueDate.duration = durationMs / (1000 * 60); // Duration in minutes
  } else if (durationHours >= 1 && durationHours < 24) {
    durationType = "Hours";
    taskData.dueDate.duration = durationHours; // Duration in hours
  } else if (durationHours >= 24 && durationHours < (24 * 7)) {
    durationType = "Days";
    taskData.dueDate.duration = durationHours / 24; // Duration in days
  } else if (durationHours >= (24 * 7) && durationHours < (24 * 30)) {
    durationType = "Weeks";
    taskData.dueDate.duration = durationHours / (24 * 7); // Duration in weeks
  } else {
    durationType = "Months";
    taskData.dueDate.duration = durationHours / (24 * 30); // Duration in months
  }

  taskData.dueDate.durationType = durationType;

}

    }

    console.log(taskData); // Log taskData before creating the task

    // Create the task
    const createdTask = await Task.create(taskData);

    // Respond with the created task
    res.status(201).json(createdTask);
  } catch (error) {
    // Handle errors
    res.status(400).json({ error: error.message });
  }
};


const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getTaskById=async (req,res) => {
    try{
        const task = await Task.findById(req.params.id)
        res.status(200).json(task)
    }catch (err) {
        res.status(500).json({
            error: err.message

        })
    }
}
const updateTask = async (req, res) => {
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
        res.status(500).json({ error: err.message });
    }
};

const deleteTask = async (req, res) => {
  try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
          return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json(task);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}


const todoControllers={
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
}
export default todoControllers