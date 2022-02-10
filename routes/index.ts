import app = require("teem");
import MensagemInicial = require("../models/mensagemInicial");
import Pessoa = require("../models/pessoa");
import Usuario = require("../models/usuario");

class IndexRoute {
	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("home/dashboard", { titulo: "Dashboard", usuario: u });
	}

	@app.route.methodName("/chat/:n?")
	public static async chat(req: app.Request, res: app.Response) {
		res.render("home/chat", {
			layout: "layout-externo",
			nomepessoa: (req.params["n"] || ""),
			mensagem: await MensagemInicial.obter(),
			pessoa: await Pessoa.obterConversa(req.params["n"] || "")
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
					res.render("home/login", { layout: "layout-externo", mensagem: mensagem });
				else
					res.redirect(app.root + "/");
			} else {
				res.render("home/login", { layout: "layout-externo", mensagem: null });
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
			res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
	}

	public static async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/");
		else
			res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
	}

	public static async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await u.efetuarLogout(res);
		res.redirect(app.root + "/");
	}
}

export = IndexRoute;
