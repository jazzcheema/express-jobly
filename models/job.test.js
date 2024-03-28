"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*
create a job: admin only
find all jobs: anon

filter jobs: anon

get job by id: anon
update job (cannot change id): admin only
delete job: admin only

*/



/************************************** create job */
describe("create", function () {
  const newJob = {
    title: "royal mail man",
    salary: 75000,
    equity: "0.1",
    company_handle: "c2"
  };

  test("can create job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "royal mail man",
      salary: 75000,
      equity: "0.1",
      companyHandle: "c2"
    });



  });




















});