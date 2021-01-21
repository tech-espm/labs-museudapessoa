import app = require("teem");
import Assunto = require("../../models/assunto");
import Usuario = require("../../models/usuario");

class AssuntoApiRoute {
	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		res.json(await Assunto.listar());
	}

	public static async obter(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		res.json(await Assunto.obter(parseInt(req.query["id"] as string)));
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		const r = await Assunto.criar(req.body as Assunto);
		if (r)
			res.status(400).json(r);
		else
			res.sendStatus(204);
	}

	@app.http.post()
	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		const r = await Assunto.alterar(req.body as Assunto);
		if (r)
			res.status(400).json(r);
		else
			res.sendStatus(204);
	}

	public static async excluir(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		const r = await Assunto.excluir(parseInt(req.query["id"] as string));
		if (r)
			res.status(400).json(r);
		else
			res.sendStatus(204);
	}
}

export = AssuntoApiRoute;
