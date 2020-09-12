import React, { useRef, useEffect } from "react";
import socketIOClient from "socket.io-client";
import "../styles/board.css";

const ENDPOINT = "http://localhost:4000/";

const Board = (props) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef(null);
  let drawing = false;
  const current = {
    color: "black",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const colors = colorsRef.current;

    const onColorUpdate = (e) => {
      current.color = e.target.className.split(" ")[1];
      console.log(current.color);
    };

    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener("click", onColorUpdate, false);
    }

    window.addEventListener("resize", onResize, false);
    onResize();

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    socketRef.current = socketIOClient(ENDPOINT);
    socketRef.current.on("drawing", onDrawingEvent);

    const context = canvasRef.current.getContext("2d");
    context.fillRect(0, 0, 100, 100);
    drawLine(20, 20, 20, 100, "black", true);
  }, []);

  const onDrawingEvent = (data) => {
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  };

  const onResize = () => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  };

  const drawLine = (x0, y0, x1, y1, color, emit) => {
    const context = canvasRef.current.getContext("2d");
    console.log("called" + context);
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    socketRef.current.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color,
    });
  };

  const onMouseDown = (e) => {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  };

  const onMouseMove = (e) => {
    if (!drawing) {
      return;
    }
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  };

  const onMouseUp = (e) => {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
  };

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

  console.log(props.match.params.id);
  return (
    <div className="main">
      <canvas ref={canvasRef} className="whiteboard" />
      <div ref={colorsRef} className="colors">
        <div className="color black" />
        <div className="color red" />
        <div className="color green" />
        <div className="color blue" />
        <div className="color yellow" />
      </div>
    </div>
  );
};

export default Board;
