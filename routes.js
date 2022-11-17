const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const formatResBody = require("./helper_modules/formatResponseJSON");
const checkForValidReqBody = require("./helper_modules/validateReqBody");
const dbQueries = require("./database/queries");
const db = new sqlite3.Database("./database/database.db");

//create vehicle table
db.run(`
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY, 
      make varchar(255) UNIQUE NOT NULL
    )
`);
//create driver table
db.run(`
    CREATE TABLE IF NOT EXISTS driver (
      id INTEGER PRIMARY KEY, 
      driverName varchar(255) UNIQUE NOT NULL
    )
`);
//create trip table
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
  //checks if vehicle id included in req
  if (req.params.id) {
    //get vehicle by id
    await dbQueries
      .getVehicle(req.params.id, db)
      .then((vehicle) => res.send(formatResBody.formVehicleResponse(vehicle)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//GET driver by id
app.get("/drivers/:id", async (req, res, next) => {
  //checks if driver id included in req
  if (req.params.id) {
    //get driver by id
    await dbQueries
      .getDriver(req.params.id, db)
      .then((driver) => res.json(formatResBody.formDriverResponse(driver)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//GET trip by id
app.get("/trips/:id", async (req, res, next) => {
  //checks if trip id included in req
  if (req.params.id) {
    //get trip by id
    await dbQueries
      .getTrip(req.params.id, db)
      .then((trip) => res.json(formatResBody.formTripResponse(trip)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//GET trip by filtered data
app.get("/trips", async (req, res, next) => {
  //get trips by filters
  await dbQueries
    .filterTrips(req.query, db)
    .then((trips) => {
      var filteredTrips = [];
      trips.forEach((trip) => {
        filteredTrips.push(formatResBody.formTripResponse(trip));
      });
      res.json(filteredTrips);
    })
    .catch(next);
});

//create vehicle
app.post("/vehicles", async (req, res, next) => {
  //check if req body for creating vehicle is valid
  if (checkForValidReqBody.forInsertVehicle(req.body)) {
    //insert vehicle into database
    await dbQueries
      .insertVehicle(req.body, db)
      .then((vehicle) => res.send(formatResBody.formVehicleResponse(vehicle)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//create driver
app.post("/drivers", async (req, res, next) => {
  //check if req body for creating driver is valid
  if (checkForValidReqBody.forInsertDriver(req.body)) {
    //insert driver into database
    await dbQueries
      .insertDriver(req.body, db)
      .then((driver) => res.send(formatResBody.formDriverResponse(driver)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//create trip
app.post("/trips", async (req, res, next) => {
  //check if req body for creating trip is valid
  if (checkForValidReqBody.forInsertTrip(req.body)) {
    //find active trips belonging to vehicle
    await dbQueries
      .filterTrips({ status: "active", vehicleId: req.body.vehicleId }, db)
      .then(async (activeTripsWithVehicle) => {
        //if there is already an active trip for vehicle
        if (activeTripsWithVehicle.length > 0) {
          next("There already exists an active trip for this vehicle");
        }
        //no active trips for vehicle
        else {
          //insert trip into database
          await dbQueries
            .insertTrip(req.body, db)
            .then((trip) => res.json(formatResBody.formTripResponse(trip)))
            .catch(next);
        }
      })
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//update trip
app.put("/trips", async (req, res, next) => {
  //check if req body for updating trip is valid
  if (checkForValidReqBody.forUpdateTrip(req.body)) {
    //find if trip with requested tripId
    await dbQueries
      .getTrip(req.body.tripId, db)
      .then(async (tripToBeUpdated) => {
        //if user is trying to update status to active
        if (req.params.status && req.params.status == "active") {
          //find active trips belonging to vehicle
          await dbQueries
            .filterTrips({ status: "active", vehicleId: req.body.vehicleId, notId: tripToBeUpdated.id }, db)
            .then((activeTripsWithVehicle) => {
              //if there is an active trip assigned to vehicle
              if (activeTripsWithVehicle.length > 0) {
                next("There already exists an active trip for this vehicle.");
              }
            })
            .catch(next);
        }
        //update trip with new fields
        await dbQueries.updateTrip(req.body, db);
        //fetch updated trip
        await dbQueries
          .getTrip(req.body.tripId, db)
          .then((updatedTrip) => res.json(formatResBody.formTripResponse(updatedTrip)))
          .catch(next);
      })
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//delete vehicle
app.delete("/vehicles/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteVehicle(req.params, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//delete driver
app.delete("/drivers/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteDriver(req.params, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//delete trip
app.delete("/trips/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteTrip(req.params, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//error handling
app.use((err, req, res, next) => {
  switch (err) {
    case "Malformed Request":
      res.status(400);
      break;
    case "There already exists an active trip for this vehicle":
      res.status(409);
      break;
    case "Vehicle not found.":
      res.status(404);
      break;
    case "Driver not found.":
      res.status(404);
      break;
    case "Trip not found.":
      res.status(404);
      break;
    default:
      res.status(500);
      break;
  }
  res.send(err);
});

//export for testing
module.exports = app;
