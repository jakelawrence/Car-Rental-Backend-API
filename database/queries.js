//get vehicle by vehicleId
function getVehicle(vehicleId, db) {
  return new Promise((resolve, reject) => {
    let query = `SELECT id, make, model FROM vehicle WHERE id =${vehicleId}`;
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
    let query = `SELECT id, firstName, lastName, email FROM driver WHERE id =${driverId}`;
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
      SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.firstName, d.lastName, d.email, t.vehicleId, v.make, v.model  
      FROM trip t 
      JOIN driver d on d.id = t.driverId 
      JOIN vehicle v on v.id = t.vehicleId 
      WHERE t.id=${tripId}
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
    db.serialize(() => {
      db.get(`SELECT count(1) as rowCnt FROM vehicle WHERE make ='${data.make}' and model = '${data.model}'`, function (err, row) {
        if (err) {
          reject(err);
        } else {
          if (row.rowCnt > 0) {
            reject("Vehicle already exists");
          } else {
            db.run(`INSERT INTO vehicle (make, model) VALUES('${data.make}', '${data.model}')`, function (err) {
              if (err) {
                reject(err);
              } else {
                db.get(`SELECT id, make, model FROM vehicle WHERE make ='${data.make}' and model = '${data.model}'`, function (err, row) {
                  if (err) reject(err);
                  else resolve(row);
                });
              }
            });
          }
        }
      });
    });
  });
}

//insert vehicle into database
function insertDriver(data, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(`SELECT count(1) as rowCnt FROM driver WHERE email ='${data.email}'`, function (err, row) {
        if (err) {
          reject(err);
        } else {
          if (row.rowCnt > 0) {
            reject("Email address is already taken, please try another.");
          } else {
            db.run(`INSERT INTO driver (firstName, lastName, email) VALUES('${data.firstName}', '${data.lastName}', '${data.email}')`, function (err) {
              if (err) {
                reject(err);
              } else {
                db.get(`SELECT id, firstName, lastName, email FROM driver WHERE email ='${data.email}'`, function (err, row) {
                  if (err) reject(err);
                  else resolve(row);
                });
              }
            });
          }
        }
      });
    });
  });
}

//insert trip into database
function insertTrip(data, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      //create trip
      db.run(
        `
        INSERT INTO trip (vehicleId, status, driverId, startedAt, expectedReturn) 
        VALUES(${data.vehicleId},'${data.status ? data.status : "active"}',${data.driverId},'${data.startedAt}','${data.expectedReturn}')
      `,
        function (err) {
          if (err) {
            reject(err);
          } else {
            //return trip to user
            db.get(
              `
            SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.firstName, d.lastName, d.email, t.vehicleId, v.make, v.model 
            FROM trip t 
            JOIN driver d on d.id = t.driverId 
            JOIN vehicle v on v.id = t.vehicleId 
            WHERE t.driverId = ${data.driverId} and t.vehicleId = ${data.vehicleId} 
            and t.startedAt = '${data.startedAt}' and t.expectedReturn = '${data.expectedReturn}'
            `,
              function (err, row) {
                if (err) reject(err);
                else resolve(row);
              }
            );
          }
        }
      );
    });
  });
}

//delete vehicle from database by vehicleId
function deleteVehicle(data, db) {
  return new Promise((resolve, reject) => {
    let query = `DELETE from vehicle where id =${data.id}`;
    db.serialize(() => {
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Vehicle with id = ${data.id} has been deleted.`);
      });
    });
  });
}

//delete driver from database by driverId
function deleteDriver(data, db) {
  return new Promise((resolve, reject) => {
    let query = `DELETE from driver where id =${data.id}`;
    db.serialize(() => {
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Driver with id = ${data.id} has been deleted.`);
      });
    });
  });
}

//delete trip from database by tripId
function deleteTrip(data, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = `DELETE from trip where id =${data.id}`;
      db.get(query, function (err, row) {
        if (err) reject(err);
        else resolve(`Trip with id = ${data.id} has been deleted.`);
      });
    });
  });
}

//get trips from database by filtered data
function filterTrips(data, db) {
  return new Promise((resolve, reject) => {
    var filters = [];
    var query = `
    SELECT t.id, t.status, t.startedAt, t.expectedReturn, t.driverId, d.firstName, d.lastName, d.email, t.vehicleId, v.make, v.model 
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
            filters.push(`vehicleId = ${data[key]}`);
            break;
          case "driverId":
            filters.push(`driverId = ${data[key]}`);
            break;
          case "startedAt":
            filters.push(`startedAt = '${data[key]}'`);
            break;
          case "expectedReturn":
            filters.push(`expectedReturn = '${data[key]}'`);
            break;
          case "notId":
            filters.push(`id != ${data[key]}`);
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
    query = query.concat(` WHERE id = ${updatedFields.tripId}`);
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
          throw new Error("Cannot insert trip due to existing trip with this vehicle");
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
            throw new Error(key + " is not a valid field to update.");
        }
      }
      var query = `
                  SELECT count(distinct id) as rowCount 
                  from TRIP 
                  where vehicleId = ${tripToUpdated.vehicleId} and id != ${tripToUpdated.tripId} and (${updatedFieldsSQL.join(" or ")})
                  `;
      //get count of existing trips that fall within date range of trip or are active (if trip being inserted is active)
      db.get(query, function (err, result) {
        if (err) reject(err);
        //if row count > 0 (trip exists within date range or is active), return false. Else return true
        else {
          if (result.rowCount > 0) {
            throw new Error("Cannot update trip due to existing trip with this vehicle");
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
  insertVehicle,
  deleteVehicle,
  getDriver,
  insertDriver,
  deleteDriver,
  getTrip,
  insertTrip,
  deleteTrip,
  filterTrips,
  updateTrip,
  isValidTripToInsert,
  isValidTripToUpdated,
};
