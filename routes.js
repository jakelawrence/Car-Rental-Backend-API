const express = require("express");
var sqlite3 = require("sqlite3").verbose();
var endpointReponse = require("./formEndpointResponses");
var dbQueries = require("./queries/queries");
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
  var vehicle = await dbQueries.getVehicle(req.params.id, db);
  res.json(endpointReponse.formVehicleResponse(vehicle));
});

//GET driver by id
app.get("/drivers/:id", async (req, res, next) => {
  var driver = await dbQueries.getDriver(req.params.id, db);
  res.json(endpointReponse.formDriverResponse(driver));
});

//GET trip by id
app.get("/trips/:id", async (req, res, next) => {
  var trip = await dbQueries.getTrip(req.params.id, db);
  res.json(endpointReponse.formTripResponse(trip));
});

//GET trip by filtered data
app.get("/trips", async (req, res, next) => {
  var filteredTrips = [];
  var trips = await dbQueries.filterTrips(req.query, db);
  //for each trip returned
  trips.forEach((trip) => {
    filteredTrips.push(endpointReponse.formTripResponse(trip));
  });
  res.json(filteredTrips);
});

//insert vehicle
app.post("/vehicles", async (req, res, next) => {
  var vehicle = await dbQueries.insertVehicle(req.body, db);
  res.json(endpointReponse.formVehicleResponse(vehicle));
});

//insert driver
app.post("/drivers", async (req, res, next) => {
  var driver = await dbQueries.insertDriver(req.body, db);
  res.json(endpointReponse.formDriverResponse(driver));
});

//insert trip
app.post("/trips", async (req, res, next) => {
  //find active trips belonging to vehicle
  var activeTripsWithVehicle = await dbQueries.filterTrips({ status: "active", vehicleId: req.body.vehicleId }, db);
  //if there is already an active trip belonging to vehicle
  if (activeTripsWithVehicle.length > 0) {
    res.status(409).send("There already exists an active trip for this vehicle");
  } else {
    var trip = await dbQueries.insertTrip(req.body, db);
    res.json(endpointReponse.formTripResponse(trip));
  }
});

//update trip
app.put("/trips", async (req, res, next) => {
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
        res.status(409).send("There already exists an active trip for this vehicle.");
        return;
      }
    }
    //update trip with new fields
    await dbQueries.updateTrip(req.body, db);
    //get updated trip
    var updatedTrip = await dbQueries.getTrip(req.body.tripId, db);
    res.json(endpointReponse.formTripResponse(updatedTrip));
  }
});

//delete vehicle
app.delete("/vehicles/:id", async (req, res, next) => {
  var resMsg = await dbQueries.deleteVehicle(req.params, db);
  res.status(204).send(resMsg);
});

//delete driver
app.delete("/drivers/:id", async (req, res, next) => {
  var resMsg = await dbQueries.deleteDriver(req.params, db);
  res.status(204).send(resMsg);
});

//delete trip
app.delete("/trips/:id", async (req, res, next) => {
  var resMsg = await dbQueries.deleteTrip(req.params, db);
  res.status(204).send(resMsg);
});

//export for testing
module.exports = app;
