const connection = require('../db/mysql');

const insertDepartment = async (name) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    insert into departments (name) VALUES (?)`, [
      name
    ], async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const updateDepartment = async (name) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    update departments set name=?`, [
      name
    ], async (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const getDepartments = async (name) => {
  let where = '';
  if(name) {
    where += ' name like "%' + name + '%" and ';
  }
  if(where) {
    where = ' where' + where.slice(0, -4);
  }
  return new Promise((resolve, reject) => {
    connection.query(`
    select * from departments ${where}`, (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
module.exports = {insertDepartment, updateDepartment, getDepartments}
