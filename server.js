const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("DEV-TOOL-KIT-A2A is running!"));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.listen(PORT, () => console.log("Server on port " + PORT));
