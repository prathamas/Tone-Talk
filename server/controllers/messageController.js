

// controllers/messageController.js
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

// 1) Sidebar users + unseen counts
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    // unseen per sender
    const unseenMessages = {};
    const jobs = filteredUsers.map(async (user) => {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (count > 0) unseenMessages[user._id.toString()] = count;
    });
    await Promise.all(jobs);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 2) Conversation messages (sorted, mark as seen)
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) // chronological
      .lean(); // return plain objects

    // normalize ids to strings (helps frontend comparisons/keys)
    const normalized = messages.map((m) => ({
      ...m,
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
    }));

    // mark partner→me messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages: normalized });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 3) Mark one message as seen (FIXED req,res order)
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// 4) Send message (emit to BOTH sender & receiver, normalize ids)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const doc = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl || undefined,
    });

    // prepare plain object with string ids for the client
    const newMessage = {
      ...doc.toObject(),
      senderId: doc.senderId.toString(),
      receiverId: doc.receiverId.toString(),
    };

    // emit to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // emit back to sender (so they see it immediately)
    const senderSocketId = userSocketMap[senderId.toString()];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Mark all messages from a specific sender as seen
export const markAllMessagesAsSeen = async (req, res) => {
  try {
    const myId = req.user._id;
    const senderId = req.params.userId;

    await Message.updateMany(
      { senderId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
