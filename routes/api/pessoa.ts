import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Pessoa = require("../../models/pessoa");
import Usuario = require("../../models/usuario");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Pessoa.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id"]);
	res.json(isNaN(id) ? null : await Pessoa.obter(id));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let p = req.body as Pessoa;
	if (p) {
		p.id = 0;
		p.feminino = parseInt(req.body.feminino);

		const r = await Pessoa.criar(p);
		if (r)
			jsonRes(res, 400, r);
		else
			res.json(p);
	} else {
		jsonRes(res, 400, "Dados inválidos");
	}
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let p = req.body as Pessoa;
	if (p) {
		p.id = parseInt(req.body.id);
		p.feminino = parseInt(req.body.feminino);

		const r = await Pessoa.alterar(p);
		if (r)
			jsonRes(res, 400, r);
		else
			res.json(p);
	} else {
		jsonRes(res, 400, "Dados inválidos");
	}
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id"]);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Pessoa.excluir(id));
}));

router.get("/iniciarConversa/:n?", wrap(async (req: express.Request, res: express.Response) => {
	res.json(await Pessoa.iniciarConversa(req.params["n"]));
}));

router.post("/enviarMensagem", wrap(async (req: express.Request, res: express.Response) => {
	const idconversa = req.query["idconversa"];
	const idpessoa = parseInt(req.query["idpessoa"]);
	const mensagem = ((req.body && req.body.mensagem) || "").toString().normalize().trim();
	if (!idconversa || isNaN(idpessoa) || idpessoa <= 0 || !mensagem) {
		jsonRes(res, 400, "Dados inválidos");
		return;
	}
	res.json(await Pessoa.enviarMensagem(idconversa, idpessoa, mensagem));
}));

export = router;
