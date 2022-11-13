//vehicle queries
function createVehicleTable() {
  return `
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY, 
      make varchar(255) UNIQUE NOT NULL
    )
  `;
}

function getVehicleByID(data) {
  return `SELECT id, make FROM vehicle WHERE id =${data.id}`;
}

function insertVehicle(data) {
  return `INSERT INTO vehicle (make) VALUES('${data.make}')`;
}

function getVehicleByMake(data) {
  return `SELECT id, make FROM vehicle WHERE make ='${data.make}'`;
}

function deleteVehicleByID(data) {
  return `DELETE from vehicle where id =${data.id}`;
}

//driver queries
function createDriverTable() {
  return `
    CREATE TABLE IF NOT EXISTS driver (
      id INTEGER PRIMARY KEY, 
      driverName varchar(255) UNIQUE NOT NULL
    )
  `;
}

function getDriverByID(data) {
  return `SELECT id, driverName FROM driver WHERE id =${data.id}`;
}

function insertDriver(data) {
  return `INSERT INTO driver (driverName) VALUES('${data.driverName}')`;
}

function getDriverByDriverName(data) {
  return `SELECT id, driverName FROM driver WHERE driverName ='${data.driverName}'`;
}

function deleteDriverByID(data) {
  return `DELETE from driver where id =${data.id}`;
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
function getTripByID(data) {
  return `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId 
    WHERE t.id=${data.id}
  `;
}
function insertTrip(data) {
  return `
    INSERT INTO trip (vehicleId, status, driverId, startedAt, expectedReturn) 
    VALUES(${data.vehicleId},'${data.status ? data.status : "active"}',${data.driverId},'${data.startedAt}','${data.expectedReturn}')
  `;
}
function getTripByTripData(data) {
  return `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId 
    WHERE t.vehicleId =${data.vehicleId} and t.driverId =${data.driverId} 
    and t.startedAt ='${data.startedAt}' and t.expectedReturn ='${data.expectedReturn}'
  `;
}
function deleteTripByID(data) {
  return `DELETE from trip where id =${data.id}`;
}

function getTripsByFilteredData(data) {
  var filters = [];
  var query = `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.driverName, t.vehicleId, v.make 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId 
    WHERE `;

  for (const key of Object.keys(data)) {
    switch (key) {
      case "status":
        filters.push(`status = '${data[key]}'`);
        break;
      case "vehicleId":
        filters.push(`vehicleId = ${data[key]}`);
        break;
      case "driverId":
        filters.push(`driverId = ${data[key]}`);
        break;
      default:
        throw new Error(key + " is not a valid filter type.");
    }
  }
  query = query.concat(filters.join(" and "));
  return query;
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
  getTripsByFilteredData,
};
