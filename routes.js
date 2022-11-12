const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var endpointReponse = require("./formEndpointResponses");
var dbQueries = require("./queries/queries");
var db = new sqlite3.Database("./database/database.db");

db.run(dbQueries.createVehicleTable());
db.run(dbQueries.createDriverTable());
db.run(dbQueries.createTripTable());

const app = express();
app.use(express.json());

app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.getVehicleByID(req.params.id), function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        console.log(row);
        res.status(404).send(`Vehicle with id = ${req.params.id} not found.`);
      } else {
        res.json(endpointReponse.formVehicleResponse(row));
      }
    });
  });
});

app.get("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.getDriverByID(req.params.id), function (err, row) {
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
    db.get(dbQueries.getTripByID(req.params.id), function (err, row) {
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
    db.run(dbQueries.insertVehicle(req.body.make), function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.getVehicleByMake(req.body.make), function (err, row) {
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
    db.run(dbQueries.insertDriver(req.body.driverName), function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.getDriverByDriverName(req.body.driverName), function (err, row) {
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
    db.run(dbQueries.tripsTable.insertTrip(req.body.vehicleId, req.body.driverId, req.body.startedAt, req.body.expectedReturn), function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get(
          dbQueries.getTripByTripData(req.body.vehicleId, req.body.status, req.body.driverId, req.body.startedAt, req.body.expectedReturn),
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
    db.get(dbQueries.deleteVehicleByID(req.params.id), function (err, row) {
      if (err) {
        next(err);
      } else {
        res.status(204).send();
      }
    });
  });
});

app.delete("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.deleteDriverByID(req.params.id), function (err, row) {
      if (err) {
        next(err);
      } else {
        res.status(204).send();
      }
    });
  });
});

app.delete("/trips/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.deleteTripByID(req.params.id), function (err, row) {
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
