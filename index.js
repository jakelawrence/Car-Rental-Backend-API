var http = require("http");
const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database/database.db");

db.run("CREATE TABLE IF NOT EXISTS vehicle (id INTEGER PRIMARY KEY, make varchar(255) UNIQUE NOT NULL);");

const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get("SELECT id, make FROM vehicle WHERE make =?", [req.params.id], function (err, row) {
      if (err) {
        res.send("Error encountered while displaying");
        return console.error(err.message);
      }
      res.json({
        id: row.id,
        make: row.make,
      });
    });
  });
});
app.get("/drivers/:id", (req, res, next) => {});

app.post("/vehicles", async (req, res, next) => {
  db.serialize(() => {
    db.run("INSERT INTO vehicle (make) VALUES(?)", [req.body.make], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get("SELECT id, make FROM vehicle WHERE make =?", [req.body.make], function (err, row) {
          console.log(row);
          if (err) {
            res.send("Error encountered while displaying");
          }
          res.json({
            id: row.id,
            make: row.make,
          });
        });
      }
    });
  });
});

app.post("/drivers", (req, res, next) => {});

app.listen(3000, function () {});
