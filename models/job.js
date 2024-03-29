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
  static async create({ title, salary, equity, companyHandle }) {

    const checkCompanyExistence = await db.query(`
    SELECT handle
    FROM companies
    WHERE handle = $1`, [companyHandle]);

    if (!checkCompanyExistence.rows[0])
      throw new BadRequestError(`Company does not exist: ${companyHandle}`);

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
        companyHandle,
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
   * filterValues: [5000, ...] }
   */
  static _filterByQuery({ title, minSalary, hasEquity }) {
    let whereStatements = [];
    let filterValues = [];
    let whereClause = '';

    if (title !== undefined) {
      filterValues.push(`%${title}%`);
      whereStatements.push(` title ILIKE $${filterValues.length}`);
    }

    if (minSalary !== undefined) {
      filterValues.push(minSalary);
      whereStatements.push(` salary >= $${filterValues.length}`);
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
      whereClause, filterValues
    };
    return filteredSearchObj;
  }


  /** Find jobs.
   *  Option to filter by query params.
   *
   * Input for filter search:
   * {title: "Janitor", minSalary: 10000, hasEquity: False}
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */
  static async findAll(params = {}) {
    const { whereClause, filterValues } = Job._filterByQuery(params);
    const jobs = await db.query(`
    SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
    FROM jobs
    ${whereClause}
    ORDER by company_handle, title`, filterValues);

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

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle",
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns id.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}



module.exports = Job;