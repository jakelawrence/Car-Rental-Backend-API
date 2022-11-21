const errorCodes = require("../helper_modules/errorCodes");

//get vehicle by vehicleId
function getVehicle(vehicleId, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM vehicle WHERE id =${vehicleId}`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject(errorCodes.VEHICLE_NOT_FOUND_CODE);
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get vehicle by license plate
function getVehicleByLicensePlate(licensePlate, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM vehicle WHERE licensePlate ='${licensePlate}'`;
    db.serialize(() => {
      //query for vehicle with license plate
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no vehicle with license plate found
        else if (!row) reject(errorCodes.VEHICLE_NOT_FOUND_CODE);
        //return vehicle to user
        else resolve(row);
      });
    });
  });
}

//get driver by driverId
function getDriver(driverId, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM driver WHERE id =${driverId}`;
    db.serialize(() => {
      //query for drivers with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with :id found
        else if (!row) reject(errorCodes.DRIVER_NOT_FOUND_CODE);
        //return driver to user
        else resolve(row);
      });
    });
  });
}

//get driver by email
function getDriverByEmail(email, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM driver WHERE email ='${email}'`;
    db.serialize(() => {
      //query for drivers with email
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no drivers with email found
        else if (!row) reject(errorCodes.DRIVER_NOT_FOUND_CODE);
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
      SELECT t.id, t.startedAt, t.expectedReturn, t.status,
        t.driverId, d.firstName, d.lastName, d.email, 
        t.vehicleId, v.make, v.model, v.licensePlate 
      FROM trip t 
      JOIN driver d on d.id = t.driverId 
      JOIN vehicle v on v.id = t.vehicleId 
      WHERE t.id=${tripId}
      `;
      //query for trip with :id
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no trip with :id found
        else if (!row) reject(errorCodes.TRIP_NOT_FOUND_CODE);
        //return trip to user
        else resolve(row);
      });
    });
  });
}

//get trip by trip date range, vehicleId and driverId
function getTripByDateRangeVehicleAndDriver(trip, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `
      SELECT t.id, t.startedAt, t.expectedReturn, t.status,
        t.driverId, d.firstName, d.lastName, d.email, 
        t.vehicleId, v.make, v.model, v.licensePlate 
      FROM trip t 
      JOIN driver d on d.id = t.driverId 
      JOIN vehicle v on v.id = t.vehicleId 
      WHERE t.vehicleId=${trip.vehicleId} and t.driverId=${trip.driverId} 
      and startedAt='${trip.startedAt}' and expectedReturn='${trip.expectedReturn}'
      `;
      //query for trip with date range, vehicleId and driverId
      db.get(query, function (err, row) {
        if (err) reject(err);
        //no trip with date range, vehicleId and driverId found
        else if (!row) reject(errorCodes.TRIP_NOT_FOUND_CODE);
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
        //if vehicle with license plate already taken
        if (err.code == errorCodes.DUPLICATE_SQL_ERR_CODE) reject(errorCodes.DUPLICATE_VEHICLE_CODE);
        else reject(err.code);
      } else {
        resolve();
      }
    });
  });
}

//insert driver into database
function insertDriver(data, db) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO driver (firstName, lastName, email) VALUES('${data.firstName}', '${data.lastName}', '${data.email}')`, function (err) {
      if (err) {
        //if driver with email already taken
        if (err.code == errorCodes.DUPLICATE_SQL_ERR_CODE) reject(errorCodes.DUPLICATE_DRIVER_CODE);
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
      let query = `DELETE from vehicle where id =${vehicleId}`;
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
      let query = `DELETE from driver where id =${driverId}`;
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
      let query = `DELETE from trip where id =${tripId}`;
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
    //create query for filtering trips
    var filters = [];
    var query = `
    SELECT t.id, t.startedAt, t.expectedReturn, t.status,
      t.driverId, d.firstName, d.lastName, d.email, 
      t.vehicleId, v.make, v.model, v.licensePlate 
    FROM trip t 
    JOIN driver d on d.id = t.driverId 
    JOIN vehicle v on v.id = t.vehicleId `;

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
          case "dateRangeStart":
            filters.push(`startedAt >= '${data.dateRangeStart}'`);
            break;
          case "dateRangeEnd":
            filters.push(`expectedReturn <= '${data.dateRangeEnd}'`);
            break;
          case "notId":
            filters.push(`t.id != ${data[key]}`);
            break;
          default:
            reject(errorCodes.MALFORMED_REQUEST_CODE);
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
    //create query for updating trips
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
        default:
          reject(errorCodes.MALFORMED_REQUEST_CODE);
      }
    }
    var query = `UPDATE trip SET ${updatedFieldsSQL.join(", ")}  WHERE id = ${updatedFields.tripId}`;
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
                SELECT count(distinct id) as rowCount 
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
          reject(errorCodes.OVERLAP_INSERT_TRIP_CODE);
        } else {
          resolve();
        }
      }
    });
  });
}

function isValidTripToUpdated(tripToUpdated, tripBeforeUpdate, db) {
  return new Promise((resolve, reject) => {
    //if status is being changed to inactive
    if (tripToUpdated.status == "inactive" && !tripToUpdated.startedAt && !tripToUpdated.expectedReturn) {
      resolve();
    } else {
      let updatedFieldsSQL = [];
      let startedAt = tripToUpdated.startedAt ? tripToUpdated.startedAt : tripBeforeUpdate.startedAt;
      let expectedReturn = tripToUpdated.expectedReturn ? tripToUpdated.expectedReturn : tripBeforeUpdate.expectedReturn;
      //if updated times are invalid
      if (new Date(startedAt) > new Date(expectedReturn)) reject(errorCodes.MALFORMED_REQUEST_CODE);

      //create query based on fields to be updated
      for (const key of Object.keys(tripToUpdated)) {
        switch (key) {
          case "tripId":
            break;
          case "status":
            if (tripToUpdated.status == "active") updatedFieldsSQL.push(`status = '${tripToUpdated.status}'`);
            break;
          case "startedAt":
            updatedFieldsSQL.push(`(startedAt >= '${startedAt}' and startedAt <= '${expectedReturn}')`);
            break;
          case "expectedReturn":
            updatedFieldsSQL.push(`(expectedReturn >= '${startedAt}' and expectedReturn <= '${expectedReturn}')`);
            break;
          default:
            reject(errorCodes.MALFORMED_REQUEST_CODE);
        }
      }
      var query = `
                  SELECT count(distinct id) as rowCount 
                  from TRIP 
                  where vehicleId = ${tripBeforeUpdate.vehicleId} and id != ${tripToUpdated.tripId} and (${updatedFieldsSQL.join(" or ")})
                  `;
      //get count of existing trips that fall within date range of trip or are active (if trip being inserted is active)
      db.get(query, function (err, result) {
        if (err) reject(err);
        //if row count > 0 (trip exists within date range or is active), return false. Else return true
        else {
          if (result.rowCount > 0) {
            reject(errorCodes.OVERLAP_UPDATE_TRIP_CODE);
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
