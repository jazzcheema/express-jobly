"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

const jobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  const herder = await Job.create({
    title: "Cow Herder",
    salary: 95000,
    equity: "0.15",
    companyHandle: "c1"
  });
  const janitor = await Job.create({
    title: "Janitor",
    salary: 32000,
    equity: "0",
    companyHandle: "c2"
  });
  const ceo = await Job.create({
    title: "CEO",
    salary: 729000,
    equity: "0.9",
    companyHandle: "c3"
  });
  jobIds.push(herder.id);
  jobIds.push(janitor.id);
  jobIds.push(ceo.id);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const adminToken = createToken({ username: "u1", isAdmin: true });
const userToken = createToken({ username: "u2", isAdmin: false });

// const herder = await Job.findAll({ title: "herder" });
// const herderId = herder.rows[0].id;

// const janitor = await Job.findAll({ title: "jan" });
// const janitorId = janitor.rows[0].id;

// const ceo = await Job.findAll({ title: "ceo" });
// const ceoId = ceo.rows[0].id;


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  userToken,
  jobIds
};
