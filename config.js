const dotenv = require('dotenv');
dotenv.config();

const config = {
	FILE_DIR: process.env.UPLOAD_DIR, //`http://nodetest-env.eba-qtbcemjh.eu-central-1.elasticbeanstalk.com/download/`,
	FRONTEND_URL: process.env.FRONTEND_URL, //'http://iamana.s3-website.eu-central-1.amazonaws.com/'
}
module.exports = config;
