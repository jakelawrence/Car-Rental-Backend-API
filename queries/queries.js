//vehicle queries
function createVehicleTable() {
  return `
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY, 
      make varchar(255) UNIQUE NOT NULL
    )
  `;
}

function getVehicleByID(id) {
  return `SELECT id, make FROM vehicle WHERE id =${id}`;
}

function insertVehicle(make) {
  return `INSERT INTO vehicle (make) VALUES('${make}')`;
}

function getVehicleByMake(make) {
  return `SELECT id, make FROM vehicle WHERE make ='${make}'`;
}

function deleteVehicleByID(id) {
  return `DELETE from vehicle where id =${id}`;
}

//driver queries
function createDriverTable() {
  return `
    CREATE TABLE IF NOT EXISTS driver (
      id INTEGER PRIMARY KEY, 
      make varchar(255) UNIQUE NOT NULL
    )
  `;
}

function getDriverByID(id) {
  return `SELECT id, make FROM driver WHERE id =${id}`;
}

function insertDriver(driverName) {
  return `INSERT INTO driver (driverName) VALUES('${driverName}')`;
}

function getDriverByDriverName(driverName) {
  return `SELECT id, driverName FROM driver WHERE driverName ='${driverName}'`;
}

function deleteDriverByID(id) {
  return `DELETE from driver where id =${id}`;
}

function createTripTable() {
  return `
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
  `;
}
function getTripByID(id) {
  return `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId 
    WHERE t.id=${id}
  `;
}
function insertTrip(vehicleId, driverId, startedAt, expectedReturn) {
  return `
    INSERT INTO trip (vehicleId, driverId, startedAt, expectedReturn) 
    VALUES('${vehicleId}','${driverId}','${startedAt}','${expectedReturn}')
  `;
}
function getTripByTripData(vehicleId, status, driverId, startedAt, expectedReturn) {
  return `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId 
    WHERE t.vehicleId ='${vehicleId}' and t.status ='${status}' and t.driverId ='${driverId}' 
    and t.startedAt ='${startedAt}' and t.expectedReturn ='${expectedReturn}'
  `;
}
function deleteTripByID(id) {
  return `DELETE from trip where id =${id}`;
}

module.exports = {
  createVehicleTable,
  getVehicleByID,
  insertVehicle,
  getVehicleByMake,
  deleteVehicleByID,
  createDriverTable,
  getDriverByID,
  insertDriver,
  getDriverByDriverName,
  deleteDriverByID,
  createTripTable,
  getTripByID,
  insertTrip,
  getTripByTripData,
  deleteTripByID,
};
