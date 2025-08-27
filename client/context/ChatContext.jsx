import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import vader from "vader-sentiment";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);

        // Clear unseen count for this user
        setUnseenMessages((prev) => ({
          ...prev,
          [userId]: 0,
        }));

        // Mark messages as seen in backend
        await axios.put(`/api/messages/mark-all/${userId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  // Function to check tone
  const checkTone = (text) => {
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    if (intensity.compound < -0.6) {
      return "negative";
    } else if (intensity.compound > 0.3) {
      return "positive";
    } else {
      return "neutral";
    }
  };


  // Send message to selected user
  const actuallySend = async (messageData) => {
    const { data } = await axios.post(
      `/api/messages/send/${selectedUser._id}`,
      messageData
    );
    if (data.success) {
      setMessages((prev) => [...prev, data.newMessage]);
    } else {
      toast.error(data.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const tone = checkTone(messageData.text);

      if (tone === "negative") {
        return toast.custom((t) => (
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-2">
            <span className="text-red-600 font-medium">
              ⚠️ Your message seems negative
            </span>
            <div className="flex gap-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={async () => {
                  toast.dismiss(t.id);
                  await actuallySend(messageData); // only here
                }}
              >
                Send Anyway
              </button>
            </div>
          </div>
        ));
      }

      // normal send if not negative
      await actuallySend(messageData);

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to socket messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // Ignore messages sent by myself
      if (newMessage.senderId === authUser._id) return;

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);

        // Clear unseen count for this user automatically
        setUnseenMessages((prev) => ({
          ...prev,
          [selectedUser._id]: 0,
        }));

        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from socket messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  // Handle subscribing/unsubscribing when socket or selectedUser changes
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    getUsers,
    getMessages,
    sendMessage,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
