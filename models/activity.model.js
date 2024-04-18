import mongoose from "mongoose";
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    isComplete: {
        type: Boolean,
        default: false
    }
});
const activity=mongoose.model('Activity', activitySchema)
export default activity