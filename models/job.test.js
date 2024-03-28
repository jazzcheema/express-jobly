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
    equity: 0.1,
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

  test("Cannot create job for non-existent company", async function () {
    try {
      await Job.create({
        title: "janitor",
        salary: 1000,
        equity: 0.0,
        company_handle: "IBM"
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("Cannot create job beyond equity constraint", async function () {
    try {
      await Job.create({
        title: "janitor",
        salary: 1000,
        equity: 2.0,
        company_handle: "c2"
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err.message).toEqual(`new row for relation \"jobs\" violates check constraint \"jobs_equity_check\"`);
    }
  });

  test("Cannot create a job with a salary less than zero", async function () {
    try {
      await Job.create({
        title: "janitor",
        salary: -10,
        equity: 0.0,
        company_handle: "c2"
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err.message).toEqual(`new row for relation \"jobs\" violates check constraint \"jobs_salary_check\"`);
    }
  });


});

/************************************** findAll */


describe("findAll", function () {
  test("find all jobs", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'Janitor',
        salary: 80000,
        equity: '0',
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: 'CEO',
        salary: 30000,
        equity: '0.9',
        companyHandle: 'c3'
      }
    ]);
  });

  test("filter jobs by minimum salary", async function () {
    let jobs = await Job.findAll({ minSalary: 75000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'Janitor',
        salary: 80000,
        equity: '0',
        companyHandle: 'c1'
      }
    ]);
  });

  test("filter jobs by title", async function () {
    let jobs = await Job.findAll({ title: "CE" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'CEO',
        salary: 30000,
        equity: '0.9',
        companyHandle: 'c3'
      }
    ]);
  });

  test("filter jobs by equity existence", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'CEO',
        salary: 30000,
        equity: '0.9',
        companyHandle: 'c3'
      }
    ]);
  });

  test("filter jobs by salary, title, and equity", async function () {
    let jobs = await Job.findAll({
      title: "lmao this is not a job",
      minSalary: 64643664,
      hasEquity: true
    });
    expect(jobs).toEqual([]);
  });
});

/************************************** find job by id */

describe("get job by id", function () {
  test("can get job by id", async function () {
    let job = await Job.length("");
  });
});







