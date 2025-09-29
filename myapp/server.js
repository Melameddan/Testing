const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello Coolify!");
});

// Coolify gives a port in process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`App running on port ${port}`);
});
