const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var initDB = require("./database/init");
var endpointReponse = require("./formEndpointResponses");
var dbQueries = require("./queries.json");
var db = new sqlite3.Database("./database/database.db");

initDB.initializeTablesInDatabase(db);

const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.vehiclesTable.getVehicleByID, [req.params.id], function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Vehicle with id = ${req.params.id} not found.`);
      } else {
        res.json(endpointReponse.formVehicleResponse(row));
      }
    });
  });
});

app.get("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.driversTable.getDriverByID, [req.params.id], function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Driver with id = ${req.params.id} not found.`);
      } else {
        res.json(endpointReponse.formDriverResponse(row));
      }
    });
  });
});

app.get("/trips/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.tripsTable.getTripByID, [req.params.id], function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Trip with id = ${req.params.id} not found.`);
      } else {
        res.json(endpointReponse.formTripResponse(row));
      }
    });
  });
});

app.post("/vehicles", async (req, res, next) => {
  db.serialize(() => {
    db.run(dbQueries.vehiclesTable.insertVehicle, [req.body.make], function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.vehiclesTable.getVehicleByMake, [req.body.make], function (err, row) {
          if (err) {
            res.send("Error encountered while displaying");
          }
          res.json(endpointReponse.formVehicleResponse(row));
        });
      }
    });
  });
});

app.post("/drivers", (req, res, next) => {
  db.serialize(() => {
    db.run(dbQueries.driversTable.insertDriver, [req.body.driverName], function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.driversTable.getDriverByDriverName, [req.body.driverName], function (err, row) {
          if (err) {
            res.send("Error encountered while displaying");
          }
          res.json(endpointReponse.formDriverResponse(row));
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
            res.json(endpointReponse.formTripResponse(row));
          }
        );
      }
    });
  });
});

app.delete("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.vehiclesTable.deleteVehicleByID, [req.params.id], function (err, row) {
      if (err) {
        next(err);
      } else {
        res.status(204).send();
      }
    });
  });
});

//export for testing
module.exports = app;
