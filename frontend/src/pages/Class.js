import React, { useState } from "react";
import socketIOClient from "socket.io-client";
import Board from "./Board";

const ENDPOINT = "http://localhost:4000/";

const Class = (props) => {
  console.log(props.match.params.id); // compare this ID to local token to see if teacher
  const socket = socketIOClient(ENDPOINT);

  return (
    <>
      <Board id="1" socket={socket}></Board>
      <Board id="2" socket={socket}></Board>
    </>
  );
};

export default Class;
