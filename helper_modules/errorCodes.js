const MALFORMED_REQUEST_CODE = "Malformed Request";
const OVERLAP_INSERT_TRIP_CODE = "Cannot create trip due to existing trip with this vehicle";
const OVERLAP_UPDATE_TRIP_CODE = "Cannot update trip due to existing trip with this vehicle";
const DUPLICATE_VEHICLE_CODE = "Vehicle with license plate already exists";
const DUPLICATE_DRIVER_CODE = "Driver with email already exists";
const VEHICLE_NOT_FOUND_CODE = "Vehicle not found.";
const DRIVER_NOT_FOUND_CODE = "Driver not found.";
const TRIP_NOT_FOUND_CODE = "Trip not found.";
const DUPLICATE_SQL_ERR_CODE = "SQLITE_CONSTRAINT";

module.exports = {
  MALFORMED_REQUEST_CODE,
  OVERLAP_INSERT_TRIP_CODE,
  OVERLAP_UPDATE_TRIP_CODE,
  DUPLICATE_VEHICLE_CODE,
  DUPLICATE_DRIVER_CODE,
  VEHICLE_NOT_FOUND_CODE,
  DRIVER_NOT_FOUND_CODE,
  TRIP_NOT_FOUND_CODE,
  DUPLICATE_SQL_ERR_CODE,
};
