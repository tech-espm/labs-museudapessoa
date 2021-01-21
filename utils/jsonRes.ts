import app = require("teem");

export = function jsonRes(res: app.Response, statusCodeFalha: number, resultado: string): void {
	let r: number;
	if (!resultado) {
		res.sendStatus(204);
	} else if (!isNaN(r = parseInt(resultado)) && r.toString() === resultado) {
		res.json(r);
	} else {
		res.statusCode = statusCodeFalha;
		res.json(resultado);
	}
}
