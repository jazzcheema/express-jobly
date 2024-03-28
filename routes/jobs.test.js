"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");


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



/**************************************************** POST /jobs */

describe("POST /jobs", function () {
  test("create a job as an admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Cowboy",
        salary: 29000,
        equity: "0",
        companyHandle: "c1"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Cowboy",
        salary: 29000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });
  test("does not work for anon (not logged in)", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Cowboy",
        salary: 29000,
        equity: "0",
        companyHandle: "c1"
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("does not work for non-admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Cowboy",
        salary: 29000,
        equity: "0",
        companyHandle: "c1"
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("does not work with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Cowboy",
        salary: 29000,
        equity: "0",
        companyHandle: "c1",
        hasInsurance: true
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("does not work with empty data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send()
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/******************************************************* GET /jobs */

describe("GET /jobs", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[0],
          title: "Cow Herder",
          salary: 95000,
          equity: "0.15",
          companyHandle: "c1"
        },
        {
          id: jobIds[1],
          title: "Janitor",
          salary: 32000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          id: jobIds[2],
          title: "CEO",
          salary: 729000,
          equity: "0.9",
          companyHandle: "c3"
        },
      ],
    });
  });

  test("works for anon (not logged in)", async function () {
    const resp = await request(app)
      .get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[0],
          title: "Cow Herder",
          salary: 95000,
          equity: "0.15",
          companyHandle: "c1"
        },
        {
          id: jobIds[1],
          title: "Janitor",
          salary: 32000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          id: jobIds[2],
          title: "CEO",
          salary: 729000,
          equity: "0.9",
          companyHandle: "c3"
        },
      ],
    });
  });

  test("works for anon (not logged in)", async function () {
    const resp = await request(app)
      .get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[0],
          title: "Cow Herder",
          salary: 95000,
          equity: "0.15",
          companyHandle: "c1"
        },
        {
          id: jobIds[1],
          title: "Janitor",
          salary: 32000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          id: jobIds[2],
          title: "CEO",
          salary: 729000,
          equity: "0.9",
          companyHandle: "c3"
        },
      ],
    });
  });
});

/**********************************************************GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("find a job by id as an admin", async function () {
    const resp = await request(app)
      .get(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Cow Herder",
        salary: 95000,
        equity: "0.15",
        companyHandle: "c1"
      }
    });
  });

  test("find a job by id as anon (not logged in)", async function () {
    const resp = await request(app)
      .get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Cow Herder",
        salary: 95000,
        equity: "0.15",
        companyHandle: "c1"
      }
    });
  });

  test("cannot find job that doesn't exist", async function () {
    const resp = await request(app)
      .get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job: 0",
        status: 404
      }
    });
  });









});