import React, { useState } from "react";
import axios from "axios";
import Form from "react-bootstrap/form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Arweave from "arweave/web";
import jwk from "../jwk.json";
const PARSER_SERVER = "http://localhost:5000";

// wallet address
//SX0duS8joWa1B3oBNK-sciE1sGUPW9GH_4Kq4jIZdp4

function SearchBox() {
  const [url, setUrl] = useState("");

  // state for article
  const [content, setContent] = useState("");

  // state for bootstrap modal
  const [show, setShow] = useState(false);

  // state for transaction management
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const arweave = Arweave.init();

  const handleSubmit = e => {
    e.preventDefault();
    axios
      .get(`${PARSER_SERVER}/fetch?url=${url}`)
      .then(result => {
        console.log(result.data);
        setContent(result.data.text);
        createTransaction();
      })
      .catch(error => console.log(error));
  };

  function createTransaction() {
    console.log("called");
    // create a new transaction
    let Transaction = arweave.createTransaction(
      {
        data:
          '<html><head><meta charset="UTF-8"><title>Hello world!</title></head><body></body></html>'
      },
      jwk
    );
    console.log(Transaction);

    const startTimer = id => {
      const timer = setInterval(function() {
        arweave.transactions.getStatus(id).then(status => {
          const confirmStatus = status.confirmed;
          if (confirmStatus !== null) {
            clearInterval(timer);
            console.log("done");
            console.log("https://arweave.net/" + id);
            //   this.setState({ transactionStatus: "confirmed" });
          }
        });
      }, 3000);
    };

    Transaction.then(function(Response) {
      Response.addTag("Content-Type", "text/html");
      Response.addTag("post_type", "article");
      arweave.transactions
        .sign(Response, jwk)
        .then(function(signedTransactionResponse) {
          arweave.transactions
            .post(Response)
            .then(function(postResponse) {
              const transactionData = JSON.parse(postResponse.config.data);
              console.log(transactionData);
              startTimer(transactionData.id);
            });
        });
    });
  }

  return (
    <Container className="SearchBox">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Control
            type="URL"
            placeholder="Enter URL of page you want to archive"
            value={url}
            onChange={evt => setUrl(evt.target.value)}
          />
          <Form.Text className="text-muted">
            You should not archive any copyrighted content that you don't own,
            otherwise you would be solely responsible for any legal action
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit" onClick={handleShow}>
          Preview
        </Button>
      </Form>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>thi</Modal.Title>
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default SearchBox;
