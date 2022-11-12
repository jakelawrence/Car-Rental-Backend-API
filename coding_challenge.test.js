const request = require("supertest");
const app = require("./index");

describe("Create and insert Vehicle", () => {
  let vehicleId = 1;
  // test("POST /vehicles", (done) => {
  //   request(app)
  //     .post("/vehicles")
  //     .send({
  //       make: "Honda",
  //     })
  //     .expect((res) => {
  //       res.body.make = "Honda";
  //     })
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       vehicleId = res.body.id;
  //       return done();
  //     });
  // });

  test("GET /vehicles/:id", (done) => {
    request(app)
      .get(`/vehicles/${vehicleId}`)
      .expect(200)
      .expect((res) => {
        res.body.length = 1;
        res.body.id = vehicleId;
        res.body.email = "Honda";
      })
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });

  // test("DELETE /vehicles/:id", (done) => {
  //   request(app)
  //     .delete(`/vehicles/${vehicleId}`)
  //     .expect(204)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       return done();
  //     });
  // });
});
