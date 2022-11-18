function formVehicleResponse(data) {
  let res = {
    vehicleId: data.vehicleId,
    make: data.make,
    model: data.model,
    licensePlate: data.licensePlate,
  };
  return res;
}

function formDriverResponse(data) {
  let res = {
    driverId: data.driverId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  };
  return res;
}

function formTripResponse(data) {
  let res = {
    tripId: data.tripId,
    status: data.status,
    startedAt: data.startedAt,
    expectedReturn: data.expectedReturn,
    driver: {
      driverId: data.driverId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    },
    vehicle: {
      vehicleId: data.vehicleId,
      make: data.make,
      model: data.model,
      licensePlate: data.licensePlate,
    },
  };
  return res;
}

module.exports = {
  formVehicleResponse,
  formDriverResponse,
  formTripResponse,
};
