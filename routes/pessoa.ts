import express = require("express");
import wrap = require("express-async-error-wrapper");
import Assunto = require("../models/assunto");
import Pessoa = require("../models/pessoa");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("pessoa/alterar", { titulo: "Criar Pessoa", usuario: u, assuntos: await Assunto.listar(), item: null });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"]);
		let item: Pessoa = null;
		if (isNaN(id) || !(item = await Pessoa.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("pessoa/alterar", { titulo: "Editar Pessoa", usuario: u, assuntos: await Assunto.listar(), item: item });
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("pessoa/listar", { titulo: "Gerenciar Pessoas", usuario: u, lista: JSON.stringify(await Pessoa.listar()) });
}));

export = router;
