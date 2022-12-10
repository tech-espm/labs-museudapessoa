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
	@app.route.formData()
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		const p = req.body as Pessoa,
			r = await Pessoa.criar(p, req.uploadedFiles.fundo, req.uploadedFiles.avatar, req.uploadedFiles.imagem);
		if (r)
			res.status(400).json(r);
		else
			res.json(p);
	}

	@app.http.post()
	@app.route.formData()
	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		const p = req.body as Pessoa,
			r = await Pessoa.alterar(p, req.uploadedFiles.fundo, req.uploadedFiles.avatar, req.uploadedFiles.imagem);
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

	//@app.route.methodName("/iniciarConversa/:n?")
	//public static async iniciarConversa(req: app.Request, res: app.Response) {
	//	res.json(await Pessoa.iniciarConversa(req.params["n"]));
	//}

	@app.http.post()
	public static async enviarMensagem(req: app.Request, res: app.Response) {
		const idpessoa = parseInt(req.body && req.body.idpessoa);
		const codpergunta: string = (req.body && req.body.codpergunta);

		let idconversa: bigint;
		try {
			idconversa = (req.body && req.body.idconversa) ? BigInt("0x" + req.body.idconversa) : BigInt(0);
		} catch (ex: any) {
			idconversa = BigInt(0);
		}

		if (isNaN(idpessoa) || idpessoa <= 0 || idconversa <= 0 || !codpergunta || codpergunta.length > 45)
			res.status(400).json("Dados inválidos");
		else
			res.json(await Pessoa.logarMensagem(idpessoa, idconversa, codpergunta));
	}
}

export = PessoaApiRoute;
