const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const formatResBody = require("./helper_modules/formatResBody");
const checkForValidReqBody = require("./helper_modules/checkForValidReqBody");
const errorCodes = require("./helper_modules/errorCodes");
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

/*
GET vehicle by id
Steps:
  1. Check if vehicle id is passed into endpoint through req body
  2. Get vehicle from database (throw error if does not exist)
  3. Format data for res body
  4. Return res body
*/
app.get("/vehicles/:id", async (req, res, next) => {
  //checks if vehicle id included in req
  if (req.params.id) {
    //get vehicle by id
    await dbQueries
      .getVehicle(req.params.id, db)
      .then((vehicle) => res.send(formatResBody.formVehicleResponse(vehicle)))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
GET driver by id
Steps:
  1. Check if driver id is passed into endpoint through req body
  2. Get driver from database (throw error if does not exist)
  3. Format data for res body
  4. Return res body
*/
app.get("/drivers/:id", async (req, res, next) => {
  //checks if driver id included in req
  if (req.params.id) {
    //get driver by id
    await dbQueries
      .getDriver(req.params.id, db)
      .then((driver) => res.json(formatResBody.formDriverResponse(driver)))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
GET trip by id
Steps:
  1. Check if trip id is passed into endpoint through req body
  2. Get trip from database (throw error if does not exist)
  3. Format data for res body
  4. Return res body
*/
app.get("/trips/:id", async (req, res, next) => {
  //checks if trip id included in req
  if (req.params.id) {
    //get trip by id
    await dbQueries
      .getTrip(req.params.id, db)
      .then((trip) => res.json(formatResBody.formTripResponse(trip)))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
GET trip by filtered data
Steps:
  1. Pass filters into filtered data and parse filters for query
  2. Get trips based on filtered data
  3. Format trips for res body
  4. Return res body
*/
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

/*
POST vehicle into database
Steps:
  1. Check if req body has required fields for creating vehicle
  2. Insert vehicle into database
  3. Query database for inserted vehicle by license plate (unique to vehicle)
  4. Format the vehicle data for res body
  5. Return res body
*/
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
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
POST driver into database
Steps:
  1. Check if req body has required fields for creating driver
  2. Insert driver into database
  3. Query database for inserted driver based on email (unique to driver)
  4. Format the driver data for res body
  5. Return res body
*/
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
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
POST trip into database
Steps:
  1. Check if req body has required fields for creating trip
  2. Check if trip to be inserted isn't within date range or active during other trips with vehicle
  3. Insert trip into database
  3. Query database for inserted trip based on date range, driver and vehicle (unique to trip)
  4. Format the trip data for res body
  5. Return res body
*/
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
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
PUT trip in database
Steps:
  1. Check if req body has required fields for updating trip
  2. Check if trip to be updated isn't within date range or active during other trips with vehicle
  3. Update trip in database
  3. Query database for updated trip based on date range, driver and vehicle (unique to trip)
  4. Format the trip data for res body
  5. Return res body
*/
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
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
DELETE vehicle in database
Steps:
  1. Check if vehicle id is passed into endpoint through req body
  2. Delete vehicle
  3. Return confirmation message of deletion
*/
app.delete("/vehicles/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteVehicleById(req.params.id, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
DELETE driver in database
Steps:
  1. Check if driver id is passed into endpoint through req body
  2. Delete driver
  3. Return confirmation message of deletion
*/
app.delete("/drivers/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteDriverById(req.params.id, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

/*
DELETE trip in database
Steps:
  1. Check if trip id is passed into endpoint through req body
  2. Delete trip
  3. Return confirmation message of deletion
*/
app.delete("/trips/:id", async (req, res, next) => {
  //checks if id included in req
  if (req.params.id) {
    await dbQueries
      .deleteTripById(req.params.id, db)
      .then((resMsg) => res.status(204).send(resMsg))
      .catch(next);
  } else {
    next(errorCodes.MALFORMED_REQUEST_CODE);
  }
});

//error handling
app.use((err, req, res, next) => {
  switch (err) {
    case errorCodes.MALFORMED_REQUEST_CODE:
      res.status(400);
      break;
    case errorCodes.OVERLAP_INSERT_TRIP_CODE:
      res.status(409);
      break;
    case errorCodes.OVERLAP_UPDATE_TRIP_CODE:
      res.status(409);
      break;
    case errorCodes.DUPLICATE_VEHICLE_CODE:
      res.status(409);
      break;
    case errorCodes.DUPLICATE_DRIVER_CODE:
      res.status(409);
      break;
    case errorCodes.VEHICLE_NOT_FOUND_CODE:
      res.status(404);
      break;
    case errorCodes.DRIVER_NOT_FOUND_CODE:
      res.status(404);
      break;
    case errorCodes.TRIP_NOT_FOUND_CODE:
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
