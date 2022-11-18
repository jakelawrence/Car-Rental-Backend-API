const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const formatResBody = require("./helper_modules/formatResponseJSON");
const checkForValidReqBody = require("./helper_modules/validateReqBody");
const dbQueries = require("./database/queries");
const db = new sqlite3.Database("./database/database.db");

//create vehicle table
db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY, 
      make varchar(50) NOT NULL,
      model varchar(50) NOT NULL,
      licensePlate varchar(50) UNIQUE NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_licensePlate ON vehicle (licensePlate);
`);
//create driver table
db.exec(`
    CREATE TABLE IF NOT EXISTS driver (
      id INTEGER PRIMARY KEY, 
      firstName varchar(50) NOT NULL,
      lastName varchar(50) NOT NULL,
      email varchar(50) UNIQUE NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON driver (email);
`);
//create trip table
db.exec(`
    CREATE TABLE IF NOT EXISTS trip (
      id INTEGER PRIMARY KEY, 
      status varchar(50), 
      vehicleId INTEGER, 
      driverId INTEGER, 
      startedAt DATETIME NOT NULL, 
      expectedReturn DATETIME NOT NULL,
      FOREIGN KEY (vehicleId) REFERENCES vehicle(id),
      FOREIGN KEY (driverId) REFERENCES driver(id)
    );
    CREATE INDEX IF NOT EXISTS idx_startedAt ON trip (startedAt);
    CREATE INDEX IF NOT EXISTS idx_expectedReturn ON trip (expectedReturn);
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
      .then(async () => await dbQueries.getVehicleByLicensePlate(req.body.licensePlate, db))
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
      .then(async () => await dbQueries.getDriverByEmail(req.body.email, db))
      .then((driver) => res.send(formatResBody.formDriverResponse(driver)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//create trip
app.post("/trips", async (req, res, next) => {
  let tripToInsert = req.body;
  //check if req body for creating trip is valid
  if (checkForValidReqBody.forInsertTrip(tripToInsert)) {
    await dbQueries
      .isValidTripToInsert(tripToInsert, db)
      .then(async () => await dbQueries.insertTrip(req.body, db))
      .then(async () => await dbQueries.getTripByDateRangeVehicleAndDriver(req.body, db))
      .then((trip) => res.json(formatResBody.formTripResponse(trip)))
      .catch(next);
  } else {
    next("Malformed Request");
  }
});

//update trip
app.put("/trips", async (req, res, next) => {
  let tripToBeUpdated = req.body;
  //check if req body for updating trip is valid
  if (checkForValidReqBody.forUpdateTrip(tripToBeUpdated)) {
    await dbQueries
      .getTrip(tripToBeUpdated.tripId, db)
      .then(async () => await dbQueries.isValidTripToUpdated(tripToBeUpdated, db))
      .then(async () => await dbQueries.updateTrip(tripToBeUpdated, db))
      .then(async () => await dbQueries.getTrip(tripToBeUpdated.tripId, db))
      .then((trip) => res.json(formatResBody.formTripResponse(trip)))
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
      .deleteVehicleById(req.params.id, db)
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
      .deleteDriverById(req.params.id, db)
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
      .deleteTripById(req.params.id, db)
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
    case "Cannot create trip due to existing trip with this vehicle":
      res.status(409);
      break;
    case "Cannot update trip due to existing trip with this vehicle":
      res.status(409);
      break;
    case "Vehicle with license plate already exists":
      res.status(409);
      break;
    case "Driver with email already exists":
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
