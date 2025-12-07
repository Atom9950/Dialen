import { Server as SocketIOServer,  Socket } from "socket.io";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

export function registerUserEvents(io: SocketIOServer, socket: Socket){
    socket.on("testSocket", (data) => {
        socket.emit("testSocket",{msg: "real time updates"});
    });

    socket.on("updateProfile", async (data:{name: string; avatar: string}) => {
        console.log("updateProfile event", data);
        
        const userId = socket.data.userId;
        if(!userId){
            return socket.emit("updateProfile", {
                success: false,
                msg: "Unauthorized"
            })
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(userId,
                {name: data.name,
                    avatar: data.avatar},
                    {new: true} // returns the user with updated values
                );

                if(!updatedUser){
                    return socket.emit("updateProfile", {
                        success: false,
                        msg: "User not found"
                    })
                };

                //generate token with updated user values
                const newToken = generateToken(updatedUser);
                socket.emit("updateProfile", {
                    success: true,
                    data:{token: newToken},
                    msg: "Profile updated successfully",
                    
                });

        } catch (error) {
            console.log("Error updating the profile: ", error);
            return socket.emit("updateProfile", {
            success: false,
            msg: "Error updating the profile"
            })
        }
    })

  socket.on("getContacts", async () => {
  try {
    const currentUserId = socket.data.userId;

    if (!currentUserId) {
      socket.emit("getContacts", {
        success: false,
        msg: "Unauthorized",
      });
      return;
    }

    const users = await User.find(
    { _id: { $ne: currentUserId } },
    { password: 0 } // exclude password field
    ).lean(); // will fetch JS objects

    const contacts = users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    }));

    socket.emit("getContacts", {
    success: true,
    data: contacts,
    });

  } catch (error: any) {
    console.log("getContacts error: ", error);
    socket.emit("getContacts", {
      success: false,
      msg: "Failed to fetch contacts",
    });
  }
});

}
