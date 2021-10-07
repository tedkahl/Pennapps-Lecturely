import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import "../styles/board.css";

class Board extends React.Component {
  state = {
    color: "black",
    drawing: false,
    previousCall: 0,
    threshold: 6,
  };
  canvasRef = React.createRef();

  componentDidMount() {
    console.log(this.props.name);
    this.setState(
      {
        w: this.canvasRef.current.width,
        h: this.canvasRef.current.height,
        context: this.canvasRef.current.getContext("2d"),
      },
      () => {
        let context = this.state.context;
        context.font = "12px arial";
        context.fillText(this.props.name, 0, 10);
      }
    );

    if (!this.props.noDraw) {
      this.canvasRef.current.addEventListener(
        "mousedown",
        this.onMouseDown,
        false
      );
      this.canvasRef.current.addEventListener("mouseup", this.onMouseUp, false);
      this.canvasRef.current.addEventListener(
        "mouseout",
        this.onMouseUp,
        false
      );
      this.canvasRef.current.addEventListener(
        "mousemove",
        this.onMouseMove,
        false
      );
      this.canvasRef.current.addEventListener(
        "touchstart",
        this.onMouseDown,
        false
      );
      this.canvasRef.current.addEventListener(
        "touchend",
        this.onMouseUp,
        false
      );
      this.canvasRef.current.addEventListener(
        "touchcancel",
        this.onMouseUp,
        false
      );
      this.canvasRef.current.addEventListener(
        "touchmove",
        this.onMouseMove,
        false
      );
    }
    this.props.socket.on("drawing", this.onDrawingEvent);
  }

  shouldComponentUpdate() {
    console.log("considering");
    return false;
  }

  drawLine = (x0, y0, x1, y1, color, emit) => {
    if (y0 < 12) return;
    if (y1 < 12) y1 = 12;
    this.state.context.beginPath();
    this.state.context.strokeStyle = color;
    this.state.context.moveTo(x0, y0);
    this.state.context.lineTo(x1, y1);
    this.state.context.lineWidth = 2;
    this.state.context.stroke();
    this.state.context.closePath();

    if (!emit) {
      return;
    }
    this.props.socket.emit("drawing", {
      id: this.props.id,
      sessionid: this.props.sessionid,
      x0: x0 / this.state.w,
      y0: y0 / this.state.h,
      x1: x1 / this.state.w,
      y1: y1 / this.state.h,
      color: this.state.color,
    });
  };

  onMouseDown = (e) => {
    const rect = this.canvasRef.current.getBoundingClientRect();

    this.setState({
      drawing: true,
      x: e.clientX - rect.x,
      y: e.clientY - rect.y,
    });
  };

  onMouseMove = (e) => {
    const time = new Date().getTime();
    if (time - this.state.previousCall < this.state.threshold) return;
    if (!this.state.drawing) {
      return;
    }
    const rect = this.canvasRef.current.getBoundingClientRect();

    this.drawLine(
      this.state.x,
      this.state.y,
      e.clientX - rect.x,
      e.clientY - rect.y,
      this.state.color,
      true
    );

    this.setState({
      x: e.clientX - rect.x,
      y: e.clientY - rect.y,
      previousCall: time,
    });
  };

  onMouseUp = (e) => {
    const rect = this.canvasRef.current.getBoundingClientRect();
    if (!this.state.drawing) {
      return;
    }
    this.setState({ drawing: false });
    this.drawLine(
      this.state.x,
      this.state.y,
      e.clientX - rect.x,
      e.clientY - rect.y,
      this.state.color,
      true
    );
  };

  onDrawingEvent = (data) => {
    console.log("receiving");
    if (data.id !== this.props.id && !data.isgroupdata) return;
    const w = this.state.w;
    const h = this.state.h;
    this.drawLine(
      data.x0 * w,
      data.y0 * h,
      data.x1 * w,
      data.y1 * h,
      data.color
    );
  };

  onResize() {
    this.canvasRef.current.width = window.innerWidth;
    this.canvasRef.current.height = window.innerHeight;
  }

  clearCanvas = () => {
    this.state.context.clearRect(
      0,
      12,
      this.canvasRef.current.width,
      this.canvasRef.current.height
    );
  };

  render() {
    return (
      <div>
        {this.props.styling !== "main" &&
        this.props.id != this.props.sessionid ? (
          <canvas
            ref={this.canvasRef}
            className={this.props.styling}
            width="250"
            height="250"
            position="relative"
          />
        ) : (
          <canvas
            ref={this.canvasRef}
            className={this.props.styling}
            height="500"
            width="500"
            position="relative"
          />
        )}

        {!this.props.noDraw && (
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
                  this.setState({ color: "black" });
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
                  this.setState({ color: "red" });
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
                  this.setState({ color: "green" });
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
                  this.setState({ color: "blue" });
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
                  this.setState({ color: "yellow" });
                }}
              >
                Yellow
              </Button>
            </ButtonGroup>
            <Button onClick={() => this.clearCanvas()}>Clear</Button>
            <Link to={`/`}>
              <Button>Done</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default Board;

/*
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

    // ---------------- mouse movement --------------------------------------

    // ----------- limit the number of events per second -----------------------

    // -----------------add event listeners to our canvas ----------------------

    // -------------- make the canvas fill its parent component -----------------

    //window.addEventListener("resize", onResize, false);
    //onResize();

    // ----------------------- socket.io connection ----------------------------
  }, []);

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
