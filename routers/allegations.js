const express = require('express');
const Allegation = require('../model/allegations');
const auth = require('../middleware/auth');
const roles = require('../enums/roles');
const config = require('../config');
const fileUpload = require('express-fileupload');
const mime = require('mime-types');
const mail = require('../utils/mail');
const User = require('../model/user');
const crypto = require('crypto');
const emailTemplates = require('../utils/templates');
const allegationStatus = require('../enums/allegationStatus');
const router = new express.Router();

router.get('/download/:fileId', function (req, res) {
  const fileId = req.params.fileId;
  const file = `${__dirname}/../uploads/${fileId}`;
  res.download(file);
});

router.post('/allegation', async (req, res) => {
  let params = {...req.body};
  if (params.hasOwnProperty('allegationDate')) {
    const date = new Date(params.allegationDate);
    if (date) {
      params.allegationDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
  }
  if (params.hasOwnProperty('evidence')) {
    delete params.evidence;
  }
  const trackingId = crypto.createHash('md5').update(new Date().toISOString()).digest("hex").toUpperCase();
  params = {
    ...params,
    trackingId
  };

  Allegation.insertAllegation(params)
    .then(response => {
      if (response.affectedRows > 0) {
        const insertedId = response.insertId;
        res.status(201).json({status: true, data: response.insertId, trackingId});
        User.getUsersByRole(roles.ADMINISTRATOR)
          .then(response => {
            if (response.length > 0) {
              response.forEach(item => {
                mail.sendMail(item.email, 'New Allegation was added', emailTemplates.newAllegationAdded(item.name, insertedId));
              })
            }
          })
      } else {
        res.status(400).send({status: false, msg: 'Unknown error'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})

router.post('/allegations/:offset/:limit', auth, async (req, res) => {
  let params = {...req.body};

  if (!(req.params.offset && req.params.limit)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  if (params.hasOwnProperty('allegationDate')) {
    const date = new Date(params.allegationDate);
    if (date) {
      params.allegationDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
  }

  if (params.department) {
    delete params.department;
  }
  if (params.hasOwnProperty('dateFrom')) {
    if (params.dateFrom) {
      let dateFrom = new Date(params.dateFrom);
      if (dateFrom) {
        params.dateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
      }
    } else {
      delete params.dateFrom
    }
  }
  if (params.hasOwnProperty('dateTo')) {
    if (params.dateTo) {
      let dateTo = new Date(params.dateTo);
      if (dateTo) {
        params.dateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`;
      }
    } else {
      delete params.dateTo;
    }
  }

  if (req.user.role === roles.REVIEWER) {
    params = {
      ...params,
      assignee: req.user.id
    }
  }

  Allegation.getAllegations(params, req.params.offset, req.params.limit)
    .then(response => {
      response = response.map(item => {
        return {...item, key: item.id}
      })
      Allegation.getAllegationsCount(params, req.params.offset, req.params.limit)
        .then(countResponse => {
          res.status(201).json({status: true, data: response, count: countResponse[0].count});
        })
        .catch(e => {
          res.status(400).send({status: false, msg: e.message})
        })
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.get('/allegation/:id', auth, async (req, res) => {
  let params = {...req.params};

  if (!(req.params.id)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getSingleAllegation(params.id)
    .then(response => {
      if (response[0]) {
        if (response[0].fileUrl) {
          response[0].fileUrl = config.FILE_DIR + response[0].fileUrl;
        }
        res.status(201).json({status: true, data: response[0]});
      } else {
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.get('/allegation/history/:id', async (req, res) => {
  let params = {...req.params};

  if (!(req.params.id)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getAllegationHistory(params.id)
    .then(response => {
      response = response.map(item => {
        if (item.fileUrl) {
          item.fileUrl = config.FILE_DIR + item.fileUrl;
        }
        return item;
      })
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.get('/allegation/history/admin/:id', async (req, res) => {
  let params = {...req.params};

  if (!(req.params.id)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getAllegationHistoryAdmin(params.id)
    .then(response => {
      response = response.map(item => {
        if (item.fileUrl) {
          item.fileUrl = config.FILE_DIR + item.fileUrl;
        }
        return item;
      })
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.get('/allegation/note/:id', async (req, res) => {
  let params = {...req.params};

  if (!(req.params.id)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getAllegationNote(params.id)
    .then(response => {
      res.status(201).json({status: true, data: response});
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.get('/allegation/tracking/:id', async (req, res) => {
  let params = {...req.params};

  if (!(req.params.id)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }
  try {
    Allegation.getSingleAllegationByTrackingId(params.id)
      .then(response => {
        if (response[0]) {
          if (response[0].fileUrl) {
            response[0].fileUrl = config.FILE_DIR + response[0].fileUrl;
          }
          if (response[0].allegationDate) {
            const d = response[0].allegationDate;
            const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
            const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
            response[0].allegationDate = `${d.getFullYear()}-${month}-${day}`
          }
          res.status(201).json({status: true, data: response[0]});
        } else {
          res.status(400).send({status: false, msg: 'Allegation not found'})
        }
      })
      .catch(e => {
        res.status(400).send({status: false, msg: e.message})
      })
  } catch (e) {
    res.status(400).send({status: false, msg: e.message})
  }

})
router.post('/allegation/history/:allegationId', async (req, res) => {
  let params = {...req.params, ...req.body};

  if (!(params.allegationId && params.text)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.insertAllegationHistory(params.text, params.allegationId)
    .then(response => {
      if (response.affectedRows > 0) {
        res.status(201).json({status: true, insertId: response.insertId});
      } else {
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.post('/allegation/history/tracking/:trackingId', async (req, res) => {
  let params = {...req.params, ...req.body};

  if (!(params.trackingId && params.text)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getSingleAllegationByTrackingId(params.trackingId)
    .then(allegation => {

      if(allegation && allegation[0]) {
        const allegationId = allegation[0].id;
        Allegation.insertAllegationHistory(params.text, allegationId)
          .then(response => {
            if (response.affectedRows > 0) {
              res.status(201).json({status: true, insertId: response.insertId});
            } else {
              res.status(400).send({status: false, msg: 'Allegation not found'})
            }
          })
          .catch(e => {
            res.status(400).send({status: false, msg: e.message})
          })
      }else{
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.post('/allegation/history/admin/:allegationId', auth, async (req, res) => {
  let params = {...req.params, ...req.body};

  if (!(params.allegationId && params.text)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.insertAllegationHistory(params.text, params.allegationId, req.user.id)
    .then(response => {
      if (response.affectedRows > 0) {
        res.status(201).json({status: true, insertId: response.insertId});
      } else {
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.post('/allegation/note/:allegationId', auth, async (req, res) => {
  let params = {...req.params, ...req.body};
  if (params.allegationId === 'null' || !(params.allegationId && params.text)) {
    res.status(400).send({status: false, msg: 'All fields are required'});
    return;
  }

  Allegation.insertAllegationNote(params.text, params.allegationId, req.user.id)
    .then(response => {
      if (response.affectedRows > 0) {
        res.status(201).json({status: true, insertId: response.insertId});
      } else {
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.put('/allegation/:allegationId', auth, async (req, res) => {
  let params = {...req.params, ...req.body};

  if (!(params.allegationId && params.status)) {
    res.status(400).send({status: false, msg: 'All fields are required'})
  }

  Allegation.getSingleAllegation(params.allegationId)
    .then(allegations => {
      if (allegations && allegations.length > 0) {
        const allegation = allegations[0];
        Allegation.changeAllegationStatus(params.status, params.allegationId)
          .then(response => {
            if (response.affectedRows > 0) {
              res.status(201).json({status: true});
              User.getUsersByRole(roles.ADMINISTRATOR)
                .then(response => {
                  if (response.length > 0) {
                    response.forEach(item => {
                      mail.sendMail(item.email, 'Allegation status was changed',
                        emailTemplates.allegationStatusChanged(item.name, params.allegationId,
                          allegationStatus.getStatusTitle(allegation.status),
                          allegationStatus.getStatusTitle(params.status)));
                    })
                  }
                })
            } else {
              res.status(400).send({status: false, msg: 'Allegation not found'})
            }
          })
          .catch(e => {
            res.status(400).send({status: false, msg: e.message})
          })
      } else {
        res.status(400).send({status: false, msg: 'Allegation not found'})
      }
    })
    .catch(e => {
      res.status(400).send({status: false, msg: e.message})
    })
})
router.use(fileUpload({
  createParentPath: true
}));
router.post('/upload-file', async (req, res) => {
  try {
    if (!req.files || !req.files.file || !req.body.allegationId) {
      res.status(400).send({
        status: false,
        msg: 'File was not found'
      });
    } else {
      let file = req.files.file;
      let allegationId = req.body.allegationId;
      if (file.size > 20 * 1024 * 1024) {
        res.status(400).send({
          status: false,
          msg: 'File is too big'
        });
      }

      let extension = mime.extension(file.mimetype);
      if (!extension) {
        extension = 'zip';
      }
      file.mv('./uploads/' + file.md5 + '.' + extension);
      Allegation.uploadFile(file.name, file.mimetype, file.md5 + '.' + extension, file.size, allegationId)
        .then(response => {
          res.status(201).json({status: true});
        })
        .catch(e => {
          res.status(400).send({status: false, msg: e.message})
        })
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
router.post('/history/upload-file', async (req, res) => {
  try {
    if (!req.files || !req.files.file || !req.body.historyId) {
      res.status(400).send({
        status: false,
        msg: 'File was not found'
      });
    } else {
      let file = req.files.file;
      let historyId = req.body.historyId;
      if (file.size > 20 * 1024 * 1024) {
        res.status(400).send({
          status: false,
          msg: 'File is too big'
        });
      }

      let extension = mime.extension(file.mimetype);
      if (!extension) {
        extension = 'zip';
      }
      file.mv('./uploads/' + file.md5 + '.' + extension);
      Allegation.uploadHistoryFile(file.name, file.mimetype, file.md5 + '.' + extension, file.size, historyId)
        .then(response => {
          res.status(201).json({status: true});
        })
        .catch(e => {
          res.status(400).send({status: false, msg: e.message})
        })
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
module.exports = router;
