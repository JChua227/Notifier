import "../styles/Message.css";
const axios = require("axios");

const Message = (prop) => {
  const deleteMessage = async () => {
    await axios
      .post(
        "http://localhost:8080/messages/deleteMessage",
        { messageId: prop.message.messagesId },
        { withCredentials: true }
      )
      .catch((err) => console.log(err));
  };



  return (
    <div>
      <div className="message">
        <h3>{prop.message.executionTime}</h3>
        <p>{prop.message.messages}</p>
        <p>Notifying Number: {prop.message.recipient}</p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            deleteMessage();
            prop.updateMessages();
          }}
          value={prop.messageId}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Message;
