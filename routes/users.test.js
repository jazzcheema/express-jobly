"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  userToken,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("does not work for non-admins", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u2-new",
        firstName: "First2-new",
        lastName: "Last2-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: true,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        },
      ],
    });
  });

  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .get("/users");
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("does not work for user (non-admin)", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
        jobs: []
      },
    });
  });

  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("user's own detail is available to them", async function () {
    const resp = await request(app)
      .get(`/users/u2`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        isAdmin: false,
        jobs: []
      },
    });
  });

  test("user cannot see detail of another user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
      },
    });
  });

  test("does not work for non-admin, (user)", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });


  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });


  test("does not work for non-admin, (user)", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

});


/******************************************************* POST apply to a job */


describe("POST /users/:username/jobs/:id", function () {
  test("can apply to job as an admin for self", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/${jobIds[1]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      applied: jobIds[1]
    });
  });

  test("can apply to job as an admin for other user", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[1]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      applied: jobIds[1]
    });
  });

  test("can apply to job as a user (non-admin) for self", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[1]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      applied: jobIds[1]
    });
  });

  test("Unauth for anon (not logged in)", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/${jobIds[1]}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("Unauth for user (non-admin) applying for not self", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/${jobIds[1]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("Not found for non-existent job as admin", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        "message": "No job: 0",
        "status": 404
      }
    });
  });

  test("Not found for non-existent job as user (non-admin) applying for self", async function () {
    const resp = await request(app)
      .post(`/users/u2/jobs/0`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        "message": "No job: 0",
        "status": 404
      }
    });
  });

  test("Not found for non-existent user as admin", async function () {
    const resp = await request(app)
      .post(`/users/lmfao/jobs/{${jobIds[0]}}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        "message": "No user: lmfao",
        "status": 404
      }
    });
  });

  test("Unauth for non-existent user as user (non-admin)", async function () {
    const resp = await request(app)
      .post(`/users/bro/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("Unauth for non-existent user as user (non-admin)", async function () {
    const resp = await request(app)
      .post(`/users/lmfao/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

  test("Unauth for non-existent job as user (non-admin) trying to apply for not self", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        "message": "Unauthorized",
        "status": 401,
      }
    });
  });

























});