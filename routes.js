const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var endpointReponse = require("./formEndpointResponses");
var dbQueries = require("./queries/queries");
var db = new sqlite3.Database("./database/database.db");

//init database tables (if not already created)
db.run(dbQueries.createVehicleTable());
db.run(dbQueries.createDriverTable());
db.run(dbQueries.createTripTable());

const app = express();
app.use(express.json());

//GET vehicle by id
app.get("/vehicles/:id", (req, res, next) => {
  db.serialize(() => {
    //query for vehicles with :id
    db.get(dbQueries.getVehicleByID(req.params), function (err, row) {
      if (err) {
        next(err);
      }
      //no vehicles with :id found
      else if (!row) {
        res.status(404).send(`Vehicle with id = ${req.params} not found.`);
      }
      //return vehicle to user
      else {
        res.json(endpointReponse.formVehicleResponse(row));
      }
    });
  });
});

//GET driver by id
app.get("/drivers/:id", (req, res, next) => {
  db.serialize(() => {
    //query for drivers with :id
    db.get(dbQueries.getDriverByID(req.params), function (err, row) {
      if (err) {
        next(err);
      }
      //no drivers with :id found
      else if (!row) {
        res.status(404).send(`Driver with id = ${req.params} not found.`);
      }
      //return driver to user
      else {
        res.json(endpointReponse.formDriverResponse(row));
      }
    });
  });
});

//GET trip by id
app.get("/trips/:id", (req, res, next) => {
  db.serialize(() => {
    //query for trips with :id
    db.get(dbQueries.getTripByID(req.params), function (err, row) {
      if (err) {
        next(err);
      }
      //no trips with :id found
      else if (!row) {
        res.status(404).send(`Trip with id = ${req.params} not found.`);
      }
      //return trip to user
      else {
        res.json(endpointReponse.formTripResponse(row));
      }
    });
  });
});

//GET trip by filtered data
app.get("/trips", (req, res, next) => {
  db.serialize(() => {
    //parse filters and create query for filtered data
    //if an invalid filter is passed, return error back to user
    try {
      var query = dbQueries.getTripsByFilteredData(req.query);
    } catch (err) {
      //Bad request
      res.status(400).send(err.message);
      return;
    }
    //query for trips using filter(s)
    db.all(query, function (err, rows) {
      if (err) {
        next(err);
      } else {
        var filteredTrips = [];
        rows.forEach((row) => {
          filteredTrips.push(endpointReponse.formTripResponse(row));
        });
        res.json(filteredTrips);
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
  db.get(dbQueries.getTripsByFilteredData({ status: "active", vehicleId: req.body.vehicleId }), function (err, row) {
    if (err) {
      res.status(500).send(err.message);
    }
    //if there is already an active trip assigned to vehicle
    else if (row) {
      var resJson = endpointReponse.formTripResponse(row);
      res.status(409).send("There already exists an active trip for " + resJson.vehicle.make);
    } else {
      db.serialize(() => {
        //create trip
        db.run(dbQueries.insertTrip(req.body), function (err) {
          if (err) {
            res.status(500).send(err.message);
          } else {
            //return trip to user
            db.get(dbQueries.getTripsByFilteredData(req.body), function (err, row) {
              if (err) {
                res.status(500).send(err.message);
              }
              res.json(endpointReponse.formTripResponse(row));
            });
          }
        });
      });
    }
  });
});

app.put("/trips", (req, res, next) => {
  //find if trip with given tripId exists
  db.get(dbQueries.getTripByID({ id: req.body.tripId }), function (err, row) {
    if (err) {
      res.status(500).send(err.message);
    }
    //trip with tripId does not exist
    else if (!row) {
      res.status(404).send(`Trip with id = ${req.body.tripId} not found.`);
    } else {
      console.log(dbQueries.updateTrip(req.body));
      db.run(dbQueries.updateTrip(req.body), function (err) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          db.get(dbQueries.getTripByID({ id: req.body.tripId }), function (err, row) {
            if (err) {
              res.status(500).send(err.message);
            }
            res.json(endpointReponse.formTripResponse(row));
          });
        }
      });
    }
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
