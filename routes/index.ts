﻿import app = require("teem");
import MensagemInicial = require("../models/mensagemInicial");
import Pessoa = require("../models/pessoa");
import Usuario = require("../models/usuario");

class IndexRoute {
	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/index", { layout: "layout-sem-form", titulo: "Dashboard", usuario: u });
	}

	@app.route.methodName("/assistente/:n?")
	public static async assistente(req: app.Request, res: app.Response) {
		res.render("index/assistente", {
			layout: "layout-assistente",
			info: await Pessoa.obterConversa(req.params["n"] || "")
		});
	}

	@app.http.all()
	public static async login(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			let mensagem: string = null;
	
			if (req.body.login || req.body.senha) {
				[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, res);
				if (mensagem)
					res.render("index/login", { layout: "layout-externo", mensagem: mensagem });
				else
					res.redirect(app.root + "/");
			} else {
				res.render("index/login", { layout: "layout-externo", mensagem: null });
			}
		} else {
			res.redirect(app.root + "/");
		}
	}

	public static async acesso(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/acesso", { titulo: "Sem Permissão", usuario: u });
	}

	public static async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/");
		else
			res.render("index/perfil", { titulo: "Meu Perfil", usuario: u });
	}

	public static async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await u.efetuarLogout(res);
		res.redirect(app.root + "/");
	}
}

export = IndexRoute;
