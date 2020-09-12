const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 4000;

// namespaces for diff auth levels
var teachers = io.of("/admin");
var students = io.of("/student");

const students = [];

students.on("connection", (socket) => {
  // when student joins inform teacher
  students.push({ socketID: socket.id, userID: socket.handshake.query["id"] });
  teachers.emit("update_students");

  socket.on("drawing", (data) => {
    teachers.emit("drawing", data);
  });

  socket.on("disconnect", () => {
    students.splice(
      students.findIndex((item) => item.socketID === socket.id),
      1
    );
    teachers.emit("update_students");
  });
});

teachers.on("connection", (socket) => {
  console.log("teacher connection");

  socket.on("update_students", (data) => {
    // implementing this as state in the frontend may erase previous student whiteboards uh
    teachers.emit("update_students", students);
  });

  socket.on("drawing", (data) => {
    students.emit("drawing", data);
  });
});

app.get("/", (req, res) => {
  res.send("server running");
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
