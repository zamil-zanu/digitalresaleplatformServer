const messages = require('../Model/messageModel'); // Adjust path as needed
// const User = require('./Models/User');       // If you need user info 
const { verifyTokenSocket } = require('./verifySocketToken'); // Example auth helper

module.exports = (io) => {
    //  Socket-level middleware for authentication
    io.use(async (socket, next) => {
        // Example: client sends token in handshake auth
        // On client side: io(SERVER_URL, { auth: { token } });
        const token = socket.handshake.auth?.token;
        console.log(token);

        if (!token) {
            console.log("Socket auth failed: no token");
            return next(new Error("Authentication error"));
        }
        try {
            // Example: verifyTokenSocket can verify and return user info
            const userData = await verifyTokenSocket(token);
            console.log("below userData");

            console.log(userData);
            socket.user = {   // socket lek 'user' enna key add
                id: userData.id,
                // ...other user fields if needed
            };
            return next();
        } catch (err) {
            console.error("Socket auth error:", err);
            return next(new Error("Authentication error"));
        }
    });

    const onlineUsers = new Set()

    const userSocketMap = new Map();

    io.on("connection", (socket) => {
        console.log("User Connected", socket.id, "UserId:", socket.user?.id);

        const userId = socket.user.id.toString();  // 👈 Ensure it's a string
        userSocketMap.set(userId, socket.id);

        // 1- Add this user
        onlineUsers.add(socket.user.id);

        // 2- Send the current set to the newly connected socket
        socket.emit("onlineUsersList", Array.from(onlineUsers));


        // 3- Notify everyone else that this user just came online
        socket.broadcast.emit("userOnline", { userId: socket.user.id });

        // Join room (for private chats)
        socket.on("joinRoom", ({ roomId }) => {
            if (!roomId) return;
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
            // Optionally: notify others in room that user joined
            // socket.to(roomId).emit("userJoined", { userId: socket.user.id });
        });

        // Mark all messages in a room as read for a specific user
        socket.on("markMessagesAsRead", async ({ roomId, partnerId }) => {
            console.log("----------------------------");

            console.log("roomid and partner id", roomId, partnerId);

            try {

                const readerId = socket.user.id;
                // Find messages being marked as read
                const messagesToMark = await messages.find({
                    roomId,
                    receiverId: readerId,
                    senderId: partnerId,
                    isRead: false
                });
                console.log(messagesToMark);
                
                if (messagesToMark.length > 0) {
                    await messages.updateMany(
                        { roomId, receiverId: readerId, senderId: partnerId, isRead: false },
                        { $set: { isRead: true } }
                    );
                }
                // now we only need to tell the client about that one partner:
                socket.emit("markedAsReadFrom", { partnerId });
                console.log("Sent markedAsReadFrom for:", partnerId);
            } catch (err) {
                console.error("Error marking messages as read", err);
            }
        });

        // Handle sending messages
        socket.on("sendMessage", async ({ roomId, message }) => {
            // Basic validation
            if (!roomId || !message) {
                console.warn("sendMessage missing data:", { roomId, message });
                return;
            }
            try {
                // Save message to DB (assuming Mongoose)
                // Ensure Message schema matches fields
                const dbMsg = new messages({
                    roomId,
                    senderId: message.senderId,
                    receiverId: message.receiverId, // array of image filenames
                    text: message.text,
                    images: message.images || [],
                    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
                    isRead: false,  // ← track unread
                });
                await dbMsg.save();

                // Broadcast to everyone in that room, including sender if desired
                // below OR io.to(roomId).emit("receiveMessage", dbMsg.toObject()); (because  Mongoose model instances contain extra metadata and methods, so to avoid sending those over the socket, it's often better to convert the model to a plain object first)
                io.to(roomId).emit("receiveMessage", {
                    _id: dbMsg._id,
                    roomId: dbMsg.roomId,
                    senderId: dbMsg.senderId,
                    receiverId: dbMsg.receiverId,
                    text: dbMsg.text,
                    images: dbMsg.images || [],  // include images array
                    timestamp: dbMsg.timestamp,
                });

                //  Emit unread count ONLY to the receiver
                const receiverSocketId = userSocketMap.get(message.receiverId);

                if (receiverSocketId) {
                    const unreadCount = await messages.countDocuments({
                        receiverId: message.receiverId,
                        senderId: message.senderId,
                        isRead: false,
                    });

                    io.to(receiverSocketId).emit("unreadCountUpdate", {
                        userId: message.senderId,
                        unreadCount,
                    });
                    console.log("Unread count to send:", unreadCount, "for user:", message.receiverId, "from:", message.senderId);
                } else {
                    console.log("Receiver not connected, cannot send unread count.");
                }

            } catch (err) {
                console.error("Error in sendMessage handler:", err);
                // Optionally inform sender of error
                socket.emit("messageError", { error: "Failed to send message" });
            }
        });

        // Handle disconnect
        socket.on("disconnect", (reason) => {
            console.log("User disconnected:", socket.id, "Reason:", reason);
            userSocketMap.delete(userId);

            // 3-removing the user’s ID from the onlineUsers set
            onlineUsers.delete(socket.user.id);
            //  broadcast offline status
            socket.broadcast.emit("userOffline", { userId: socket.user.id });
        });

    });
};


