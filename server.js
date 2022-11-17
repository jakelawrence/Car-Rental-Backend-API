const app = require("./routes");

const start = (port) => {
  try {
    app.listen(port, () => {});
  } catch (err) {
    process.exit();
  }
};

start(3000);
