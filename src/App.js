import Chatbot from "./Chatbot";
import { useEffect, useState } from "react";
import APIKeyInputPage from "./APIKeyInputPage";

const App = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [key, setKey] = useState(null);

  useEffect(() => {
    const apiKeyFromLocalStorage = localStorage.getItem("aik");
    if (apiKeyFromLocalStorage) {
      setHasAccess(true);
      setKey(apiKeyFromLocalStorage);
    }
  }, []);

  return hasAccess ? (
    <Chatbot apikey={key} />
  ) : (
    <APIKeyInputPage setHasAccess={setHasAccess} />
  );
};

export default App;
