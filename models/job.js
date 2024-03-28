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
  



}




module.exports = Job;