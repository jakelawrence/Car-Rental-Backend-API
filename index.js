var http = require("http");
const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database/database.db");

db.run(`
    CREATE TABLE IF NOT EXISTS vehicle (
        id INTEGER PRIMARY KEY, 
        make varchar(255) UNIQUE NOT NULL
    );`);
db.run(`
    CREATE TABLE IF NOT EXISTS driver (
        id INTEGER PRIMARY KEY, 
        driverName varchar(255) UNIQUE NOT NULL
    );`);
db.run(`
    CREATE TABLE IF NOT EXISTS trip (
        id INTEGER PRIMARY KEY, 
        vehicleId INTEGER,
        driverId INTEGER,
        startedAt DATETIME NOT NULL,
        expectedReturn DATETIME NOT NULL,
        FOREIGN KEY (vehicleId) REFERENCES vehicle(id), 
        FOREIGN KEY (driverId) REFERENCES driver(id)
    );`);

const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get("SELECT id, make FROM vehicle WHERE id =?", [req.params.id], function (err, row) {
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

app.get("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    db.get("SELECT id, driverName FROM driver WHERE id =?", [req.params.id], function (err, row) {
      if (err) {
        res.send("Error encountered while displaying");
        return console.error(err.message);
      }
      res.json({
        id: row.id,
        driverName: row.driverName,
      });
    });
  });
});

app.get("/trips/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(
      `SELECT t.id, CASE WHEN current_timestamp BETWEEN t.startedAt and t.expectedReturn THEN "active" ELSE "inactive" END as status, 
       t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
        FROM trip t
        JOIN driver d on d.id = t.driverId
        JOIN vehicle v on v.id = t.vehicleId
        WHERE t.id=?`,
      [req.params.id],
      function (err, row) {
        if (err) {
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        res.json({
          id: row.id,
          status: row.status,
          startedAt: row.startedAt,
          expectedReturn: row.expectedReturn,
          driver: {
            driverId: row.driverId,
            driverName: row.driverName,
          },
          vehicle: {
            vehicleId: row.vehicleId,
            make: row.make,
          },
        });
      }
    );
  });
});

app.post("/vehicles", async (req, res, next) => {
  db.serialize(() => {
    db.run("INSERT INTO vehicle (make) VALUES(?)", [req.body.make], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get("SELECT id, make FROM vehicle WHERE make =?", [req.body.make], function (err, row) {
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

app.post("/drivers", (req, res, next) => {
  db.serialize(() => {
    db.run("INSERT INTO driver (driverName) VALUES(?)", [req.body.driverName], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get("SELECT id, driverName FROM driver WHERE driverName =?", [req.body.driverName], function (err, row) {
          if (err) {
            res.send("Error encountered while displaying");
          }
          res.json({
            id: row.id,
            driverName: row.driverName,
          });
        });
      }
    });
  });
});

app.post("/trips", (req, res, next) => {
  db.serialize(() => {
    db.run(
      "INSERT INTO trip (vehicleId, driverId, startedAt, expectedReturn) VALUES(?,?,?,?)",
      [req.body.vehicleId, req.body.driverId, req.body.startedAt, req.body.expectedReturn],
      function (err) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          db.get(
            `SELECT t.id, CASE WHEN current_timestamp BETWEEN t.startedAt and t.expectedReturn THEN "active" ELSE "inactive" END as status, 
                t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
            FROM trip t
            JOIN driver d on d.id = t.driverId
            JOIN vehicle v on v.id = t.vehicleId
            WHERE t.vehicleId =? and t.driverId =? and t.startedAt =? and t.expectedReturn =?`,
            [req.body.vehicleId, req.body.driverId, req.body.startedAt, req.body.expectedReturn],
            function (err, row) {
              if (err) {
                res.send("Error encountered while displaying");
              }
              res.json({
                id: row.id,
                status: row.status,
                startedAt: row.startedAt,
                expectedReturn: row.expectedReturn,
                driver: {
                  driverId: row.driverId,
                  driverName: row.driverName,
                },
                vehicle: {
                  vehicleId: row.vehicleId,
                  make: row.make,
                },
              });
            }
          );
        }
      }
    );
  });
});

app.listen(3000, function () {});
