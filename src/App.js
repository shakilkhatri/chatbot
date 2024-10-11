import Chatbot from "./Chatbot";
import { useEffect, useState } from "react";

const App = () => {
  const [key, setKey] = useState(null);

  return <Chatbot apikey={key} />
};

export default App;
