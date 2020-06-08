const connection = require('../db/mysql');

const getAllegationNatureDashboard = async (params) => {

  let where = '';
  const paramsStr = Object.keys(params).map((key) => {
    let dateStr = ''
    if(key === 'dateFrom' && params.dateFrom) {
      dateStr += 'allegationDate>="' + params.dateFrom + '"';
    }
    if(key === 'dateTo' && params.dateTo) {
      if(dateStr) {
        dateStr += ' and '
      }
      dateStr += 'allegationDate<="' + params.dateTo + '"'
    }
    if(dateStr) {
      return dateStr
    }
    return key + '=' + params[key];
  }).join(' and ');

  if(paramsStr) {
    where = ' where ' + paramsStr;
  }

  return new Promise((resolve, reject) => {
    connection.query(`
    select allegationNature, count(id) as count from allegations ${where} group by allegationNature 
      `, async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}

const getTopAllegationNatureDashboard = async (params) => {
  let where = '';
  const paramsStr = Object.keys(params).map((key) => {
    let dateStr = ''
    if(key === 'dateFrom' && params.dateFrom) {
      dateStr += 'allegationDate>="' + params.dateFrom + '"';
    }
    if(key === 'dateTo' && params.dateTo) {
      if(dateStr) {
        dateStr += ' and '
      }
      dateStr += 'allegationDate<="' + params.dateTo + '"'
    }
    if(dateStr) {
      return dateStr
    }
    return key + '=' + params[key];
  }).join(' and ');

  if(paramsStr) {
    where = ' where ' + paramsStr;
  }
  return new Promise((resolve, reject) => {
    connection.query(`
    select allegationNature, count(id) as count from allegations ${where} group by allegationNature order by count desc LIMIT 3
      `, async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}

const getSeverityDashboard = async (params) => {
  let where = '';
  const paramsStr = Object.keys(params).map((key) => {
    let dateStr = ''
    if(key === 'dateFrom' && params.dateFrom) {
      dateStr += 'allegationDate>="' + params.dateFrom + '"';
    }
    if(key === 'dateTo' && params.dateTo) {
      if(dateStr) {
        dateStr += ' and '
      }
      dateStr += 'allegationDate<="' + params.dateTo + '"'
    }
    if(dateStr) {
      return dateStr
    }
    return key + '=' + params[key];
  }).join(' and ');

  if(paramsStr) {
    where = ' where ' + paramsStr;
  }
  return new Promise((resolve, reject) => {
    connection.query(`
    select severity, count(id) as count from allegations ${where} group by severity 
      `, async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}

const getStatusDashboard = async (params) => {
  let where = '';
  const paramsStr = Object.keys(params).map((key) => {
    let dateStr = ''
    if(key === 'dateFrom' && params.dateFrom) {
      dateStr += 'allegationDate>="' + params.dateFrom + '"';
    }
    if(key === 'dateTo' && params.dateTo) {
      if(dateStr) {
        dateStr += ' and '
      }
      dateStr += 'allegationDate<="' + params.dateTo + '"'
    }
    if(dateStr) {
      return dateStr
    }
    return key + '=' + params[key];
  }).join(' and ');

  if(paramsStr) {
    where = ' where ' + paramsStr;
  }
  return new Promise((resolve, reject) => {
    connection.query(`
    select status, count(id) as count from allegations ${where} group by status 
      `, async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}

module.exports = {getAllegationNatureDashboard, getSeverityDashboard, getStatusDashboard, getTopAllegationNatureDashboard}
