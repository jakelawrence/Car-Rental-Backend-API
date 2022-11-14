const request = require("supertest");
const app = require("./routes");

describe("VEHICLE UNIT TEST: Create, insert and delete a vehicle", function () {
  var vehicle = {
    make: "Honda",
  };
  it(`POST /vehicles: Insert vehicle model ${vehicle.make}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicle);
    expect(response.status).toEqual(200);
    expect(response.body.make).toEqual(vehicle.make);
    vehicle.id = response.body.id;
  });
  it(`POST /vehicles: Try to insert duplicate vehicle model ${vehicle.make}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicle);
    expect(response.status).toEqual(500);
  });
  it(`POST /vehicles: Try to insert vehicle model but with invalid request body.`, async function () {
    const response = await request(app).post("/vehicles").send({ test: "error" });
    expect(response.status).toEqual(400);
    expect(response.text).toEqual("Malformed Request");
  });
  it(`GET /vehicles: Fetch vehicle ${vehicle.make}`, async function () {
    const response = await request(app).get(`/vehicles/${vehicle.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(vehicle.id);
    expect(response.body.make).toEqual(vehicle.make);
  });
  it(`DELETE /vehicles: Delete vehicle ${vehicle.make}`, async function () {
    const response = await request(app).delete(`/vehicles/${vehicle.id}`);
    expect(response.status).toEqual(204);
  });
});

describe("DRIVER UNIT TEST: Create, insert and delete a driver", function () {
  let driver = {
    driverName: "Jake Lawrence",
  };

  it(`POST /drivers: Insert driver ${driver.driverName}`, async function () {
    const response = await request(app).post("/drivers").send(driver);
    expect(response.status).toEqual(200);
    expect(response.body.driverName).toEqual(driver.driverName);
    driver.id = response.body.id;
  });
  it(`POST /drivers: Try to insert duplicate vehicle model ${driver.driverName}`, async function () {
    const response = await request(app).post("/drivers").send(driver);
    expect(response.status).toEqual(500);
  });
  it(`POST /drivers: Try to insert driver but with invalid request body.`, async function () {
    const response = await request(app).post("/drivers").send({ driverrrrr: "this is not a valid body" });
    expect(response.status).toEqual(400);
    expect(response.text).toEqual("Malformed Request");
  });
  it(`GET /drivers: Fetch driver ${driver.driverName}`, async function () {
    const response = await request(app).get(`/drivers/${driver.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(driver.id);
    expect(response.body.driverName).toEqual(driver.driverName);
  });
  it(`DELETE /drivers: Delete driver ${driver.driverName}`, async function () {
    const response = await request(app).delete(`/drivers/${driver.id}`);
    expect(response.status).toEqual(204);
  });
});
describe("TRIP INTEGRATION TEST: Create, insert and delete a trip", function () {
  var vehicles = [
    {
      make: "Bugatti",
    },
    {
      make: "Rivian",
    },
  ];
  var drivers = [
    {
      driverName: "Porter Robinson",
    },
    { driverName: "Kendrick Lamar" },
  ];
  var trips = [
    {
      startedAt: "2022-02-24T14:43:18-08:00",
      expectedReturn: "2022-03-24T14:43:18-08:00",
    },
    {
      startedAt: "2022-02-24T14:43:18-08:00",
      expectedReturn: "2022-03-24T14:43:18-08:00",
    },
  ];

  drivers.forEach((driver) => {
    //create driver
    it(`POST /drivers: Insert driver ${driver.driverName}`, async function () {
      const response = await request(app).post("/drivers").send({ driverName: driver.driverName });
      expect(response.status).toEqual(200);
      expect(response.body.driverName).toEqual(driver.driverName);
      driver.id = response.body.id;
    });
    //get driver
    it(`GET /drivers: Fetch driver ${driver.driverName}`, async function () {
      const response = await request(app).get(`/drivers/${driver.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(driver.id);
      expect(response.body.driverName).toEqual(driver.driverName);
    });
  });

  vehicles.forEach((vehicle) => {
    //create vehicle
    it(`POST /vehicles: Insert vehicle model ${vehicle.make}`, async function () {
      const response = await request(app).post("/vehicles").send({ make: vehicle.make });
      expect(response.status).toEqual(200);
      expect(response.body.make).toEqual(vehicle.make);
      vehicle.id = response.body.id;
    });
    //get vehicle
    it(`GET /vehicles: Fetch vehicle ${vehicle.make}`, async function () {
      const response = await request(app).get(`/vehicles/${vehicle.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(vehicle.id);
      expect(response.body.make).toEqual(vehicle.make);
    });
  });
  trips.forEach((trip, index) => {
    var driver = drivers[index];
    var vehicle = vehicles[index];
    //create trip
    it(`POST /trips: Insert trip with vehicle ${vehicle.make} and driver ${driver.driverName}`, async function () {
      const response = await request(app).post("/trips").send({
        driverId: driver.id,
        vehicleId: vehicle.id,
        startedAt: trip.startedAt,
        expectedReturn: trip.expectedReturn,
      });
      expect(response.status).toEqual(200);
      expect(response.body.startedAt).toEqual(trip.startedAt);
      expect(response.body.expectedReturn).toEqual(trip.expectedReturn);
      expect(response.body.driver.driverId).toEqual(driver.id);
      expect(response.body.driver.driverName).toEqual(driver.driverName);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
      trip.id = response.body.id;
    });

    //get trip
    it(`GET /trips: Get trip with vehicle ${vehicle.make} and driver ${driver.driverName}`, async function () {
      const response = await request(app).get(`/trips/${trip.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.startedAt).toEqual(trip.startedAt);
      expect(response.body.expectedReturn).toEqual(trip.expectedReturn);
      expect(response.body.driver.driverId).toEqual(driver.id);
      expect(response.body.driver.driverName).toEqual(driver.driverName);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
    });
  });
  it(`GET /trips: Get active trips.`, async function () {
    const response = await request(app).get(`/trips?status=active`);
    expect(response.status).toEqual(200);
  });
  trips.forEach((trip, index) => {
    var driver = drivers[index];
    var vehicle = vehicles[index];
    //update trip
    it(`PUT /trips: Update trip with vehicle ${vehicle.make} and driver ${driver.driverName} to inactive.`, async function () {
      const response = await request(app).put(`/trips`).send({
        tripId: trip.id,
        status: "inactive",
      });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("inactive");
      expect(response.body.startedAt).toEqual(trip.startedAt);
      expect(response.body.expectedReturn).toEqual(trip.expectedReturn);
      expect(response.body.driver.driverId).toEqual(driver.id);
      expect(response.body.driver.driverName).toEqual(driver.driverName);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
    });
  });
  it(`GET /trips: Get inactive trips.s`, async function () {
    const response = await request(app).get(`/trips?status=inactive`);
    expect(response.status).toEqual(200);
  });
  trips.forEach((trip) => {
    //delete driver
    it(`DELETE /trips`, async function () {
      const response = await request(app).delete(`/trips/${trip.id}`);
      expect(response.status).toEqual(204);
    });
  });
  drivers.forEach((driver) => {
    //delete driver
    it(`DELETE /drivers`, async function () {
      const response = await request(app).delete(`/drivers/${driver.id}`);
      expect(response.status).toEqual(204);
    });
  });
  vehicles.forEach((vehicle) => {
    //delete driver
    it(`DELETE /vehicles`, async function () {
      const response = await request(app).delete(`/vehicles/${vehicle.id}`);
      expect(response.status).toEqual(204);
    });
  });
});
