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
    db.get(dbQueries.getVehicleByID(req.params), function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Vehicle with id = ${req.params} not found.`);
      } else {
        res.json(endpointReponse.formVehicleResponse(row));
      }
    });
  });
});

app.get("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.getDriverByID(req.params), function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Driver with id = ${req.params} not found.`);
      } else {
        res.json(endpointReponse.formDriverResponse(row));
      }
    });
  });
});

app.get("/trips/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.getTripByID(req.params), function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        res.status(404).send(`Trip with id = ${req.params} not found.`);
      } else {
        res.json(endpointReponse.formTripResponse(row));
      }
    });
  });
});

app.get("/trips", (req, res, next) => {
  db.serialize(() => {
    try {
      var query = dbQueries.getTripsByFilteredData(req.query);
    } catch (err) {
      res.status(400).send(err.message);
    }
    db.get(query, function (err, row) {
      if (err) {
        next(err);
      } else if (!row) {
        var filters = Object.entries(req.query).map((filter) => filter[0] + " = " + filter[1]);
        res.status(404).send(`Trip with ${filters.join(" and ")} not found.`);
      } else {
        res.json(endpointReponse.formTripResponse(row));
      }
    });
  });
});

app.post("/vehicles", async (req, res, next) => {
  db.serialize(() => {
    db.run(dbQueries.insertVehicle(req.body), function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.getVehicleByMake(req.body), function (err, row) {
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
    db.run(dbQueries.insertDriver(req.body), function (err) {
      if (err) {
        next(err);
      } else {
        db.get(dbQueries.getDriverByDriverName(req.body), function (err, row) {
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
    db.run(dbQueries.insertTrip(req.body), function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        db.get(dbQueries.getTripByTripData(req.body), function (err, row) {
          if (err) {
            res.send("Error encountered while displaying");
          }
          res.json(endpointReponse.formTripResponse(row));
        });
      }
    });
  });
});

app.delete("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    db.get(dbQueries.deleteVehicleByID(req.params), function (err, row) {
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
    db.get(dbQueries.deleteDriverByID(req.params), function (err, row) {
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
    db.get(dbQueries.deleteTripByID(req.params), function (err, row) {
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
