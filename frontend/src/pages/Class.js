import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import io from "socket.io-client";
import Board from "./Board";

const ENDPOINT = "http://localhost:4000/";

const Class = (props) => {
  console.log(props.match.params.id); // compare this ID to local token to see if teacher
  const socket = io.connect(ENDPOINT, { query: "id=userID" });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={9}>
        <Board id="1" socket={socket}></Board>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Board id="2" socket={socket}></Board>
      </Grid>
    </Grid>
  );
};

export default Class;
