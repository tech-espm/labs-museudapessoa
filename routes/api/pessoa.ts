import app = require("teem");
import Pessoa = require("../../models/pessoa");
import Usuario = require("../../models/usuario");

class PessoaApiRoute {
	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		res.json(await Pessoa.listar());
	}

	public static async obter(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		res.json(await Pessoa.obter(parseInt(req.query["id"] as string)));
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		const p = req.body as Pessoa,
			r = await Pessoa.criar(p);
		if (r)
			res.status(400).json(r);
		else
			res.json(p);
	}

	@app.http.post()
	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		const p = req.body as Pessoa,
			r = await Pessoa.alterar(p);
		if (r)
			res.status(400).json(r);
		else
			res.json(p);
	}

	public static async excluir(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		const r = await Pessoa.excluir(parseInt(req.query["id"] as string));
		if (r)
			res.status(400).json(r);
		else
			res.sendStatus(204);
	}

	@app.route.methodName("/iniciarConversa/:n?")
	public static async iniciarConversa(req: app.Request, res: app.Response) {
		res.json(await Pessoa.iniciarConversa(req.params["n"]));
	}

	@app.http.post()
	public static async enviarMensagem(req: app.Request, res: app.Response) {
		const idconversa = req.query["idconversa"] as string;
		const idpessoa = parseInt(req.query["idpessoa"] as string);
		const mensagem = ((req.body && req.body.mensagem) || "").toString().normalize().trim();
		if (!idconversa || isNaN(idpessoa) || idpessoa <= 0 || !mensagem)
			res.status(400).json("Dados inválidos");
		else
			res.json(await Pessoa.enviarMensagem(idconversa, idpessoa, mensagem));
	}
}

export = PessoaApiRoute;
