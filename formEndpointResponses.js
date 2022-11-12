function formVehicleResponse(data) {
  var res = {
    id: data.id,
    make: data.make,
  };
  return res;
}

function formDriverResponse(data) {
  var res = {
    id: data.id,
    driverName: data.driverName,
  };
  return res;
}

function formTripResponse(data) {
  var res = {
    id: data.id,
    status: data.status,
    startedAt: data.startedAt,
    expectedReturn: data.expectedReturn,
    driver: {
      driverId: data.driverId,
      driverName: data.driverName,
    },
    vehicle: {
      vehicleId: data.vehicleId,
      make: data.make,
    },
  };
  return res;
}

module.exports = {
  formVehicleResponse,
  formDriverResponse,
  formTripResponse,
};
