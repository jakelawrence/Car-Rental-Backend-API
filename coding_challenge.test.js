const request = require("supertest");
const app = require("./routes");

describe("Create, insert and delete a vehicle", function () {
  var vehicleReqObject = {
    make: "Honda",
  };
  let vehicleResObject;
  it("POST /vehicles", async function () {
    const response = await request(app).post("/vehicles").send(vehicleReqObject);
    expect(response.status).toEqual(200);
    expect(response.body.make).toEqual(vehicleReqObject.make);
    vehicleResObject = response.body;
  });
  it("GET /vehicles", async function () {
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
  let vehicleMake = "Honda";
  let vehicleId;

  let driverName = "Jake Lawrence";
  let driverId;

  let driverName2 = "Lisa Gulley";
  let driverId2;

  let startedAt = "2022-02-24T14:43:18-08:00";
  let expectedReturn = "2022-03-24T14:43:18-08:00";
  let tripId;

  it("POST /vehicles", async function () {
    const response = await request(app).post("/vehicles").send({ make: vehicleMake });

    expect(response.status).toEqual(200);
    expect(response.body.make).toEqual(vehicleMake);
    vehicleId = response.body.id;
  });
  it("GET /vehicles", async function () {
    const response = await request(app).get(`/vehicles/${vehicleId}`);

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(vehicleId);
    expect(response.body.make).toEqual(vehicleMake);
  });

  it("POST /drivers", async function () {
    const response = await request(app).post("/drivers").send({ driverName: driverName });

    expect(response.status).toEqual(200);
    expect(response.body.driverName).toEqual(driverName);
    driverId = response.body.id;
  });

  it("GET /drivers", async function () {
    const response = await request(app).get(`/drivers/${driverId}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(driverId);
    expect(response.body.driverName).toEqual(driverName);
  });

  it("POST /trips", async function () {
    const response = await request(app).post("/trips").send({
      driverId: driverId,
      vehicleId: vehicleId,
      startedAt: startedAt,
      expectedReturn: expectedReturn,
    });

    expect(response.status).toEqual(200);
    expect(response.body.startedAt).toEqual(startedAt);
    expect(response.body.expectedReturn).toEqual(expectedReturn);
    expect(response.body.driver.driverId).toEqual(driverId);
    expect(response.body.driver.driverName).toEqual(driverName);
    expect(response.body.vehicle.vehicleId).toEqual(vehicleId);
    expect(response.body.vehicle.make).toEqual(vehicleMake);
    tripId = response.body.id;
  });

  it("GET /trips", async function () {
    const response = await request(app).get(`/trips/${tripId}`);
    expect(response.status).toEqual(200);
    expect(response.body.startedAt).toEqual(startedAt);
    expect(response.body.expectedReturn).toEqual(expectedReturn);
    expect(response.body.driver.driverId).toEqual(driverId);
    expect(response.body.driver.driverName).toEqual(driverName);
    expect(response.body.vehicle.vehicleId).toEqual(vehicleId);
    expect(response.body.vehicle.make).toEqual(vehicleMake);
  });

  it("GET /trips?status=active", async function () {
    const response = await request(app).get(`/trips?status=active`);
    console.log(response.body);
    expect(response.status).toEqual(200);
    expect(response.body.startedAt).toEqual(startedAt);
    expect(response.body.expectedReturn).toEqual(expectedReturn);
    expect(response.body.driver.driverId).toEqual(driverId);
    expect(response.body.driver.driverName).toEqual(driverName);
    expect(response.body.vehicle.vehicleId).toEqual(vehicleId);
    expect(response.body.vehicle.make).toEqual(vehicleMake);
  });

  it("POST /drivers", async function () {
    const response = await request(app).post("/drivers").send({ driverName: driverName2 });

    expect(response.status).toEqual(200);
    expect(response.body.driverName).toEqual(driverName2);
    driverId2 = response.body.id;
  });

  it("GET /drivers", async function () {
    const response = await request(app).get(`/drivers/${driverId2}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(driverId2);
    expect(response.body.driverName).toEqual(driverName2);
  });

  it("POST /trips", async function () {
    const response = await request(app).post("/trips").send({
      driverId: driverId2,
      vehicleId: vehicleId,
      startedAt: startedAt,
      expectedReturn: expectedReturn,
    });

    expect(response.status).toEqual(409);
  });

  it("DELETE /trips", async function () {
    const response = await request(app).delete(`/trips/${tripId}`);
    expect(response.status).toEqual(204);
  });
  it("DELETE /vehicles", async function () {
    const response = await request(app).delete(`/vehicles/${vehicleId}`);
    expect(response.status).toEqual(204);
  });
  it("DELETE /drivers", async function () {
    const response = await request(app).delete(`/drivers/${driverId}`);
    expect(response.status).toEqual(204);
  });
  it("DELETE /drivers", async function () {
    const response = await request(app).delete(`/drivers/${driverId2}`);
    expect(response.status).toEqual(204);
  });
});
