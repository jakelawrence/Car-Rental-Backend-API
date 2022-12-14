const request = require("supertest");
const app = require("./routes");
const errorCodes = require("./helper_modules/errorCodes");

describe("VEHICLE UNIT TEST: Create, insert and delete a vehicle", function () {
  var vehicle = {
    make: "Honda",
    model: "Civic",
    licensePlate: "123ABC",
  };
  //create vehicle
  it(`POST /vehicles: Insert vehicle model ${vehicle.make} ${vehicle.model}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicle);
    expect(response.status).toEqual(200);
    expect(response.body.make).toEqual(vehicle.make);
    expect(response.body.model).toEqual(vehicle.model);
    expect(response.body.licensePlate).toEqual(vehicle.licensePlate);
    vehicle.id = response.body.id;
  });
  //test error handling
  it(`POST /vehicles: Try to insert duplicate vehicle with license plate #${vehicle.licensePlate}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicle);
    expect(response.status).toEqual(409);
    expect(response.error.text).toEqual(errorCodes.DUPLICATE_VEHICLE_CODE);
  });
  it(`POST /vehicles: Try to insert vehicle model but with invalid request body.`, async function () {
    const response = await request(app).post("/vehicles").send({ test: "error" });
    expect(response.status).toEqual(400);
    expect(response.error.text).toEqual(errorCodes.MALFORMED_REQUEST_CODE);
  });
  //get vehicle
  it(`GET /vehicles: Fetch vehicle ${vehicle.make} ${vehicle.model}`, async function () {
    const response = await request(app).get(`/vehicles/${vehicle.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(vehicle.id);
    expect(response.body.make).toEqual(vehicle.make);
    expect(response.body.model).toEqual(vehicle.model);
    expect(response.body.licensePlate).toEqual(vehicle.licensePlate);
  });
  //test error handling
  it(`GET /vehicles: Fetch vehicle that does not exist.`, async function () {
    const response = await request(app).get(`/vehicles/5`);
    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(errorCodes.VEHICLE_NOT_FOUND_CODE);
  });
  //delete vehicle
  it(`DELETE /vehicles: Delete vehicle ${vehicle.make} ${vehicle.model}`, async function () {
    const response = await request(app).delete(`/vehicles/${vehicle.id}`);
    expect(response.status).toEqual(200);
  });
});

describe("DRIVER UNIT TEST: Create, insert and delete a driver", function () {
  let driver = {
    firstName: "Jake",
    lastName: "Lawrence",
    email: "jakelawrence1@gmail.com",
  };
  //create driver
  it(`POST /drivers: Insert driver ${driver.firstName} ${driver.lastName}`, async function () {
    const response = await request(app).post("/drivers").send(driver);
    expect(response.status).toEqual(200);
    expect(response.body.firstName).toEqual(driver.firstName);
    expect(response.body.lastName).toEqual(driver.lastName);
    expect(response.body.email).toEqual(driver.email);
    driver.id = response.body.id;
  });
  //test error handling
  it(`POST /drivers: Try to insert duplicate driver model ${driver.firstName} ${driver.lastName}`, async function () {
    const response = await request(app).post("/drivers").send(driver);
    expect(response.status).toEqual(409);
    expect(response.error.text).toEqual(errorCodes.DUPLICATE_DRIVER_CODE);
  });
  it(`POST /drivers: Try to insert driver but with invalid request body.`, async function () {
    const response = await request(app).post("/drivers").send({ driverrrrr: "this is not a valid body" });
    expect(response.status).toEqual(400);
    expect(response.error.text).toEqual(errorCodes.MALFORMED_REQUEST_CODE);
  });
  //get driver
  it(`GET /drivers: Fetch driver ${driver.firstName} ${driver.lastName} `, async function () {
    const response = await request(app).get(`/drivers/${driver.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(driver.id);
    expect(response.body.firstName).toEqual(driver.firstName);
    expect(response.body.lastName).toEqual(driver.lastName);
    expect(response.body.email).toEqual(driver.email);
  });
  //test error handling
  it(`GET /drivers: Fetch driver that does not exist.`, async function () {
    const response = await request(app).get(`/drivers/5`);
    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(errorCodes.DRIVER_NOT_FOUND_CODE);
  });
  //delete driver
  it(`DELETE /drivers: Delete driver ${driver.firstName} ${driver.lastName}`, async function () {
    const response = await request(app).delete(`/drivers/${driver.id}`);
    expect(response.status).toEqual(200);
  });
});

describe("TRIP INTEGRATION TEST: Create, insert and delete a trip", function () {
  var vehicles = [
    {
      make: "Bugatti",
      model: "Veyron",
      licensePlate: "456DEF",
    },
    {
      make: "Rivian",
      model: "R1T",
      licensePlate: "789GHI",
    },
  ];
  var drivers = [
    {
      firstName: "Porter",
      lastName: "Robinson",
      email: "musicluv3r@gmail.com",
    },
    { firstName: "Kendrick", lastName: "Lamar", email: "rapG0d@gmail.com" },
  ];
  var trips = [
    {
      startedAt: "2023-02-24T14:43:18-08:00",
      expectedReturn: "2023-03-24T14:43:18-08:00",
    },
    {
      startedAt: "2023-02-24T14:43:18-08:00",
      expectedReturn: "2023-03-24T14:43:18-08:00",
    },
  ];
  var tripToTestActiveTripDetection = {
    startedAt: "2023-02-26T14:43:18-08:00",
    expectedReturn: "2023-03-26T14:43:18-08:00",
  };

  drivers.forEach((driver) => {
    //create driver
    it(`POST /drivers: Insert driver ${driver.firstName} ${driver.lastName}`, async function () {
      const response = await request(app).post("/drivers").send(driver);
      expect(response.status).toEqual(200);
      expect(response.body.firstName).toEqual(driver.firstName);
      expect(response.body.lastName).toEqual(driver.lastName);
      expect(response.body.email).toEqual(driver.email);
      driver.id = response.body.id;
    });
    //get driver
    it(`GET /drivers: Fetch driver ${driver.firstName} ${driver.lastName} `, async function () {
      const response = await request(app).get(`/drivers/${driver.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(driver.id);
      expect(response.body.firstName).toEqual(driver.firstName);
      expect(response.body.lastName).toEqual(driver.lastName);
      expect(response.body.email).toEqual(driver.email);
    });
  });

  vehicles.forEach((vehicle) => {
    //create vehicle
    it(`POST /vehicles: Insert vehicle model ${vehicle.make} ${vehicle.model}`, async function () {
      const response = await request(app).post("/vehicles").send(vehicle);
      expect(response.status).toEqual(200);
      expect(response.body.make).toEqual(vehicle.make);
      expect(response.body.model).toEqual(vehicle.model);
      expect(response.body.licensePlate).toEqual(vehicle.licensePlate);
      vehicle.id = response.body.id;
    });
    //get vehicle
    it(`GET /vehicles: Fetch vehicle ${vehicle.make} ${vehicle.model}`, async function () {
      const response = await request(app).get(`/vehicles/${vehicle.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(vehicle.id);
      expect(response.body.make).toEqual(vehicle.make);
      expect(response.body.model).toEqual(vehicle.model);
      expect(response.body.licensePlate).toEqual(vehicle.licensePlate);
    });
  });

  trips.forEach((trip, index) => {
    var driver = drivers[index];
    var vehicle = vehicles[index];
    //create trip
    it(`POST /trips: Insert trip with vehicle ${vehicle.make} ${vehicle.model} and driver ${driver.firstName} ${driver.lastName}`, async function () {
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
      expect(response.body.driver.firstName).toEqual(driver.firstName);
      expect(response.body.driver.lastName).toEqual(driver.lastName);
      expect(response.body.driver.email).toEqual(driver.email);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
      expect(response.body.vehicle.model).toEqual(vehicle.model);
      expect(response.body.vehicle.licensePlate).toEqual(vehicle.licensePlate);
      trip.id = response.body.id;
    });

    //get trip
    it(`GET /trips: Get trip with vehicle ${vehicle.make} and driver ${driver.firstName} ${driver.lastName}`, async function () {
      const response = await request(app).get(`/trips/${trip.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.startedAt).toEqual(trip.startedAt);
      expect(response.body.expectedReturn).toEqual(trip.expectedReturn);
      expect(response.body.driver.driverId).toEqual(driver.id);
      expect(response.body.driver.firstName).toEqual(driver.firstName);
      expect(response.body.driver.lastName).toEqual(driver.lastName);
      expect(response.body.driver.email).toEqual(driver.email);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
      expect(response.body.vehicle.model).toEqual(vehicle.model);
      expect(response.body.vehicle.licensePlate).toEqual(vehicle.licensePlate);
    });
  });

  //test active trip detection
  it(`POST /trips: Insert trip with vehicle ${vehicles[0].make} ${vehicles[0].model} to test active trips detection`, async function () {
    const response = await request(app).post("/trips").send({
      driverId: drivers[0].id,
      vehicleId: vehicles[0].id,
      startedAt: tripToTestActiveTripDetection.startedAt,
      expectedReturn: tripToTestActiveTripDetection.expectedReturn,
    });
    expect(response.status).toEqual(409);
    expect(response.error.text).toEqual(errorCodes.OVERLAP_INSERT_TRIP_CODE);
  });

  it(`GET /trips: Get active trips.`, async function () {
    const response = await request(app).get(`/trips?status=active`);
    expect(response.status).toEqual(200);
  });

  //update trips
  trips.forEach((trip, index) => {
    var driver = drivers[index];
    var vehicle = vehicles[index];
    //update trip
    it(`PUT /trips: Update trip with vehicle ${vehicle.make} ${vehicle.model} and driver ${driver.firstName} ${driver.lastName} to inactive.`, async function () {
      const response = await request(app).put(`/trips`).send({
        tripId: trip.id,
        status: "inactive",
      });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("inactive");
      expect(response.body.startedAt).toEqual(trip.startedAt);
      expect(response.body.expectedReturn).toEqual(trip.expectedReturn);
      expect(response.body.driver.driverId).toEqual(driver.id);
      expect(response.body.driver.firstName).toEqual(driver.firstName);
      expect(response.body.driver.lastName).toEqual(driver.lastName);
      expect(response.body.driver.email).toEqual(driver.email);
      expect(response.body.vehicle.vehicleId).toEqual(vehicle.id);
      expect(response.body.vehicle.make).toEqual(vehicle.make);
      expect(response.body.vehicle.model).toEqual(vehicle.model);
      expect(response.body.vehicle.licensePlate).toEqual(vehicle.licensePlate);
    });
  });

  it(`GET /trips: Get inactive tripss`, async function () {
    const response = await request(app).get(`/trips?status=inactive`);
    expect(response.status).toEqual(200);
  });

  it(`GET /trips: Fetch trip that does not exist.`, async function () {
    const response = await request(app).get(`/trips/5`);
    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(errorCodes.TRIP_NOT_FOUND_CODE);
  });

  trips.forEach((trip) => {
    //delete driver
    it(`DELETE /trips`, async function () {
      const response = await request(app).delete(`/trips/${trip.id}`);
      expect(response.status).toEqual(200);
    });
  });

  drivers.forEach((driver) => {
    //delete driver
    it(`DELETE /drivers`, async function () {
      const response = await request(app).delete(`/drivers/${driver.id}`);
      expect(response.status).toEqual(200);
    });
  });

  vehicles.forEach((vehicle) => {
    //delete driver
    it(`DELETE /vehicles`, async function () {
      const response = await request(app).delete(`/vehicles/${vehicle.id}`);
      expect(response.status).toEqual(200);
    });
  });
});
