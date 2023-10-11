import Chatbot from "./Chatbot";
import { useState } from "react";
import PasswordPage from "./passwordPage";

const App = () => {
  const [hasAccess, setHasAccess] = useState(false);

  return hasAccess ? <Chatbot /> : <PasswordPage setHasAccess={setHasAccess} />;
};

export default App;
