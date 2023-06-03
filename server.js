require("dotenv").config({ path: "./config.env" });

const express = require("express");
const http = require("http");
const connectDB = require("./server-utils/dbConnect");

const app = express();
app.use(express.json());
const server = http.Server(app);

const cors = require("cors");
 
connectDB();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET, PUT, DELETE, POST, PATCH, HEAD, OPTIONS",
};

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Blog-site api");
});

app.use(cors(corsOptions));

app.use("/api/posts", require("./api/posts"));
app.use("/api/comments", require("./api/comments"));
app.use("/api/tags", require("./api/tags"));
app.use("/api/signup/", require("./api/signup"));
app.use("/api/auth", require("./api/auth"));

server.listen(process.env.PORT || 4900, (err) => {
  if (err) throw err;
  console.log(`Express server running on port ${process.env.PORT}`);
});
