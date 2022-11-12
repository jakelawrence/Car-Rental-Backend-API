var dbQueries = require("../queries.json");

function initializeTablesInDatabase(db) {
  db.run(dbQueries.vehiclesTable.createVehicleTable);
  db.run(dbQueries.driversTable.createDriverTable);
  db.run(dbQueries.tripsTable.createTripTable);
}
module.exports = {
  initializeTablesInDatabase,
};
