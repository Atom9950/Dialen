import dotenv from 'dotenv';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerUserEvents } from './userEvents.js';
import { registerChatEvents } from './chatEvents.js';
import Conversation from '../models/Conversation.js';


dotenv.config();

export function initializeSocket(server: any) : SocketIOServer{
    const io = new SocketIOServer(server,{
        cors: {
            origin: "*", //allow all origins
        }
    }); // socket io server instance

    //auth middleware
    io.use((socket: Socket, next: any) => {
       const token = socket.handshake.auth.token;
       if(!token) {
        return next(new Error('Authentication error: No token provided'));
        }
        jwt.verify(token, process.env.JWT_SECRET as string, (err:any, decoded:any)=>{
           if(err){
               return next(new Error('Authentication error: Invalid token'));
           }

           //attach user data to socket.io
           let userData = decoded.user;
           socket.data = userData;
           socket.data.userId = userData.id;
           next();
        })
    })
    //when socket connects, it registers user's events

    io.on('connection', async (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`User ${userId} connected with username: ${socket.data.name}`);

        //registers events
        registerUserEvents(io, socket);
        //registerUserEvents(socket);
        registerChatEvents(io, socket);

        //join all the conversations the user is part of
        try {
            const conversation = await Conversation.find({
                participants: userId
            }).select("_id")

            conversation.forEach(conversation => {
                socket.join(conversation._id.toString());
            })
            
        } catch (error: any) {
            console.log("Error joining conversations: ", error);
            
        }

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
        });
    });


    return io;
}

