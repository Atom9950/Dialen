import { getSocket } from "./socket"

export const testSocket = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("testSocket", payload);
    }
    else if(typeof payload === "function"){
        socket.on("testSocket", payload);
    }
    else{
        socket.emit("testSocket", payload);
    }
}

export const updateProfile = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("updateProfile", payload);
    }
    else if(typeof payload === "function"){
        socket.on("updateProfile", payload);
    }
    else{
        socket.emit("updateProfile", payload);
    }
}

export const getContacts = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("getContacts", payload);
    }
    else if(typeof payload === "function"){
        socket.on("getContacts", payload);
    }
    else{
        socket.emit("getContacts", payload);
    }
}

export const newConversation = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("newConversation", payload);
    }
    else if(typeof payload === "function"){
        socket.on("newConversation", payload);
    }
    else{
        socket.emit("newConversation", payload);
    }
}

export const getConversations = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("getConversations", payload);
    }
    else if(typeof payload === "function"){
        socket.on("getConversations", payload);
    }
    else{
        socket.emit("getConversations", payload);
    }
}

export const newMessage = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("newMessage", payload);
    }
    else if(typeof payload === "function"){
        socket.on("newMessage", payload);
    }
    else{
        socket.emit("newMessage", payload);
    }
}

export const getMessages = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("getMessages", payload);
    }
    else if(typeof payload === "function"){
        socket.on("getMessages", payload);
    }
    else{
        socket.emit("getMessages", payload);
    }
}

// Delete conversation event
export const deleteConversation = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("deleteConversation", payload);
    }
    else if(typeof payload === "function"){
        socket.on("deleteConversation", payload);
    }
    else{
        socket.emit("deleteConversation", payload);
    }
}

// Listen for conversation deleted by other users
export const conversationDeleted = (payload: any, off: boolean = false) => {
    const socket = getSocket();
    if(!socket){
        console.log("Socket is not connected");
        return;
    }

    if(off){
        socket.off("conversationDeleted", payload);
    }
    else if(typeof payload === "function"){
        socket.on("conversationDeleted", payload);
    }
    else{
        socket.emit("conversationDeleted", payload);
    }
}