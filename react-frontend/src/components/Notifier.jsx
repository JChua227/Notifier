import axios from "axios";
import { useEffect, useState } from "react";
import Message from "./Message";
import Navigation from "./Navigation";
import "../styles/Notifier.css";

export const Notifier = () => {
  const [messages, setMessages] = useState([]);
  const [messageAction, setMessageAction] = useState(true);
  const [expirationDate, setExpirationDate] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const createMessage = async () => {
    let temp = new Date(expirationDate);
    temp.setSeconds(temp.getSeconds() + new Date().getSeconds());
    const executionTime = new Date(temp).toISOString();

    await axios
      .post(
        "http://localhost:8080/messages/createMessage",
        {
          message: newMessage,
          executionTime: executionTime,
          recipient: recipient,
        },
        { withCredentials: true }
      )
      .catch((err) => {
        alert("You need to register/login first.");
      });
  };

  const populateMessages = async () => {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await axios.get(
      `http://localhost:8080/messages/getMessages/${timezone}`,
      {
        withCredentials: true,
      }
    );
    setMessages(result.data);
  };

  useEffect(() => {
    populateMessages();
  }, [messageAction]);

  const updateMessages = () => {
    setMessageAction(!messageAction);
  };

  return (
    <div>
      <Navigation />
      <form>
        <div>
          <h2>Create Notification</h2>
          <label htmlFor="messageNotification">Description:</label>
          <input
            id="messageNotification"
            className="createNotificationInput"
            onChange={(e) => setNewMessage(e.target.value)}
          ></input>
        </div>

        <label className="recipient">Recipient's Phone Number:</label>
        <input
          id="recipient"
          className="recipientPhoneNumber"
          onChange={(e) => setRecipient(e.target.value)}
        ></input>

        <div>
          <label htmlFor="expirationDate"></label>
          <input
            id="expirationDate"
            type="datetime-local"
            onChange={(e) => setExpirationDate(e.target.value)}
            className="date"
          ></input>
          <label htmlFor="submit"></label>
          <button
            className="btn btn-primary submitButton"
            onClick={createMessage}
          >
            Create Notification
          </button>
        </div>
      </form>

      <hr />

      <div>
        <h2>Results:</h2>
        <div>
          {messages.map((message) => (
            <Message
              key={message.messagesId}
              message={message}
              updateMessages={updateMessages}
            ></Message>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifier;
