import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CustomModal = ({ show, handleClose, handleSave, initialValue }) => {
  const [customInstruction, setCustomInstruction] = useState(initialValue);

  const handleInputChange = (e) => {
    setCustomInstruction(e.target.value);
  };

  const handleSaveClick = () => {
    handleSave(customInstruction);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Custom Instruction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            {/* <Form.Label>Custom Instruction</Form.Label> */}
            <Form.Control
              as="textarea"
              value={customInstruction}
              onChange={handleInputChange}
              rows={6}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
