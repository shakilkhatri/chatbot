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

const PasswordPage = ({ setHasAccess }) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === pw) {
      console.log("Password is correct");
      setHasAccess(true);
    } else {
      setErrorMessage("Invalid password. Please try again.");
    }
  };

  useEffect(() => {
    document.getElementById("password").focus();
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
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <br />
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default PasswordPage;
