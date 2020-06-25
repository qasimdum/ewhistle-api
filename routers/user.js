const express = require('express');
const User = require('../model/user');
const auth = require('../middleware/auth');
const mail = require('../utils/mail');
const roles = require('../enums/roles');
const validator = require('validator');
const emailTemplates = require('../utils/templates');
const router = new express.Router();

router.post('/oauth/token', async (req, res) => {
  try {
    User.findByCredentials(req.body.username, req.body.password)
      .then(user => {
        User.generateAuthToken(user)
          .then(token => {
            res.send({token})
          })
          .catch(err => {
            res.status(400).send({status: false, msg: err})
          });
      })
      .catch(e => {
        res.status(400).send({status: false, msg: e})
      })

  } catch (e) {
    res.status(400).send()
  }
});

router.post('/reset-password', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Permission Denied'})
  }
  let user = {...req.body};
  if (!(user.userId)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  let password = Math.random().toString(36);

  User.resetUserPassword(user.userId, password)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
        User.getUserById(user.userId)
          .then(response => {
            if(response[0]) {
              mail.sendMail(response[0].email, 'Your password was changed', `<p>Your credentials:</p><p>username: ${response[0].username}</p><p>Password: ${password}</p>`);
            }else{
              res.status(400).send({status: false, msg: 'User not found'})
            }
          })
          .catch(e => {
            res.status(400).send({status: false, msg: e.message})
          })
      }else{
        res.status(400).send({status: false, msg: 'Unknown error'})
      }
    })
    .catch(e => {
      if(e.errno === 1062) {
        res.status(400).send({status: false, msg: 'Username or email already exists'})
      }else{
        res.status(400).send({status: false, msg: e.message})
      }

    })
})

router.get('/user/me', auth, async (req, res) => {
  res.status(201).json({status: true, data: req.user});
});

router.post('/user', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Permission Denied'})
  }
  let user = {...req.body};
  if (!(user.name && user.username && user.role && user.email && user.departmentId && user.active)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }
  if(!validator.isEmail(user.email)) {
    res.status(400).send({status: false, msg: 'Email is not correct'})
  }
  let password = Math.random().toString(36);

  User.registerUser(user.name, user.username, user.email, user.role, user.departmentId, user.active, password)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
        mail.sendMail(user.email, 'User was created', `<p>Your credentials:</p><p>username: ${user.username}</p><p>Password: ${password}</p>`);
      }else{
        res.status(400).send({status: false, msg: 'Unknown error'})
      }
    })
    .catch(e => {
      if(e.errno === 1062) {
        res.status(400).send({status: false, msg: 'Username or email already exists'})
      }else{
        res.status(400).send({status: false, msg: e.message})
      }

    })
})

router.put('/user', auth, async (req, res) => {
  if(req.user.role !== roles.ADMINISTRATOR) {
    res.status(400).send({status: false, msg: 'Permission Denied'})
  }
  let user = {...req.body};

  if (!(user.name && user.username && user.role && user.email && user.userId && user.departmentId && user.active)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }
  if(!validator.isEmail(user.email)) {
    res.status(400).send({status: false, msg: 'Email is not correct'})
  }

  User.updateUser(user.userId, user.name, user.username, user.email, user.role, user.departmentId, user.active)
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
});

router.get('/user/:id', auth, async (req, res) => {
  let user = {...req.params};

  if (!(user.userId)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  User.getUserById(user.userId)
    .then(response => {
      res.status(201).json({status: true});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
});

router.post('/users/:offset/:limit', auth, async (req, res) => {
  let params = {...req.params, ...req.body};

  if (!(params.offset && params.limit)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  User.getUsers(params.username, params.email, params.role, params.departmentId, params.name, params.status, params.offset, params.limit)
    .then(response => {
      res.status(201).json({status: true, data: response.map(item => {
        return {...item, key: item.id}
        })});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
});

router.post('/user/assign', auth, async (req, res) => {
  let params = {...req.body};

  if (!(params.userId && params.allegationId)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  User.assignUser(params.userId, params.allegationId)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
        if(req.user.role === roles.ADMINISTRATOR) {
          User.getUserById(params.userId)
            .then(response => {
              mail.sendMail(response[0].email, 'New Allegation was assigned to you',  emailTemplates.newAllegationAssigned(response[0].name, params.allegationId));
            })
            .catch(e => e);
        }
        if(res.user.role === roles.REVIEWER) {
          User.getUsersByRole(roles.ADMINISTRATOR)
            .then(response => {
              response.map(user => {
                mail.sendMail(user.email, 'New Allegation was assigned to you', emailTemplates.newAllegationAssigned(user.name, params.allegationId));
              })
            })
            .catch(e => e);
        }
      }else{
        res.status(400).send({status: false, msg: 'Nothing to update'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
});

router.post('/user/status', auth, async (req, res) => {
  let params = {...req.body};

  if (!(params.userId && params.status)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  User.changeStatus(params.userId, params.status)
    .then(response => {
      if(response.affectedRows > 0) {
        res.status(201).json({status: true});
      }else{
        res.status(400).send({status: false, msg: 'Nothing to update'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
});

module.exports = router
