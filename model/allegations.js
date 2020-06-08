const connection = require('../db/mysql');


const insertAllegation = async (params) => {
	const paramsArr = Object.keys(params).map((key) => {
		if (Array.isArray(params[key])) {
			return {
				key: key,
				value: `[${params[key].join(', ')}]`
			};
		}
		return {
			key: key,
			value: params[key]
		}
	});

	const formFields = paramsArr.map((item, index) => item.key);

	return new Promise((resolve, reject) => {
		connection.query(`
    insert into allegations (${formFields}) VALUES (${paramsArr.map((item, index) => '?')})`, [
			...paramsArr.map(item => item.value)
		], async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}
const getAllegations = async (params, offset, limit) => {
	let where = '';
	const paramsStr = Object.keys(params).map((key) => {
		let dateStr = ''
		if (key === 'dateFrom' && params.dateFrom) {
			dateStr += 'allegationDate>="' + params.dateFrom + '"';
		}
		if (key === 'dateTo' && params.dateTo) {
			if (dateStr) {
				dateStr += ' and '
			}
			dateStr += 'allegationDate<="' + params.dateTo + '"'
		}
		if (dateStr) {
			return dateStr
		}
		return key + '=' + params[key];
	}).join(' and ');

	if (paramsStr) {
		where = ' where ' + paramsStr;
	}

	return new Promise((resolve, reject) => {
		connection.query(`
    select a.*, u.id as userId, u.name as userName, d.name as departmentName, f.title as fileName, f.path as fileUrl from allegations a 
      left join users u on a.assignee=u.id
      left join departments d on u.departmentId=d.id 
      left join files f on a.id=f.allegationId
      ${where} order by id desc LIMIT ${offset}, ${limit}`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const getAllegationsCount = async (params) => {
	let where = '';
	const paramsStr = Object.keys(params).map((key) => {
		let dateStr = ''
		if (key === 'dateFrom') {
			dateStr += 'allegationDate>="' + params.dateFrom + '"';
		}
		if (key === 'dateTo') {
			if (dateStr) {
				dateStr += ' and '
			}
			dateStr += 'allegationDate<="' + params.dateTo + '"'
		}
		if (dateStr) {
			return dateStr
		}
		return key + '=' + params[key];
	}).join(' and ');

	if (paramsStr) {
		where = ' where ' + paramsStr;
	}

	return new Promise((resolve, reject) => {
		connection.query(`
    select count(a.id) as count from allegations a 
      left join users u on a.assignee=u.id
      left join departments d on u.departmentId=d.id 
      ${where}`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const getSingleAllegation = async (allegationId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    select a.*,  f.title as fileName, f.path as fileUrl from allegations a 
      left join files f on a.id=f.allegationId where a.id=${allegationId}`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const getAllegationHistory = async (trackingId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    select h.*, a.id, f.title as fileName, f.path as fileUrl, u.id as userId, u.name as userName from allegations a 
      left join history h on a.id=h.allegationId
      left join users u on h.userId=u.id
      left join files f on h.id=f.historyID where a.trackingId='${trackingId}'`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const getAllegationHistoryAdmin = async (allegationId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    select h.*, a.id, f.title as fileName, f.path as fileUrl, u.id as userId, u.name as userName from allegations a 
      left join history h on a.id=h.allegationId
      left join users u on h.userId=u.id
      left join files f on h.id=f.historyID where a.id='${allegationId}'`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const insertAllegationHistory = async (text, allegationId, userId = null) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    insert into history (text, allegationId, userId, createdAt)
      VALUES
        ('${text}', ${allegationId}, ${userId}, NOW())
    `, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const getSingleAllegationByTrackingId = async (trackingId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    select a.*,  f.title as fileName, f.path as fileUrl from allegations a 
      left join files f on a.id=f.allegationId where a.trackingId='${trackingId}'`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const uploadFile = async (title, mime, path, size, allegationId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    insert into files (title, mime, path, size, allegationId) VALUES ('${title}', '${mime}', '${path}', ${size}, ${allegationId})`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const uploadHistoryFile = async (title, mime, path, size, historyId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    insert into files (title, mime, path, size, historyId) VALUES ('${title}', '${mime}', '${path}', ${size}, ${historyId})`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

const changeAllegationStatus = async (status, allegationId) => {
	return new Promise((resolve, reject) => {
		connection.query(`
    update allegations set status=${status} where id=${allegationId}`, async (err, row, fields) => {
			if (err)
				return reject(err);
			resolve(row);
		});
	})
}

module.exports = {
	insertAllegation,
	getAllegations,
	getAllegationsCount,
	uploadFile,
	getSingleAllegation,
	changeAllegationStatus,
	getSingleAllegationByTrackingId,
  getAllegationHistory,
  insertAllegationHistory,
	uploadHistoryFile,
	getAllegationHistoryAdmin
}
