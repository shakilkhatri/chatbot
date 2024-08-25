import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import hljs from "highlight.js";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import { calculateCost } from "./utils";
import { models } from "./constants";
import CustomModal from "./CustomModal";

const Chatbot = (props) => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState();
  const [answer, setAnswer] = useState();
  const [enterToSend, setEnterToSend] = useState(true);
  const [rememberContext, setRememberContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jsonFormat, setJsonFormat] = useState(false);
  const [modelName, setModelName] = useState("gpt-4o-mini");
  const [showModal, setShowModal] = useState(false);
  const [customInstruction, setCustomInstruction] = useState(
    "Always give me answer in brief"
  );

  const completionsApiCall = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error("Please check your internet connection.");
    } else {
      setLoading(true);
      setQuery("");

      const history = messages.map((msg) => {
        return { role: msg.isUser ? "user" : "assistant", content: msg.text };
      });
      const currentMsg = {
        role: "user",
        content: query + (jsonFormat ? ". Produce output in JSON format" : ""),
      };
      const systemMsg = {
        role: "system",
        content: customInstruction,
      };
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.apikey}`,
        },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: jsonFormat ? "json_object" : "text" },
          messages: rememberContext
            ? [systemMsg, ...history, currentMsg]
            : [systemMsg, currentMsg],
        }),
      });

      if (r.ok) {
        const data = await r.json();
        console.log(data);
        let costString =
          "Cost : " + calculateCost(modelName, data.usage) + " Rupees";
        console.log(costString);
        toast(costString, { icon: "⚠" });
        setResponse(data);
        setAnswer(data.choices[0].message.content);
      } else {
        setLoading(false);
        toast.error("Something went wrong!");
        throw new Error("Something went wrong!");
      }
    }
    setLoading(false);
  }, [messages, query, rememberContext]);

  const processResponse = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: answer, isUser: false },
    ]);
  };

  const handleSendMessage = useCallback(
    async (e) => {
      // e.preventDefault();
      document.getElementById("query").blur();

      const userInput = query;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, isUser: true },
      ]);

      completionsApiCall();
    },
    [query, setQuery, setMessages, completionsApiCall]
  );

  useEffect(() => {
    response && processResponse();
  }, [response]);

  useEffect(() => {
    let codeElements = document.getElementsByTagName("code");
    for (let i = 0; i < codeElements.length; i++) {
      hljs.highlightElement(codeElements[i]);
    }

    if (window.innerWidth > 500) {
      const inputbox = document.getElementById("query");
      inputbox.focus();
    }

    setTimeout(() => {
      const chatbotBox = document.querySelector(".messages");
      let messages = document.querySelectorAll(".messages>div");
      let lastMessage = messages[messages.length - 1];
      chatbotBox.scrollTo({
        top: lastMessage?.offsetTop - 100,
        behavior: "smooth",
      });
    }, 0);
  }, [messages]);

  const handleClick = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleKeyPress = (event) => {
    setQuery(event.target.value);
  };

  const handlecheckbox1 = () => {
    setRememberContext((p) => !p);
  };

  useEffect(() => {
    const handleEvent = (e) => {
      if (enterToSend && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    if (enterToSend) {
      document.addEventListener("keydown", handleEvent);
    } else {
      document.removeEventListener("keydown", handleEvent);
    }

    return () => {
      document.removeEventListener("keydown", handleEvent);
    };
  }, [enterToSend, handleSendMessage]);

  useEffect(() => {
    if (window.innerWidth > 500) {
      const inputbox = document.getElementById("query");
      inputbox.focus();
    }
  }, []);

  function getStringAfterFirstLineBreak(inputString) {
    const breakIndex = inputString.indexOf("\n");
    if (breakIndex === -1) {
      return inputString;
    }
    const result = inputString.substring(breakIndex + 1);
    return result;
  }

  function formatTextWithBold(text) {
    const parts = text.split("**");
    const formattedText = parts.map((part, index) => {
      if (index % 2 === 1) {
        return `<strong key={index}>${part}</strong>`;
      }
      return part;
    });
    return formattedText.join("");
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveModal = (instruction) => {
    setCustomInstruction(instruction);
  };

  return (
    <div className="chatbot">
      <Toaster position="top-center" />
      <div className="chatbot-inner">
        {/* <h1 style={{ textAlign: "center" }}>CHATBOT</h1> */}
        <div className="messagesOuter">
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index + "00"}
                className={message.isUser ? "user-message" : "bot-message"}
              >
                {message.isUser ? (
                  <span>
                    <pre onClick={() => handleClick(message.text)}>
                      {message.text}
                    </pre>
                  </span>
                ) : (
                  <span>
                    {message.text.split("```").map((item, index) => {
                      if (index % 2 === 0) {
                        return (
                          <div key={index + "11"}>
                            <pre
                              onClick={() => handleClick(item)}
                              dangerouslySetInnerHTML={{
                                __html:
                                  index === 0
                                    ? formatTextWithBold(item)
                                    : formatTextWithBold(item.slice(2)),
                              }}
                            ></pre>
                            <br />
                          </div>
                        );
                      } else {
                        return (
                          <div style={{ position: "relative" }}>
                            {item.split("\n", 1)[0] && (
                              <pre className="lang_name">
                                {item.split("\n", 1)[0]}
                              </pre>
                            )}

                            <pre
                              key={index + "22"}
                              onClick={() =>
                                handleClick(
                                  getStringAfterFirstLineBreak(item) || item
                                )
                              }
                            >
                              <code>
                                {item.split("\n", 1)[0]
                                  ? "\n" + getStringAfterFirstLineBreak(item)
                                  : item.slice(1)}
                              </code>
                            </pre>
                            <br />
                          </div>
                        );
                      }
                    })}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <Spinner animation="grow" variant="primary" className="spinner" />
            )}
          </div>
        </div>

        <div className="checkboxes">
          <div>
            <input
              type="checkbox"
              checked={rememberContext}
              name="rememberContext"
              id="rememberContext"
              onChange={handlecheckbox1}
            />
            <label htmlFor="rememberContext">Remember context</label>
          </div>
          <div>
            <input
              type="checkbox"
              checked={enterToSend}
              name="enterToSend"
              id="enterToSend"
              onChange={() => setEnterToSend((p) => !p)}
            />
            <label htmlFor="enterToSend">Enter to send</label>
          </div>
          <div>
            <input
              type="checkbox"
              checked={jsonFormat}
              name="jsonFormat"
              id="jsonFormat"
              onChange={() => setJsonFormat((p) => !p)}
            />
            <label htmlFor="jsonFormat">JSON mode</label>
          </div>
          <div>
            <select
              name="model"
              id="modelName"
              onChange={(e) => setModelName(e.target.value)}
            >
              {models.map((model) => (
                <option value={model.model_name} key={model.model_name}>
                  {model.model_name}
                </option>
              ))}
            </select>
          </div>
          <button className="newchat" onClick={() => setMessages([])}>
            &#128465; Clear chat
          </button>

          <button
            className="customInstructionBtn"
            onClick={() => setShowModal(true)}
          >
            &#9965; Custom Instruction
          </button>
          <CustomModal
            show={showModal}
            handleClose={handleCloseModal}
            handleSave={handleSaveModal}
            initialValue={customInstruction}
          />
          {/* <p>Custom Instruction: {customInstruction}</p> */}
        </div>
        <div
          // onSubmit={handleSendMessage}
          className="chatbot-form"
          // style={{ display: "none" }}
        >
          <textarea
            type="text"
            name="userInput"
            placeholder="Type your message..."
            id="query"
            value={query}
            onChange={handleKeyPress}
          />

          <div className="inputsDiv">
            <button id="sendBtn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
