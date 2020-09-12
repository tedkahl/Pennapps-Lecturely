import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Grid from "@material-ui/core/Grid";
import io from "socket.io-client";
import Board from "./Board";

const ENDPOINT = "http://localhost:4000";

const Class = (props) => {
  const { user } = useAuth0();
  let socket;
  const userID = user.sub.split("|")[1];
  // compare this session ID to user token to see if teacher
  if (props.match.params.id === userID)
    socket = io.connect(ENDPOINT + "/admin");
  else socket = io.connect(ENDPOINT + "/student", { query: `id=${userID}` });

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
