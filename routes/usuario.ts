﻿import app = require("teem");
import Perfil = require("../models/perfil");
import Usuario = require("../models/usuario");

class UsuarioRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("usuario/editar", { titulo: "Criar Usuário", usuario: u, item: null, perfis: await Perfil.listar() });
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Usuario = null;
			if (isNaN(id) || !(item = await Usuario.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("usuario/editar", { titulo: "Editar Usuário", usuario: u, item: item, perfis: await Perfil.listar() });
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("usuario/listar", {
				titulo: "Gerenciar Usuários",
				layout: "layout-tabela",
				usuario: u,
				datatables: true,
				xlsx: true,
				lista: await Usuario.listar()
			});
	}
}

export = UsuarioRoute;
