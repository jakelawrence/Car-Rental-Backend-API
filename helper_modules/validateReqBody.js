function forInsertVehicle(reqBody) {
  if (reqBody && reqBody.make && reqBody.model) {
    return true;
  } else {
    return false;
  }
}
function forInsertDriver(reqBody) {
  if (reqBody && reqBody.firstName && reqBody.lastName && reqBody.email) {
    return true;
  } else {
    return false;
  }
}
function forInsertTrip(reqBody) {
  if (reqBody && reqBody.driverId && reqBody.vehicleId && reqBody.startedAt && reqBody.expectedReturn) {
    return true;
  } else {
    return false;
  }
}
function forUpdateTrip(reqBody) {
  if (reqBody && reqBody.tripId) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  forInsertVehicle,
  forInsertDriver,
  forInsertTrip,
  forUpdateTrip,
};
