import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { initializeSocket } from "./socket/socket.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  return res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

//listen to socket event
initializeSocket(server);

connectDB().then(() => {
    console.log('Mongo DB connected successfully');
    server.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`)
    })
}).catch((err) => {
    console.error("Server is not running due to mongo db connection error",err);
})
