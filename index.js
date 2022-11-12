const express = require("express");
const repo = require("./repository");
const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {});
app.get("/drivers/:id", (req, res, next) => {});
app.post("/vehicles", async (req, res, next) => {});
app.post("/drivers", (req, res, next) => {});

app.listen(3000, function () {});
