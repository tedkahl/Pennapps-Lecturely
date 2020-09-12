import React from "react";
import socketIOClient from "socket.io-client";
import "../styles/board.css";

const ENDPOINT = "http://localhost:4000/";
const socket = socketIOClient(ENDPOINT);

const Board = (props) => {
  console.log(props.match.params.id);
  return (
    <div className="main">
      <canvas className="whiteboard" />
    </div>
  );
};

export default Board;
