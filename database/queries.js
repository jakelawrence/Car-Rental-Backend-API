const DUPLICATE_SQL_ERR_CODE = "SQLITE_CONSTRAINT";
const DUPLICATE_VEHICLE_CODE = "Vehicle with license plate already exists";
const DUPLICATE_DRIVER_CODE = "Driver with email already exists";
const OVERLAP_INSERT_TRIP_CODE = "Cannot create trip due to existing trip with this vehicle";
const OVERLAP_UPDATE_TRIP_CODE = "Cannot update trip due to existing trip with this vehicle";

//get vehicle by vehicleId
function getVehicle(vehicleId, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM vehicle WHERE vehicleId =${vehicleId}`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject("Vehicle not found.");
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get vehicle by vehicleId
function getVehicleByLicensePlate(licensePlate, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM vehicle WHERE licensePlate ='${licensePlate}'`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject("Vehicle not found.");
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get driver by driverId
function getDriver(driverId, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM driver WHERE driverId =${driverId}`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject("Driver not found.");
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get driver by driverId
function getDriverByEmail(email, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM driver WHERE email ='${email}'`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject("Driver not found.");
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get trip by tripId
function getTrip(tripId, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `
      SELECT t.tripId, t.startedAt, t.expectedReturn, t.status,
        d.driverId, d.firstName, d.lastName, d.email, 
        v.vehicleId, v.make, v.model, v.licensePlate 
      FROM trip t 
      JOIN driver d on d.driverId = t.driverId 
      JOIN vehicle v on v.vehicleId = t.vehicleId 
      WHERE t.tripId=${tripId}
      `;
      //query for trip with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no trip with :id found
        else if (!row) reject("Trip not found.");
        //return trip to user
        else resolve(row);
      });
    });
  });
}

//get trip by tripId
function getTripByDateRangeVehicleAndDriver(trip, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `
      SELECT t.tripId, t.startedAt, t.expectedReturn, t.status,
        d.driverId, d.firstName, d.lastName, d.email, 
        v.vehicleId, v.make, v.model, v.licensePlate 
      FROM trip t 
      JOIN driver d on d.driverId = t.driverId 
      JOIN vehicle v on v.vehicleId = t.vehicleId 
      WHERE t.vehicleId=${trip.vehicleId} and t.driverId=${trip.driverId} 
      and startedAt='${trip.startedAt}' and expectedReturn='${trip.expectedReturn}'
      `;
      //query for trip with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no trip with :id found
        else if (!row) reject("Trip not found.");
        //return trip to user
        else resolve(row);
      });
    });
  });
}

//insert vehicle into database
function insertVehicle(data, db) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO vehicle (make, model, licensePlate) VALUES('${data.make}', '${data.model}', '${data.licensePlate}')`, function (err) {
      if (err) {
        if (err.code == DUPLICATE_SQL_ERR_CODE) reject(DUPLICATE_VEHICLE_CODE);
        else reject(err.code);
      } else {
        resolve();
      }
    });
  });
}

//insert vehicle into database
function insertDriver(data, db) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO driver (firstName, lastName, email) VALUES('${data.firstName}', '${data.lastName}', '${data.email}')`, function (err) {
      if (err) {
        if (err.code == DUPLICATE_SQL_ERR_CODE) reject(DUPLICATE_DRIVER_CODE);
        else reject(err.code);
      } else {
        resolve();
      }
    });
  });
}

//insert trip into database
function insertTrip(data, db) {
  return new Promise((resolve, reject) => {
    let query = `
        INSERT INTO trip (vehicleId, driverId, startedAt, expectedReturn, status)
        VALUES(
          ${data.vehicleId},${data.driverId},'${data.startedAt}','${data.expectedReturn}',
          CASE WHEN current_timestamp >='${data.startedAt}' and current_timestamp <= '${data.expectedReturn}'
          THEN 'active' ELSE 'inactive' END)`;
    db.serialize(() => {
      //create trip
      db.run(query, function (err) {
        if (err) reject(err);
        else {
          resolve();
        }
      });
    });
  });
}

//delete trip from database by tripId
function deleteVehicleById(vehicleId, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `DELETE from vehicle where vehicleId =${vehicleId}`;
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Vehicle with id = ${vehicleId} has been deleted.`);
      });
    });
  });
}

//delete trip from database by tripId
function deleteDriverById(driverId, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `DELETE from driver where driverId =${driverId}`;
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Driver with id = ${driverId} has been deleted.`);
      });
    });
  });
}

