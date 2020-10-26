const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const multer = require("multer");
const app = express();

//Middlewares
app.use(cors());

//Routers
const videosRoute = require("./routes/videos");
app.use("/videos", videosRoute);

const categoriesRoute = require('./routes/categories');
app.use('/categories', categoriesRoute)

const creatorsRoute = require('./routes/creators');
app.use('/creators', creatorsRoute)


//setup body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Serve static files
app.use(express.static("public"));
app.use(express.static("uploads"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port: " + listener.address().port);
});
