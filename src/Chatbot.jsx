import React, { useState, useEffect, useCallback, useRef } from "react";
import "./styles.css";
import hljs from "highlight.js";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import { calculateCost } from "./utils";
import { models } from "./constants";
import CustomModal from "./CustomModal";
import katex from "katex";
import "katex/dist/katex.min.css";
import { TrashIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import {
  MoonIcon,
  SunIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/16/solid";

const Chatbot = (props) => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState();
  const [answer, setAnswer] = useState();
  // Enter-to-send is hidden and disabled by default per UX requirement
  const [enterToSend, setEnterToSend] = useState(false);
  const [rememberContext, setRememberContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jsonFormat, setJsonFormat] = useState(false);
  const [modelName, setModelName] = useState("gpt-5-nano");
  const [showModal, setShowModal] = useState(false);
  const [isCOT, setIsCOT] = useState(false);
  const [reasoning_effort, setReasoning_effort] = useState("medium");
  const [customInstruction, setCustomInstruction] = useState(
    "Always give me answer in brief"
  );
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const modelObj = models.find((model) => model.model_name === modelName);
    setIsCOT(modelObj.isCOT);
  }, [modelName]);

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
      let messagesArray = rememberContext
        ? [...history, currentMsg]
        : [currentMsg];
      if (!modelName.includes("o1")) {
        messagesArray.unshift(systemMsg);
      }
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.apikey}`,
        },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: jsonFormat ? "json_object" : "text" },
          messages: messagesArray,
          reasoning_effort: isCOT ? reasoning_effort : undefined,
        }),
      });

      if (r.ok) {
        const data = await r.json();
        console.log(data);
        let costString =
          "Cost : " + calculateCost(modelName, data.usage) + " Paise";
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
      textareaRef.current && textareaRef.current.blur();

      const userInput = query;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, isUser: true },
      ]);

      completionsApiCall();
      // Reset/adjust textarea height after sending (query will be cleared by completionsApiCall)
      setTimeout(() => {
        const t = textareaRef.current || document.getElementById("query");
        if (t) {
          t.style.height = "";
          adjustTextAreaHeight(t);
        }
      }, 0);
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
      inputbox && inputbox.focus();
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

    // adjust textarea height on messages change (new messages may affect layout)
    const ta = textareaRef.current || document.getElementById("query");
    if (ta) adjustTextAreaHeight(ta);

    // ensure textarea resizes on window resize
    const onResize = () => {
      const t = textareaRef.current || document.getElementById("query");
      if (t) adjustTextAreaHeight(t);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
    // adjust textarea height as user types
    const ta = document.getElementById("query");
    if (ta) {
      adjustTextAreaHeight(ta);
    }
  };

  const textareaRef = useRef(null);

  // Adjusts the textarea height to fit content up to a maximum
  const adjustTextAreaHeight = (el) => {
    if (!el) return;
    // reset height so scrollHeight is calculated correctly
    el.style.height = "auto";
    const max = window.innerWidth <= 500 ? 180 : 220; // px cap for mobile/desktop
    const newHeight = Math.min(el.scrollHeight, max);
    el.style.height = newHeight + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
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

  function formatTextWithBoldAndMath(text) {
    const mathParts = text.split(/(\\\[[\s\S]*?\\\])/);

    const processedParts = mathParts.map((part, mathIndex) => {
      if (part.startsWith("\\[") && part.endsWith("\\]")) {
        const mathContent = part.slice(3, -3);
        const renderedMath = katex.renderToString(mathContent, {
          displayMode: true,
          throwOnError: false,
        });
        return renderedMath;
      }

      const boldParts = part.split("**");
      const formattedBoldText = boldParts.map((boldPart, boldIndex) => {
        if (boldIndex % 2 === 1) {
          return `<strong key="bold-${mathIndex}-${boldIndex}">${boldPart}</strong>`;
        }
        return boldPart;
      });

      return formattedBoldText.join("");
    });

    return processedParts.join("");
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
                                    ? formatTextWithBoldAndMath(item)
                                    : formatTextWithBoldAndMath(item.slice(2)),
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
            <label htmlFor="rememberContext">Context</label>
          </div>
          {/* "Enter to send" control hidden from UI but state remains available
            The original checkbox block is preserved here as a JSX comment so it can be restored easily if needed.

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

          */}
          <div>
            <input
              type="checkbox"
              checked={jsonFormat}
              name="jsonFormat"
              id="jsonFormat"
              onChange={() => setJsonFormat((p) => !p)}
            />
            <label htmlFor="jsonFormat">JSON</label>
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
          {isCOT && (
            <div>
              <select
                name="reasoning_effort"
                id="reasoning_effort"
                value={reasoning_effort}
                onChange={(e) => setReasoning_effort(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
          <button className="newchat" onClick={() => setMessages([])}>
            <TrashIcon style={{ height: 24, width: 24 }} />
          </button>

          <button
            className="customInstructionBtn"
            onClick={() => setShowModal(true)}
          >
            <Cog6ToothIcon
              style={{
                height: 24,
                width: 24,
                color: isDarkMode ? "white" : "black",
              }}
            />
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {isDarkMode ? (
              <SunIcon style={{ height: 24, width: 24, color: "orange" }} />
            ) : (
              <MoonIcon style={{ height: 24, width: 24, color: "black" }} />
            )}
          </button>
          <CustomModal
            show={showModal}
            handleClose={handleCloseModal}
            handleSave={handleSaveModal}
            initialValue={customInstruction}
          />
        </div>
        <div className="chatbot-form">
          <div className="input-container">
            <textarea
              type="text"
              name="userInput"
              placeholder="Type your message..."
              id="query"
              ref={textareaRef}
              value={query}
              onChange={handleKeyPress}
            />
            <button id="sendBtn" onClick={handleSendMessage}>
              <PaperAirplaneIcon
                style={{
                  height: 24,
                  width: 24,
                  color: isDarkMode ? "white" : "black",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
