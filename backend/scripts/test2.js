const db = require('./src/config/db');

db.query('SELECT lt.id, lt.tracknumber, lp.firstname, lt.disbursementamount FROM leadtrackdetails lt INNER JOIN leadpersonaldetails lp ON lt.leadid = lp.id')
  .then(res => {
    console.log(res.rows);
    process.exit(0);
  })
  .catch(console.error);
