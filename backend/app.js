const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 4000;

// namespaces for diff auth levels
var teachers = io.of("/admin");
var students = io.of("/student");

students.on("connection", (socket) => {
  socket.on("drawing", (data) => {
    teachers.emit("drawing", data);
  });
});

teachers.on("connection", (socket) => {
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
