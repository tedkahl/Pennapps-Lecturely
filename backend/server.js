const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const router = express.Router();

const port = process.env.PORT || 4000;

const max_teacherid = 1000;

//does nothing really
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

/*new users submit a join request with session id. Join a room for that session id, distinguished
by teacher or student*/
io.on("connection", (socket) => {
  socket.on("join request", (data) => {
    let room = "" + data.sessionid;

    if (data.userid < max_teacherid) {
      socket.join(room + "-teacher");
    } else socket.join(room);

    console.log(socket.id, " joined ", sessionid);
  });
});

/*Send teacher draw data to students and student data to teachers. Draw data includes
sessionid and userid in addition to draw information*/
io.on("connection", (socket) => {
  socket.on("draw data", (data) => {
    let room = "" + data.sessionid;

    if (data.userid < max_teacherid) {
      io.to(room).emit("draw data", data);
    } else io.to(room + "-teacher").emit("draw data", data);
  });
});

router.get("/", (req, res) => {
  res.send("server running");
});

http.listen(port, () => {
  console.log(`listening on ${process.env.PORT}`);
});