//delete trip from database by tripId
function deleteTripById(tripId, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `DELETE from trip where tripId =${tripId}`;
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Trip with id = ${tripId} has been deleted.`);
      });
    });
  });
}

//get trips from database by filtered data
function filterTrips(data, db) {
  return new Promise((resolve, reject) => {
    var filters = [];
    var query = `
    SELECT t.tripId, t.startedAt, t.expectedReturn, t.status,
      d.driverId, d.firstName, d.lastName, d.email, 
      v.vehicleId, v.make, v.model, v.licensePlate 
    FROM trip t 
    JOIN driver d on d.driverId = t.driverId 
    JOIN vehicle v on v.vehicleId = t.vehicleId `;

    if (Object.keys(data).length > 0) {
      query = query.concat(" WHERE ");
      for (const key of Object.keys(data)) {
        switch (key) {
          case "status":
            filters.push(`status = '${data[key]}'`);
            break;
          case "vehicleId":
            filters.push(`t.vehicleId = ${data[key]}`);
            break;
          case "driverId":
            filters.push(`t.driverId = ${data[key]}`);
            break;
          case "startedAt":
            filters.push(`startedAt = '${data[key]}'`);
            break;
          case "expectedReturn":
            filters.push(`expectedReturn = '${data[key]}'`);
            break;
          case "notId":
            filters.push(`t.id != ${data[key]}`);
            break;
          default:
            reject("Malformed Request");
        }
      }
    }

    query = query.concat(filters.join(" and "));
    db.serialize(() => {
      db.all(query, function (err, rows) {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
}

//update a trip in the database
function updateTrip(updatedFields, db) {
  return new Promise((resolve, reject) => {
    var query = `UPDATE trip SET `;
    var updatedFieldsSQL = [];
    for (const key of Object.keys(updatedFields)) {
      switch (key) {
        case "tripId":
          break;
        case "status":
          updatedFieldsSQL.push(`status = '${updatedFields[key]}'`);
          break;
        case "startedAt":
          updatedFieldsSQL.push(`startedAt = '${updatedFields[key]}'`);
          break;
        case "expectedReturn":
          updatedFieldsSQL.push(`expectedReturn = '${updatedFields[key]}'`);
          break;
        case "vehicleId":
          updatedFieldsSQL.push(`vehicleId = ${updatedFields[key]}`);
          break;
        case "driverId":
          updatedFieldsSQL.push(`driverId = ${updatedFields[key]}`);
          break;
        default:
          throw new Error(key + " is not a valid field to update.");
      }
    }
    query = query.concat(updatedFieldsSQL.join(", "));
    query = query.concat(` WHERE tripId = ${updatedFields.tripId}`);
    db.serialize(() => {
      db.run(query, function (err, rows) {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

function isValidTripToInsert(tripToInserted, db) {
  return new Promise((resolve, reject) => {
    //get count of existing trips that fall within date range of trip or are active (if trip being inserted is active)
    var query = `
                SELECT count(distinct tripId) as rowCount 
                from TRIP 
                where vehicleId = ${tripToInserted.vehicleId} and 
                ((startedAt >= '${tripToInserted.startedAt}' and startedAt <= '${tripToInserted.expectedReturn}') or 
                (expectedReturn >= '${tripToInserted.startedAt}' and expectedReturn <= '${tripToInserted.expectedReturn}') 
                ${tripToInserted.status == "active" ? " or status = 'active'" : ""})
                `;

    db.get(query, function (err, result) {
      if (err) reject(err);
      //if row count > 0 (trip exists within date range or is active), return false. Else return true
      else {
        if (result.rowCount > 0) {
          reject(OVERLAP_INSERT_TRIP_CODE);
        } else {
          resolve();
        }
      }
    });
  });
}

function isValidTripToUpdated(tripToUpdated, db) {
  return new Promise((resolve, reject) => {
    //if status is being changed to inactive
    if (tripToUpdated.status == "inactive") {
      resolve(true);
    } else {
      var updatedFieldsSQL = [];
      //create query based on fields to be updated
      for (const key of Object.keys(tripToUpdated)) {
        switch (key) {
          case "tripId":
            break;
          case "status":
            if (tripToUpdated.status == "active") updatedFieldsSQL.push(`status = '${tripToUpdated.status}'`);
            break;
          case "startedAt":
            updatedFieldsSQL.push(`(startedAt >= '${tripToInserted.startedAt}' and startedAt <= '${tripToInserted.expectedReturn}')`);
            break;
          case "expectedReturn":
            updatedFieldsSQL.push(`(expectedReturn >= '${tripToInserted.startedAt}' and expectedReturn <= '${tripToInserted.expectedReturn}')`);
            break;
          default:
            reject(key + " is not a valid field to update.");
        }
      }
      var query = `
                  SELECT count(distinct tripId) as rowCount 
                  from TRIP 
                  where vehicleId = ${tripToUpdated.vehicleId} and id != ${tripToUpdated.tripId} and (${updatedFieldsSQL.join(" or ")})
                  `;
      //get count of existing trips that fall within date range of trip or are active (if trip being inserted is active)
      db.get(query, function (err, result) {
        if (err) reject(err);
        //if row count > 0 (trip exists within date range or is active), return false. Else return true
        else {
          if (result.rowCount > 0) {
            reject(OVERLAP_UPDATE_TRIP_CODE);
          } else {
            resolve();
          }
        }
      });
    }
  });
}

module.exports = {
  getVehicle,
  getVehicleByLicensePlate,
  insertVehicle,
  deleteVehicleById,
  getDriver,
  getDriverByEmail,
  insertDriver,
  deleteDriverById,
  getTrip,
  getTripByDateRangeVehicleAndDriver,
  insertTrip,
  deleteTripById,
  filterTrips,
  updateTrip,
  isValidTripToInsert,
  isValidTripToUpdated,
};
