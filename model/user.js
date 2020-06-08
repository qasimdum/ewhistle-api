const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../db/mysql');
const allegationStatus = require('../enums/allegationStatus');
const dotenv = require('dotenv');
dotenv.config();


const findByCredentials = async (username, password) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    select * from users where username=?`, [
      username
    ], async (err, row, fields) => {
      if (err)
        return reject(err);
      if (!row[0]) {
        reject('Username and password do not match')
      }
      const user = row[0]
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        reject('Username and password do not match')}
      resolve(user);
    });
  })
}
const generateAuthToken = async function (user) {
  return jwt.sign({...user}, process.env.JWT_SECRET, {expiresIn: '180000s'});
}
const registerUser = async (name, username, email, role, departmentId, active, pass) => {
  let password = await bcrypt.hash(pass, 8);
  return new Promise((resolve, reject) => {
    connection.query(`
    insert into users (name, username, email, password, role, departmentId, active) 
     VALUES 
    (?,?,?,?,?,?,?)
    `, [
      name, username, email, password, role, departmentId, active
    ], (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const updateUser = async (userId, name, username, email, role, departmentId, active) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    update users set name=?, username=?, role=?, email=?, departmentId=?, active=?
     WHERE id=?`, [
      name, username, role, email, departmentId, active, userId
    ], (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const assignUser = async (userId, allegationId) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    update allegations set assignee=?, status=?
     WHERE id=?`, [
      userId, allegationStatus.IN_REVIEW, allegationId
    ], (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const changeStatus = async (userId, status) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    update users set active=?
     WHERE id=?`, [
      parseInt(status), userId
    ], (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const getUsers = async (username, email, role, departmentId, name, status, offset, limit) => {

  let where = '';
  if(username) {
    where += ' username="' + username + '" and ';
  }
  if(name) {
    where += ' u.name like "%' + name + '%" and ';
  }
  if(email) {
    where += ' email="' + email + '" and ';
  }
  if(role) {
    where += ' role="' + role + '" and ';
  }
  if(departmentId) {
    where += ' departmentId="' + departmentId + '" and ';
  }
  if(status) {
    where += ' u.status="' + status + '" and ';
  }

  if(where) {
    where = ' where' + where.slice(0, -4);
  }

  return new Promise((resolve, reject) => {
    connection.query(`
    select u.*, d.name as departmentName from users u left join departments d on u.departmentId=d.id ${where} LIMIT ${offset}, ${limit}`, (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const getUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    select * from users where id=${userId}`, (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const getUsersByRole = async (role) => {
  return new Promise((resolve, reject) => {
    connection.query(`
    select * from users where role=${role}`, (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
const resetUserPassword = async (userId, password) => {
  password = await bcrypt.hash(password, 8);
  return new Promise((resolve, reject) => {
    connection.query(`
    update users set password='${password}' where id=${userId}`, (err, row, fields) => {
      if (err)
        return reject(err);
      resolve(row);
    });
  })
}
module.exports = {findByCredentials, generateAuthToken, registerUser, updateUser, getUsers, assignUser, changeStatus, getUserById, getUsersByRole, resetUserPassword}
