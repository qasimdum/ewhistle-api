const express = require('express');
const Dashboard = require('../model/dashboard');
const auth = require('../middleware/auth');
const roles = require('../enums/roles');
const router = new express.Router();

router.post('/dashboard/nature', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Access denied'});
    return;
  }
  let params = {...req.body};

  if(params.department) {
    delete params.department;
  }
  if(params.hasOwnProperty('dateFrom')) {
    if(params.dateFrom) {
      let dateFrom = new Date(params.dateFrom);
      if(dateFrom) {
        params.dateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
      }
    }else{
      delete params.dateFrom
    }
  }
  if(params.hasOwnProperty('dateTo')) {
    if(params.dateTo) {
      let dateTo = new Date(params.dateTo);
      if(dateTo) {
        params.dateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`;
      }
    }else{
      delete params.dateTo;
    }
  }

  Dashboard.getAllegationNatureDashboard(params)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.post('/dashboard/severity', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Access denied'});
    return;
  }
  let params = {...req.body};

  if(params.department) {
    delete params.department;
  }
  if(params.hasOwnProperty('dateFrom')) {
    if(params.dateFrom) {
      let dateFrom = new Date(params.dateFrom);
      if(dateFrom) {
        params.dateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
      }
    }else{
      delete params.dateFrom
    }
  }
  if(params.hasOwnProperty('dateTo')) {
    if(params.dateTo) {
      let dateTo = new Date(params.dateTo);
      if(dateTo) {
        params.dateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`;
      }
    }else{
      delete params.dateTo;
    }
  }
  Dashboard.getSeverityDashboard(params)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.post('/dashboard/status', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Access denied'});
    return;
  }
  let params = {...req.body};

  if(params.department) {
    delete params.department;
  }
  if(params.hasOwnProperty('dateFrom')) {
    if(params.dateFrom) {
      let dateFrom = new Date(params.dateFrom);
      if(dateFrom) {
        params.dateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
      }
    }else{
      delete params.dateFrom
    }
  }
  if(params.hasOwnProperty('dateTo')) {
    if(params.dateTo) {
      let dateTo = new Date(params.dateTo);
      if(dateTo) {
        params.dateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`;
      }
    }else{
      delete params.dateTo;
    }
  }
  Dashboard.getStatusDashboard(params)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.post('/dashboard/nature/top', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Access denied'});
    return;
  }
  let params = {...req.body};

  if(params.department) {
    delete params.department;
  }
  if(params.hasOwnProperty('dateFrom')) {
    if(params.dateFrom) {
      let dateFrom = new Date(params.dateFrom);
      if(dateFrom) {
        params.dateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
      }
    }else{
      delete params.dateFrom
    }
  }
  if(params.hasOwnProperty('dateTo')) {
    if(params.dateTo) {
      let dateTo = new Date(params.dateTo);
      if(dateTo) {
        params.dateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`;
      }
    }else{
      delete params.dateTo;
    }
  }
  Dashboard.getTopAllegationNatureDashboard(params)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

module.exports = router;
