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
import OpenAI from "openai";
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
  const [conversionRate, setConversionRate] = useState(90); // Default fallback rate

  // Streaming and image support states
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState(null);
  const [pastedImages, setPastedImages] = useState([]);

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

  // Fetch USD to INR conversion rate on app load
  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
        );
        if (response.ok) {
          const data = await response.json();
          // The API returns data in format: { date: "...", usd: { inr: 87.9, ... } }
          if (data.usd && data.usd.inr) {
            setConversionRate(data.usd.inr);
            console.log("USD to INR conversion rate updated:", data.usd.inr);
          }
        } else {
          console.error("Failed to fetch conversion rate");
        }
      } catch (error) {
        console.error("Error fetching conversion rate:", error);
      }
    };

    fetchConversionRate();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const modelObj = models.find((model) => model.model_name === modelName);
    setIsCOT(modelObj.isCOT);
  }, [modelName]);

  const responsesApiCall = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error("Please check your internet connection.");
    } else {
      setLoading(true);
      setIsStreaming(true);
      setStreamingMessage("");
      setQuery("");

      try {
        // Build conversation history in Responses API format
        const history = messages.map((msg) => {
          const content = [{ type: "input_text", text: msg.text }];
          // Add images if present in message
          if (msg.images && msg.images.length > 0) {
            msg.images.forEach((img) => {
              content.push({
                type: "input_image",
                source: { type: "base64", data: img.data },
              });
            });
          }
          return {
            type: "message",
            role: msg.isUser ? "user" : "assistant",
            content: content,
          };
        });

        // Build current message content
        const currentContent = [
          {
            type: "input_text",
            text: query + (jsonFormat ? ". Produce output in JSON format" : ""),
          },
        ];

        // Add pasted images to current message
        if (pastedImages.length > 0) {
          pastedImages.forEach((img) => {
            // Extract base64 data (remove data:image/...;base64, prefix)
            const base64Data = img.dataUrl.split(",")[1];
            currentContent.push({
              type: "input_image",
              source: { type: "base64", data: base64Data },
            });
          });
        }

        const currentMsg = {
          type: "message",
          role: "user",
          content: currentContent,
        };

        const systemMsg = {
          type: "message",
          role: "system",
          content: [{ type: "input_text", text: customInstruction }],
        };

        let inputArray = rememberContext
          ? [...history, currentMsg]
          : [currentMsg];

        if (!modelName.includes("o1")) {
          inputArray.unshift(systemMsg);
        }

        const requestBody = {
          model: modelName,
          input: inputArray,
          // Use non-streaming SDK call here
          stream: false,
          text: {
            format: { type: jsonFormat ? "json_object" : "text" },
          },
          reasoning_effort: isCOT ? reasoning_effort : undefined,
        };

        // Use the OpenAI SDK for the request. In browser environments the SDK
        // may return a streaming body when `stream: true` is set. We set
        // `dangerouslyAllowBrowser: true` because this is running in the
        // browser; ensure you understand the security implications.
        requestBody.stream = true;
        const client = new OpenAI({
          apiKey: props.apikey,
          dangerouslyAllowBrowser: true,
        });

        const stream = await client.responses.create(requestBody);

        let accumulatedText = "";
        let usageData = null;

        for await (const chunk of stream) {
          if (chunk.type === "response.created") {
            setCurrentResponseId(chunk.response.id);
          } else if (chunk.type === "response.output_text.delta") {
            const chunkText = chunk.delta;
            if (chunkText) {
              accumulatedText += chunkText;
              setStreamingMessage(accumulatedText);
            }
          } else if (chunk.type === "response.done") {
            if (chunk.response && chunk.response.usage) {
              usageData = chunk.response.usage;
            }
          }
        }
        
        setLoading(false);
        setIsStreaming(false);

        if (usageData) {
          const usageForCalc = {
            prompt_tokens: usageData.input_tokens,
            completion_tokens: usageData.output_tokens,
          };
          let costString =
            "Cost : " +
            calculateCost(modelName, usageForCalc, conversionRate) +
            " Paise";
          console.log(costString);
          toast(costString, { icon: "⚠" });
        }

        setAnswer(accumulatedText);
        setPastedImages([]);
      } catch (error) {
        setLoading(false);
        setIsStreaming(false);
        console.error("Error in responsesApiCall:", error);
        toast.error("An error occurred. Please try again.");
      }
    }
  }, [
    messages,
    query,
    rememberContext,
    conversionRate,
    pastedImages,
    jsonFormat,
    modelName,
    customInstruction,
    isCOT,
    reasoning_effort,
    props.apikey,
  ]);

  const processResponse = () => {
    if (answer) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: answer, isUser: false },
      ]);
      setStreamingMessage("");
    }
  };

  const handleSendMessage = useCallback(
    async (e) => {
      // e.preventDefault();
      if (isStreaming || loading) return; // Prevent sending while streaming

      textareaRef.current && textareaRef.current.blur();

      const userInput = query;

      // Store images with the message
      const messageImages = pastedImages.map((img) => ({
        dataUrl: img.dataUrl,
        data: img.dataUrl.split(",")[1], // Store base64 data
      }));

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: userInput,
          isUser: true,
          images: messageImages.length > 0 ? messageImages : undefined,
        },
      ]);

      responsesApiCall();
      // Reset/adjust textarea height after sending (query will be cleared by responsesApiCall)
      setTimeout(() => {
        const t = textareaRef.current || document.getElementById("query");
        if (t) {
          t.style.height = "";
          adjustTextAreaHeight(t);
        }
      }, 0);
    },
    [
      query,
      setQuery,
      setMessages,
      responsesApiCall,
      isStreaming,
      loading,
      pastedImages,
    ]
  );

  useEffect(() => {
    answer && processResponse();
  }, [answer]);

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

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPastedImages((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                dataUrl: event.target.result,
                file: file,
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleKeyDown = (event) => {
    if (window.innerWidth > 500 && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const removeImage = (imageId) => {
    setPastedImages((prev) => prev.filter((img) => img.id !== imageId));
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
                    {message.images && message.images.length > 0 && (
                      <div className="message-images">
                        {message.images.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img.dataUrl}
                            alt={`Uploaded ${imgIndex + 1}`}
                            className="message-image-thumbnail"
                          />
                        ))}
                      </div>
                    )}
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
            {isStreaming && streamingMessage && (
              <div className="bot-message">
                <span>
                  <pre
                    dangerouslySetInnerHTML={{
                      __html:
                        formatTextWithBoldAndMath(streamingMessage) +
                        '<span class="streaming-cursor">▊</span>',
                    }}
                  ></pre>
                </span>
              </div>
            )}
            {loading && !isStreaming && (
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
          {pastedImages.length > 0 && (
            <div className="image-preview-container">
              {pastedImages.map((img) => (
                <div key={img.id} className="image-preview-item">
                  <img src={img.dataUrl} alt="Preview" />
                  <button
                    className="image-remove-btn"
                    onClick={() => removeImage(img.id)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="input-container">
            <textarea
              type="text"
              name="userInput"
              placeholder="Type your message..."
              id="query"
              ref={textareaRef}
              value={query}
              onChange={handleKeyPress}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
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
