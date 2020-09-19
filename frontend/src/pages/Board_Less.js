import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import "../styles/board.css";

const ColorSelect = (props) => {};

const Board = (props) => {
  const canvasRef = useRef(null);
  let current = { color: "black" };

  //let [transcript, setTranscipt] = useState("");
  const setColor = (color) => {
    current.color = color;
  };
  useEffect(() => {
    // --------------- getContext() method returns a drawing context on the canvas-----

    const canvas = canvasRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const context = canvas.getContext("2d");
    let drawing = false;

    // ------------------------------- create the drawline ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      console.log(color);
      context.beginPath();
      context.strokeStyle = color;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      //context.moveTo(x0 - offset.x, y0 - offset.y);
      //context.lineTo(x1 - offset.x, y1 - offset.y);
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      //console.log(x0 - offset.x + " -> 1");
      //console.log(y0 - offset.y);
      //console.log(x1 - offset.x + " " + y1 - offset.y);

      if (!emit) {
        return;
      }

      props.socket.emit("drawing", {
        id: props.id,
        sessionid: props.sessionid,
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: current.color,
      });
    };

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      drawing = true;
      current.x = e.clientX - rect.x;
      current.y = e.clientY - rect.y;
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX - rect.x,
        e.clientY - rect.y,
        current.color,
        true
      );
      current.x = e.clientX - rect.x;
      current.y = e.clientY - rect.y;
    };

    const onMouseUp = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!drawing) {
        return;
      }
      drawing = false;
      setColor("green");
      drawLine(
        current.x,
        current.y,
        e.clientX - rect.x,
        e.clientY - rect.y,
        current.color,
        true
      );
    };

    // ----------- limit the number of events per second -----------------------

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    // -----------------add event listeners to our canvas ----------------------

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    //window.addEventListener("resize", onResize, false);
    //onResize();

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      if (data.id !== props.id && !data.isgroupdata) return;
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    props.socket.on("drawing", onDrawingEvent);
  }, []);

  const onResize = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = async () => {
    console.log("Smiley");
    //setTranscipt("Smiley");
    // var canvas = document.getElementById("canvas");
    // var dataURL = canvas.toDataURL();
    // console.log(dataURL);
    // try {
    //   const [result] = await client.documentTextDetection("./sample.png");
    //   const fullTextAnnotation = result.fullTextAnnotation;
    //   console.log(`Full text: ${fullTextAnnotation.text}`);
    // } catch (e) {
    //   console.log("Error: " + e);
    // }
  };

  // ------------- The Canvas and color elements --------------------------

  return (
    <div>
      {props.styling !== "main" ? (
        <canvas
          ref={canvasRef}
          className={props.styling}
          width="300"
          height="200"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className={props.styling}
          width="1000"
          height="700"
        />
      )}

      {!props.noColor && (
        <div className="colors">
          <ButtonGroup
            id="colors"
            color="primary"
            aria-label="contained button group"
          >
            <Button
              style={{
                backgroundColor: "#000",
                color: "white",
              }}
              onClick={() => {
                setColor("black");
              }}
            >
              Black
            </Button>
            <Button
              style={{
                backgroundColor: "#eb1710",
                color: "white",
              }}
              onClick={() => {
                setColor("red");
              }}
            >
              Red
            </Button>
            <Button
              style={{
                backgroundColor: "#158a15",
                color: "white",
              }}
              onClick={() => {
                setColor("green");
              }}
            >
              Green
            </Button>
            <Button
              style={{
                backgroundColor: "#1029e6",
                color: "white",
              }}
              onClick={() => {
                setColor("yellow");
              }}
            >
              Blue
            </Button>
            <Button
              style={{
                backgroundColor: "orange",
                color: "white",
              }}
              onClick={() => {
                setColor("yellow");
              }}
            >
              Yellow
            </Button>
          </ButtonGroup>
          <Button onClick={() => clearCanvas()}>Clear</Button>
          <Link to={`/`}>
            <Button>Done</Button>
          </Link>
        </div>
      )}
      <p>{props.id + " " + props.sessionid}</p>
    </div>
  );
};

export default Board;
/*<Button onClick={() => downloadImage()}>Get Transcript</Button>
          {transcript.length > 1 && (
            <div>
              <h3>Transcript:</h3>
              <p>{transcript}</p>
            </div>
          )}
*/
