"use strict";

const { BadRequestError } = require("../expressError");


/**
 * dataToUpdate: an object that contains a key of column, and its value being
 * data we want to update. jsToSql: converting javascript to sql column
 * names.
 * Returns an object of all the columns we want to update in sql syntax, with
 * the values sanitized-ready.
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
