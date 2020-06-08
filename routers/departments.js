const express = require('express');
const Department = require('../model/departments');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/department', auth, async (req, res) => {

  const params = {...req.body};
  if(!params.name) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Department.insertDepartment(params.name)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
      }else{
        res.status(400).send({status: false, msg: 'Unknown error'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.put('/department', auth, async (req, res) => {

  const params = {...req.body};
  if(!params.name) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Department.updateDepartment(params.name)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
      }else{
        res.status(400).send({status: false, msg: 'Unknown error'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.get('/departments', auth, async (req, res) => {

  const params = {...req.query};

  Department.getDepartments(params.name)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

module.exports = router;
