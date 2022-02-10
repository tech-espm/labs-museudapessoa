import app = require("teem");

require("dotenv").config({ encoding: "utf8", path: app.currentDirectoryName() + "/../.env" });

export = {
	root: process.env.app_root,
	cookie: process.env.app_cookie,
	cookieSecure: !!JSON.parse(process.env.app_cookieSecure),
    port: parseInt(process.env.app_port),
	sqlPool: {
		connectionLimit: parseInt(process.env.app_sqlPool_connectionLimit),
		charset: process.env.app_sqlPool_charset,
		host: process.env.app_sqlPool_host,
		port: parseInt(process.env.app_sqlPool_port),
		user: process.env.app_sqlPool_user,
		password: process.env.app_sqlPool_password,
		database: process.env.app_sqlPool_database,
		supportBigNumbers: true,
		bigNumberStrings: true
	},
	usuarioHashSenhaPadrao: process.env.app_usuarioHashSenhaPadrao,
	usuarioHashId: parseInt(process.env.app_usuarioHashId, 16),
	serviceCredentials: {
		apikey: process.env.app_serviceCredentials_apikey,
		iam_apikey_description: process.env.app_serviceCredentials_iam_apikey_description,
		iam_apikey_name: process.env.app_serviceCredentials_iam_apikey_name,
		iam_role_crn: process.env.app_serviceCredentials_iam_role_crn,
		iam_serviceid_crn: process.env.app_serviceCredentials_iam_serviceid_crn,
		url: process.env.app_serviceCredentials_url
	},
	assistantVersion: process.env.app_assistantVersion,
	assistantName: process.env.app_assistantName,
	assistantId: process.env.app_assistantId,
	assistantUrl: process.env.app_assistantUrl
};
