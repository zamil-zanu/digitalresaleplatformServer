const messages = require('../Model/messageModel');
const users = require('../Model/userModel')


// get chat partners
exports.getChatPartnersController = async (req, res) => {
    console.log("inside getChatPartnersController");

    try {
        const me = req.userId;  // set by your auth middleware
        console.log("me", me);

        // 1- Fetch recent messages where I'm sender or receiver
        const msgs = await messages.find({
            $or: [{ senderId: me }, { receiverId: me }]
        })
            .sort({ timestamp: -1 })   // newest first
            .limit(100)
            .lean();

        // 2️- Build a map: partnerId -> { text, timestamp }
        const partnerMap = new Map();
        for (const msg of msgs) {
            // identify the “other” user in this message
            const partnerId = msg.senderId.toString() === me
                ? msg.receiverId.toString()
                : msg.senderId.toString();

            // if we haven’t recorded a last message for them yet, do it now
            if (!partnerMap.has(partnerId)) {
                partnerMap.set(partnerId, {
                    lastMessage: msg.text,
                    lastTimestamp: msg.timestamp
                });
            }
            // once we have all distinct partners (up to 100), we could break early:
            if (partnerMap.size >= 50) break;
        }


        // 3️- Fetch partner user info
        const partnerIds = Array.from(partnerMap.keys());
        const partnerUsers = await users.find({ _id: { $in: partnerIds } })
            .select('_id username profilePic')  // only what you need
            .lean();
        console.log("partnerIds", partnerIds);

        // 4️- Merge in lastMessage / lastTimestamp
        const chatList = partnerUsers.map(user => ({
            _id: user._id,
            name: user.username,
            avatar: user.profilePic,
            lastMessage: partnerMap.get(user._id.toString()).lastMessage,
            lastTimestamp: partnerMap.get(user._id.toString()).lastTimestamp,
        }));

        // 5️- Sort partners by descending timestamp (so most-recent chat on top)
        chatList.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        return res.json(chatList);

    } catch (err) {
        console.error("Error in getChatPartners:", err);
        return res.status(500).json({ error: 'Server error' });
    }
};


// get chat history 
exports.getChatHistoryController = async (req, res) => {
    const { roomId } = req.params;
    try {
        const allMessages = await messages.find({ roomId }).sort({ timestamp: 1 });
        res.status(200).json(allMessages);
    } catch (err) {
        res.status(500).json({ message: "Failed to load chat history" });
    }
};

// upload images in messages 
exports.uploadChatImagesController = (req, res) => {
    const fileNames = req.files.map(file => file.filename);
    res.json({ images: fileNames });
}

// get unread message Count
exports.getUnreadMessageCountController = async (req, res) => {
    const { userId } = req.userId;
    try {
        const unreadCounts = await messages.aggregate([
            { $match: { receiverId: userId, isRead: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } },
        ]);
        res.json(unreadCounts);
    } catch (err) {
        console.error("Unread count error", err);
        res.status(500).json({ error: "Failed to fetch unread counts" });
    }
}



