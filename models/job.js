"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   *
   * Company needs to exist before creating a job.
   * */
  static async create({ title, salary, equity, company_handle }) {

    const checkCompanyExistence = await db.query(`
    SELECT handle
    FROM companies
    WHERE handle = $1`, [company_handle]);

    if (!checkCompanyExistence.rows[0])
      throw new BadRequestError(`Company does not exist: ${company_handle}`);

    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        company_handle,
      ],
    );
    const job = result.rows[0];
    return job;
  }

  /**
   * Takes search parameters to filter jobs
   * Adds clauses based on optional search parameters, and returns an object
   * Returns ->
   * {whereClause: WHERE salary >= $1... ,
   * searchQuery: [5000, ...] }
   */
  static _filterByQuery({ title, minSalary, hasEquity }) {
    let whereStatements = [];
    let searchQuery = [];
    let whereClause = '';

    if (title) {
      searchQuery.push(`%${title}%`);
      whereStatements.push(` title ILIKE $${searchQuery.length}`);
    }

    if (minSalary) {
      searchQuery.push(minSalary);
      whereStatements.push(` salary >= $${searchQuery.length}`);
    }

    if (hasEquity === false) {
      whereStatements.push(` equity = 0`);
    } else if (hasEquity === true) {
      whereStatements.push(` equity > 0`);
    }

    if (whereStatements.length > 0) {
      whereClause += "WHERE" + whereStatements.join(" AND ");
    }
    const filteredSearchObj = {
      whereClause, searchQuery
    };
    return filteredSearchObj;
  }


  /** Find jobs.
   *  Option to filter by query params.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */
  static async findAll(params = {}) {
    const { whereClause, searchQuery } = Job._filterByQuery(params);
    const jobs = await db.query(`
    SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
    FROM jobs
    ${whereClause}
    ORDER by company_handle, title`, searchQuery);

    return jobs.rows;
  }


  /** Given a job ID, return data about that job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT id,
               title,
               salary,
               company_handle AS "companyHandle",
               equity
        FROM jobs
        WHERE id = $1`, [id]);
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }
}




module.exports = Job;