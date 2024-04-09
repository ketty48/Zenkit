import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" assert { type: "json" };
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const app = express()
import bodyParser from 'body-parser'

import cors from 'cors'
import connectDB from './db/connection.js'
import userRouters from './routers/users.routers.js'
import todoRouter from './routers/todo.routers.js';
import { requireAuth } from './middleware/auth.js'; // Import the requireAuth middleware

const combinedRouter = express.Router();
app.use(bodyParser.json())
const corsOptions = {
    allowedHeaders: ["Authorization","Content-Type"],
    methods: ["GET", "POST", "UPDATE" ],
    origin: ["http://192.168.1.150:8080", "//https://contact-app-client-xbck.onrender.com/"],
}
app.use('/', userRouters);

app.use('/todo', todoRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/',(req,res)=>{
    res.status(200).json({
        message: 'Server is Up!'
    })
})

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI)
        app.listen(process.env.PORT, () =>
            console.log(`Server is running on port ${process.env.PORT}`)
        )
    } catch (error) {
        console.log(error)
    }
}
start()
