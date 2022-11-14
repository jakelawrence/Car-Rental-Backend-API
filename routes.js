const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var formatResBody = require("./helper_modules/formatResponseJSON");
var checkForValidReqBody = require("./helper_modules/validateReqBody");
var dbQueries = require("./database/queries");
var db = new sqlite3.Database("./database/database.db");

//init database tables (if not already created)
db.run(`
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY, 
      make varchar(255) UNIQUE NOT NULL
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS driver (
      id INTEGER PRIMARY KEY, 
      driverName varchar(255) UNIQUE NOT NULL
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS trip (
      id INTEGER PRIMARY KEY, 
      status varchar(50) DEFAULT 'active', 
      vehicleId INTEGER, 
      driverId INTEGER, 
      startedAt DATETIME NOT NULL, 
      expectedReturn DATETIME NOT NULL, 
      FOREIGN KEY (vehicleId) REFERENCES vehicle(id), 
      FOREIGN KEY (driverId) REFERENCES driver(id)
    )
`);

const app = express();
app.use(express.json());

//GET vehicle by id
app.get("/vehicles/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.getVehicle(req.params.id, db).then(
      (vehicle) => {
        res.send(formatResBody.formVehicleResponse(vehicle));
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//GET driver by id
app.get("/drivers/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.getDriver(req.params.id, db).then(
      (driver) => {
        res.json(formatResBody.formDriverResponse(driver));
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//GET trip by id
app.get("/trips/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.getTrip(req.params.id, db).then(
      (trip) => {
        res.json(formatResBody.formTripResponse(trip));
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//GET trip by filtered data
app.get("/trips", async (req, res, next) => {
  await dbQueries.filterTrips(req.query, db).then(
    (trips) => {
      var filteredTrips = [];
      trips.forEach((trip) => {
        filteredTrips.push(formatResBody.formTripResponse(trip));
      });
      res.json(filteredTrips);
    },
    (err) => {
      next(err);
    }
  );
});

//insert vehicle
app.post("/vehicles", async (req, res, next) => {
  //check if req body is valid
  if (checkForValidReqBody.forInsertVehicle(req.body)) {
    //insert vehicle into database
    await dbQueries.insertVehicle(req.body, db).then(
      (vehicle) => {
        res.send(formatResBody.formVehicleResponse(vehicle));
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//insert driver
app.post("/drivers", async (req, res, next) => {
  if (checkForValidReqBody.forInsertDriver(req.body)) {
    await dbQueries.insertDriver(req.body, db).then(
      (driver) => {
        res.send(formatResBody.formDriverResponse(driver));
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//insert trip
app.post("/trips", async (req, res, next) => {
  if (checkForValidReqBody.forInsertTrip(req.body)) {
    //find active trips belonging to vehicle
    var activeTripsWithVehicle = await dbQueries.filterTrips({ status: "active", vehicleId: req.body.vehicleId }, db);
    //if there is already an active trip belonging to vehicle
    if (activeTripsWithVehicle.length > 0) {
      next("There already exists an active trip for this vehicle");
    } else {
      await dbQueries.insertTrip(req.body, db).then(
        (trip) => {
          res.json(formatResBody.formTripResponse(trip));
        },
        (err) => {
          next(err);
        }
      );
    }
  } else {
    next("Malformed Request");
  }
});

//update trip
app.put("/trips", async (req, res, next) => {
  if (checkForValidReqBody.forUpdateTrip(req.body)) {
    //find if trip with requested tripId
    var tripToBeUpdated = await dbQueries.getTrip(req.body.tripId, db);
    //if trip with tripId exists
    if (tripToBeUpdated) {
      //if status field is requesting to change to 'active'
      if (req.params.status && req.params.status == "active") {
        //find active trips belonging to vehicle
        var activeTripsWithVehicle = await dbQueries.filterTrips({ status: "active", vehicleId: req.body.vehicleId, notId: req.body.tripId }, db);
        //if there is already an active trip belonging to vehicle
        if (activeTripsWithVehicle.length > 0) {
          next("There already exists an active trip for this vehicle.");
        }
      }
      //update trip with new fields
      await dbQueries.updateTrip(req.body, db);
      //get updated trip
      await dbQueries.getTrip(req.body.tripId, db).then(
        (updatedTrip) => {
          res.json(formatResBody.formTripResponse(updatedTrip));
        },
        (err) => {
          next(err);
        }
      );
    }
  } else {
    next("Malformed Request");
  }
});

//delete vehicle
app.delete("/vehicles/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.deleteVehicle(req.params, db).then(
      (resMsg) => {
        res.status(204).send(resMsg);
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//delete driver
app.delete("/drivers/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.deleteDriver(req.params, db).then(
      (resMsg) => {
        res.status(204).send(resMsg);
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

//delete trip
app.delete("/trips/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries.deleteTrip(req.params, db).then(
      (resMsg) => {
        res.status(204).send(resMsg);
      },
      (err) => {
        next(err);
      }
    );
  } else {
    next("Malformed Request");
  }
});

app.use((err, req, res, next) => {
  switch (err) {
    case "Malformed Request":
      res.status(400);
      break;
    case "There already exists an active trip for this vehicle":
      res.status(409);
      break;
    default:
      res.status(500);
      break;
  }
  res.send(err);
});

//export for testing
module.exports = app;
