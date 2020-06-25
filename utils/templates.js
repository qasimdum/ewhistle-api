const config = require('../config');

const newAllegationAdded = (user, allegationId) => {
  return `
    <p>Dear ${user}</p>
    <p>A new whistleblowing allegation has been submitted into the E-Whistle platform. Please log in using the link below to take further action.</p>
    <p>Allegation link - ${config.FRONTEND_URL}allegations/${allegationId}</p>
    <p>Kind regards,<br />E-Whistle Platform</p>
  `
};

const newAllegationAssigned = (user, allegationId) => {
  return `
    <p>Dear ${user}</p>
    <p>A new whistleblowing allegation has been assigned to you by the administrator of E-Whistle. Please log in using the link below to take further action.</p>
    <p>Allegation link - ${config.FRONTEND_URL}allegations/${allegationId}</p>
    <p>Kind regards,<br />E-Whistle Platform</p>
  `
};

const allegationStatusChanged = (user, allegationId, oldStatus, newStatus) => {
  return `
    <p>Dear ${user}</p>
    <p>The status of allegation #${allegationId} has changed from ${oldStatus} to ${newStatus}. Please log into the E-Whistle platform to take further action if required.</p>
    <p>Kind regards,<br />E-Whistle Platform</p>
  `
};

module.exports = {newAllegationAdded, newAllegationAssigned, allegationStatusChanged};
