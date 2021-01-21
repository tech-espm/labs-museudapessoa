import app = require("teem");
import Assunto = require("../models/assunto");
import Usuario = require("../models/usuario");

class AssuntoRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("assunto/alterar", { titulo: "Criar Assunto", usuario: u, item: null });
	}

	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Assunto = null;
			if (isNaN(id) || !(item = await Assunto.obter(id)))
				res.render("home/nao-encontrado", { usuario: u });
			else
				res.render("assunto/alterar", { titulo: "Editar Assunto", usuario: u, item: item });
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("assunto/listar", { titulo: "Gerenciar Assuntos", usuario: u, lista: JSON.stringify(await Assunto.listar()) });
	}
}

export = AssuntoRoute;
