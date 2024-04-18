import mongoose  from "mongoose";
const { Schema } = mongoose;
import activity from "./activity.model.js";
const todoSchema =new mongoose.Schema({
  name: {
    type: String,
    required: true,
},
description: {
    type: String,
    required: true,
},
status: {
    type: String,
    required: true,
    enum: {
        values: ["Todo","Progress", "Completed", "Late", "Over-due"],
        message: "{VALUE} is not a valid status",
    },
    default: "Todo",
},
parentTask: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: false,
},
tags: {
    type: Array,
    required: false,
},
workload:{
    type: Number,
    required: false,
    min:1,
    max:5,

},
activities: [activity.schema],
dueDate: {
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,
    },
    startTime: {
        type: String,
        required: false,
    },
    endTime: {
        type: String,
        required: false,
    },
    duration: {
        type: Number,
        required: false,
    },
    durationType: {
        type: String,
        required: false,
        enum: {
            values: ["Minutes","Hours","Days", "Weeks", "Months"],
            message: "{VALUE} is not a valid duration type",
        },
        default: "Days",
    }
}
});
  
const task=mongoose.model('Task',todoSchema);
export default task