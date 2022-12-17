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
			res.render("pessoa/editar", { titulo: "Criar Pessoa", usuario: u, item: null });
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Pessoa = null;
			if (isNaN(id) || !(item = await Pessoa.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pessoa/editar", { titulo: "Editar Pessoa", usuario: u, item: item });
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pessoa/listar", { titulo: "Gerenciar Pessoas", layout: "layout-tabela", usuario: u, datatables: true, lista: await Pessoa.listar() });
	}

	public static async log(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pessoa/log", { titulo: "Log de Mensagens", layout: "layout-tabela", usuario: u, datatables: true, lista: await Pessoa.logMensagens() });
	}
}

export = PessoaRoute;
