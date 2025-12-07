import { Server as SocketIOServer, Socket } from "socket.io";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";


export function registerChatEvents(io: SocketIOServer, socket: Socket) {

    socket.on("getConversations", async () => {
        console.log("getConversations event");
        try {
            const userId = socket.data.userId;

            if (!userId) {
            socket.emit("getConversations", {
                success: false,
                msg: "Unauthorized",
            });
            return;
            }
            
            //find all conversations where user is a participants
            const conversations = await Conversation.find({
                participants: userId
            })
            .sort({ updatedAt: -1 }) // sort by last updated
            .populate({
                path: "lastMessage",
                select: "content senderId attachment createdAt",
            })
            .populate({
                path: "participants",
                select: "name avatar email",
            })
            .lean();

            socket.emit("getConversations", {
                success: true,
                data: conversations,
            });


        } catch (error: any) {
            console.log("getConversations error: ", error);
            socket.emit("getConversations", {
                success: false,
                msg: "Failed to get conversations",
      });
        }
    })


  socket.on("newConversation", async (data) => {
    console.log("newConversation event: ", data);

    try {
      if (data.type == "direct") {
        // check if already exists
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
        .populate({
            path: "participants",
            select: "name avatar email",
        })
        .lean();

        if (existingConversation) {
            socket.emit("newConversation", {
            success: true,
            data: {...existingConversation, isNew: false}
        });
        return;
        }
      }

      //create new conversation

      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "",
        avatar: data.avatar || "",
        createdBy: socket.data.userId,
      });
      
      //get all connected sockets
      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        s => data.participants.includes(s.data.userId)
    );

    //join this conversation by all online participants
    connectedSockets.forEach(participantSocket => {
        participantSocket.join(conversation._id.toString())
    })

    //send conversation data back(populated)
    const populatedConversation = await Conversation.findById(conversation._id)
    .populate({
        path: "participants",
        select: "name avatar email",
    }).lean();

    if(!populatedConversation){
        throw new Error ("Failed to populate conversation");
    }

    // emit conversation to all participants
    io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true }
    });


    } catch (error: any) {
      console.log("newConversation error: ", error);
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation",
      });
    }
  });

  socket.on("newMessage", async (data: any) =>{
    console.log("newMessage event: ", data);

    try {
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: socket.data.userId,
        content: data.content,
        attachment: data.attachment,
      });

      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data:{
          id: message.id,
          content: data.content,
          sender:{
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar,
          },
          attachment: data.attachment,
          createdAt: new Date().toISOString(),
          conversationId: data.conversationId,
        }
    });

    //update conversation with last message
    await Conversation.findByIdAndUpdate(data.conversationId, {
      lastMessage: message._id,
    })


    } catch (error) {
       console.log("newMessage error: ", error);
      socket.emit("newMessage", {
        success: false,
        msg: "Failed to send the message",
      });
    }
  });

    socket.on("getMessages", async (data :{conversationId: string}) =>{
    console.log("getMessages event: ", data);

    try {
      const messages = await Message.find({conversationId: data.conversationId})
      .sort({createdAt: -1})
      .populate <{senderId: {_id: string; name: string; avatar: string}}>({
        path:"senderId",
        select: "name avatar"
      })
      .lean();

      const messagesWithSender = messages.map(message=> ({
        ...message,
        id: message._id,
        sender: {
          id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        }
      }))

      socket.emit("getMessages", {
        success: true,
        data: messagesWithSender
      })

    } catch (error) {
       console.log("getMessages error: ", error);
      socket.emit("getMessages", {
        success: false,
        msg: "Failed to send the message",
      });
    }
  });

  // Delete conversation event
  socket.on("deleteConversation", async (data: { conversationId: string }) => {
    console.log("deleteConversation event: ", data);
    
    try {
      const { conversationId } = data;
      const userId = socket.data.userId;

      if (!userId) {
        socket.emit("deleteConversation", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      // Find the conversation
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        socket.emit("deleteConversation", {
          success: false,
          msg: "Conversation not found",
        });
        return;
      }

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (p: any) => p.toString() === userId
      );

      if (!isParticipant) {
        socket.emit("deleteConversation", {
          success: false,
          msg: "Unauthorized to delete this conversation",
        });
        return;
      }

      console.log(`User ${userId} deleting conversation ${conversationId}`);

      // Delete all messages in the conversation
      await Message.deleteMany({ conversationId: conversationId });
      
      // Delete the conversation
      await Conversation.findByIdAndDelete(conversationId);

      console.log(`Conversation ${conversationId} and its messages deleted successfully`);

      // Emit success response to the user who deleted
      socket.emit("deleteConversation", {
        success: true,
        data: {
          conversationId: conversationId,
        },
        msg: "Conversation deleted successfully",
      });

      // Notify all other participants in the conversation room
      console.log(`Notifying room ${conversationId} about deletion`);
      socket.to(conversationId).emit("conversationDeleted", {
        success: true,
        data: {
          conversationId: conversationId,
          deletedBy: userId,
        },
      });

      // Leave the room
      socket.leave(conversationId);

    } catch (error: any) {
      console.error("deleteConversation error: ", error);
      socket.emit("deleteConversation", {
        success: false,
        msg: "Failed to delete conversation",
      });
    }
  });

  
}