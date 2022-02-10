import app = require("teem");
import Assunto = require("../models/assunto");
import Pessoa = require("../models/pessoa");
import Usuario = require("../models/usuario");

class PessoaRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pessoa/alterar", { titulo: "Criar Pessoa", usuario: u, assuntos: await Assunto.listar(), item: null });
	}

	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Pessoa = null;
			if (isNaN(id) || !(item = await Pessoa.obter(id)))
				res.render("home/nao-encontrado", { usuario: u });
			else
				res.render("pessoa/alterar", { titulo: "Editar Pessoa", usuario: u, assuntos: await Assunto.listar(), item: item });
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pessoa/listar", { titulo: "Gerenciar Pessoas", usuario: u, lista: JSON.stringify(await Pessoa.listar()) });
	}

	public static async log(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pessoa/log", { titulo: "Log de Mensagens", usuario: u, lista: JSON.stringify(await Pessoa.logMensagens()) });
	}
}

export = PessoaRoute;
