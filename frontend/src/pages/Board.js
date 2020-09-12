import React from "react";
import "../styles/board.css";

const Board = (props) => {
  console.log(props.match.params.id);
  return (
    <div className="main">

      <canvas className="whiteboard" />

    </div>
  );
};

export default Board;
