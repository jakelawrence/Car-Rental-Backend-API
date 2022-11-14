const request = require("supertest");
const app = require("./routes");

describe("Create, insert and delete a vehicle", function () {
  var vehicleReqObject = {
    make: "Honda",
  };
  let vehicleResObject;
  it(`POST /vehicles: Insert vehicle model ${vehicleReqObject.make}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicleReqObject);
    expect(response.status).toEqual(200);
    expect(response.body.make).toEqual(vehicleReqObject.make);
    vehicleResObject = response.body;
  });
  it(`POST /vehicles: Try to insert duplicate vehicle model ${vehicleReqObject.make}`, async function () {
    const response = await request(app).post("/vehicles").send(vehicleReqObject);
    expect(response.status).toEqual(500);
  });
  it(`POST /vehicles: Try to insert vehicle model but with invalid request body.`, async function () {
    const response = await request(app).post("/vehicles").send({ test: "error" });
    expect(response.status).toEqual(400);
    expect(response.text).toEqual("Malformed Request");
  });
  it("GET /vehicles: Fetch vehicle Honda", async function () {
    const response = await request(app).get(`/vehicles/${vehicleResObject.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(vehicleResObject.id);
    expect(response.body.make).toEqual(vehicleResObject.make);
  });
  it("DELETE /vehicles", async function () {
    const response = await request(app).delete(`/vehicles/${vehicleResObject.id}`);
    expect(response.status).toEqual(204);
  });
});

describe("Create, insert and delete a driver", function () {
  let driverReqObject = {
    driverName: "Jake Lawrence",
  };
  let driverResObject;
  it("POST /drivers", async function () {
    const response = await request(app).post("/drivers").send(driverReqObject);
    expect(response.status).toEqual(200);
    expect(response.body.driverName).toEqual(driverReqObject.driverName);
    driverResObject = response.body;
  });
  it("GET /drivers", async function () {
    const response = await request(app).get(`/drivers/${driverResObject.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(driverResObject.id);
    expect(response.body.driverName).toEqual(driverResObject.driverName);
  });
  it("DELETE /drivers", async function () {
    const response = await request(app).delete(`/drivers/${driverResObject.id}`);
    expect(response.status).toEqual(204);
  });
});
describe("Create, insert and delete a trip", function () {
  var vehicles = [
    {
      make: "Honda",
    },
    {
      make: "Toyota",
    },
  ];
  var drivers = [
    {
      driverName: "Jake Lawrence",
    },
    { driverName: "Lisa Gulley" },
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
    it("POST /drivers", async function () {
      const response = await request(app).post("/drivers").send({ driverName: driver.driverName });
      expect(response.status).toEqual(200);
      expect(response.body.driverName).toEqual(driver.driverName);
      driver.id = response.body.id;
    });
    //get driver
    it("GET /drivers", async function () {
      const response = await request(app).get(`/drivers/${driver.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(driver.id);
      expect(response.body.driverName).toEqual(driver.driverName);
    });
  });

  vehicles.forEach((vehicle) => {
    //create vehicle
    it("POST /vehicles", async function () {
      const response = await request(app).post("/vehicles").send({ make: vehicle.make });
      expect(response.status).toEqual(200);
      expect(response.body.make).toEqual(vehicle.make);
      vehicle.id = response.body.id;
    });
    //get vehicle
    it("GET /vehicles", async function () {
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
    it("POST /trips", async function () {
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
    it("GET /trips", async function () {
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
  it("GET /trips", async function () {
    const response = await request(app).get(`/trips?status=active`);
    expect(response.status).toEqual(200);
  });
  trips.forEach((trip, index) => {
    var driver = drivers[index];
    var vehicle = vehicles[index];
    //update trip
    it("PUT /trips", async function () {
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
  it("GET /trips", async function () {
    const response = await request(app).get(`/trips?status=inactive`);
    expect(response.status).toEqual(200);
  });
  trips.forEach((trip) => {
    //delete driver
    it("DELETE /trip", async function () {
      const response = await request(app).delete(`/trips/${trip.id}`);
      expect(response.status).toEqual(204);
    });
  });
  drivers.forEach((driver) => {
    //delete driver
    it("DELETE /driver", async function () {
      const response = await request(app).delete(`/drivers/${driver.id}`);
      expect(response.status).toEqual(204);
    });
  });
  vehicles.forEach((vehicle) => {
    //delete driver
    it("DELETE /vehicle", async function () {
      const response = await request(app).delete(`/vehicles/${vehicle.id}`);
      expect(response.status).toEqual(204);
    });
  });
});
