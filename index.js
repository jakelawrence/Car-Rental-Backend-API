const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var initDB = require("./database/init");
var dbQueries = require("./queries.json");
var db = new sqlite3.Database("./database/database.db");

initDB.initializeTablesInDatabase(db);

const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.vehiclesTable.getVehicleByID, [req.params.id], function (err, row) {
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
    db.get(dbQueries.driversTable.getDriverByID, [req.params.id], function (err, row) {
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
    db.get(dbQueries.tripsTable.getTripByID, [req.params.id], function (err, row) {
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
    });
  });
});

app.post("/vehicles", async (req, res, next) => {
  db.serialize(() => {
    db.run(dbQueries.vehiclesTable.insertVehicle, [req.body.make], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get(dbQueries.vehiclesTable.getVehicleByMake, [req.body.make], function (err, row) {
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
    db.run(dbQueries.driversTable.insertDriver, [req.body.driverName], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get(dbQueries.driversTable.getDriverByDriverName, [req.body.driverName], function (err, row) {
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
    db.run(dbQueries.tripsTable.insertTrip, [req.body.vehicleId, req.body.driverId, req.body.startedAt, req.body.expectedReturn], function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get(
          dbQueries.tripsTable.getTripByTripData,
          [req.body.vehicleId, req.body.status, req.body.driverId, req.body.startedAt, req.body.expectedReturn],
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
    });
  });
});

app.listen(3000, function () {});
