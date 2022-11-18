function formVehicleResponse(data) {
  let res = {
    id: data.id,
    make: data.make,
    model: data.model,
  };
  return res;
}

function formDriverResponse(data) {
  let res = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  };
  return res;
}

function formTripResponse(data) {
  let res = {
    id: data.id,
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
    },
  };
  return res;
}

module.exports = {
  formVehicleResponse,
  formDriverResponse,
  formTripResponse,
};
