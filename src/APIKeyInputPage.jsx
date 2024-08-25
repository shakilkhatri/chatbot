import React, { useState } from "react";
import { useEffect } from "react";
import { Form, Button } from "react-bootstrap";

function createStringOfMonthAndHour() {
  const currentDate = new Date();
  const monthNumber = currentDate.getMonth() + 1;
  const hourNumber = currentDate.getHours();
  const monthString = monthNumber.toString();
  const hourString = hourNumber.toString();
  const paddedMonthString = monthString.padStart(2, "0");
  const paddedHourString = hourString.padStart(2, "0");
  const finalString = paddedMonthString + paddedHourString;
  return finalString;
}

const pw = createStringOfMonthAndHour();

const APIKeyInputPage = ({ setHasAccess }) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (apiKeyInput.trim()) {
      setHasAccess(true);
      localStorage.setItem("aik", apiKeyInput);
    } else {
      setErrorMessage("Invalid key");
    }
  };

  useEffect(() => {
    document.getElementById("apiKeyInput").focus();
  }, []);

  return (
    <div className="container">
      <br />
      <br />
      <Form onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <Form.Group controlId="apiKeyInput">
          <Form.Label>OpenAI API Key:</Form.Label>
          <Form.Control
            type="password"
            placeholder=""
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
        </Form.Group>
        <br />
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
      <div style={{ position: "absolute", bottom: 30 }}>
        <div>Contact for any query or feedback:</div>
        <a href="mailto:khatri.shakilamd@gmail.com">
          khatri.shakilamd@gmail.com
        </a>
        <div></div>
      </div>
    </div>
  );
};

export default APIKeyInputPage;
