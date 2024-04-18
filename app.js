import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" assert { type: "json" };
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const app = express()
import bodyParser from 'body-parser'
import mongoose from "mongoose";
import cors from 'cors'
import configurations from './db/connection.js'
import userRouters from './routers/users.routers.js'
import todoRouter from './routers/todo.routers.js';
import { requireAuth } from './middleware/auth.js'; // Import the requireAuth middleware
import ErrorHandler from "./middleware/ErrorHandler.js";
import tagRouter from "./routers/tag.routes.js";
const combinedRouter = express.Router();
app.use(bodyParser.json())
const corsOptions = {
    allowedHeaders: ["Authorization","Content-Type"],
    methods: ["GET", "POST", "UPDATE" ],
    origin: ["http://localhost:5173", configurations.CLIENT_APP],
}
app.use('/', userRouters);

app.use('/todo', todoRouter);
app.use('/todos',tagRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/',(req,res)=>{
    res.status(200).json({
        message: 'Server is Up!'
    })
})

// Database connectivity
mongoose.connect(configurations.MONGODB_CONNECTION_STRING.toString())
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

app.listen(configurations.PORT, () => console.log(`Server is running on port ${configurations.PORT}`))

// Error handling middleware
app.use(ErrorHandler);