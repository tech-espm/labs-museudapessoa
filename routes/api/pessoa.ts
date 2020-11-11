import express = require("express");
import wrap = require("express-async-error-wrapper");
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
	res.json(await Pessoa.obter(parseInt(req.query["id"])));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	const p = req.body as Pessoa,
		r = await Pessoa.criar(p);
	if (r)
		res.status(400).json(r);
	else
		res.json(p);
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	const p = req.body as Pessoa,
		r = await Pessoa.alterar(p);
	if (r)
		res.status(400).json(r);
	else
		res.json(p);
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	const r = await Pessoa.excluir(parseInt(req.query["id"]));
	if (r)
		res.status(400).json(r);
	else
		res.sendStatus(204);
}));

router.get("/iniciarConversa/:n?", wrap(async (req: express.Request, res: express.Response) => {
	res.json(await Pessoa.iniciarConversa(req.params["n"]));
}));

router.post("/enviarMensagem", wrap(async (req: express.Request, res: express.Response) => {
	const idconversa = req.query["idconversa"];
	const idpessoa = parseInt(req.query["idpessoa"]);
	const mensagem = ((req.body && req.body.mensagem) || "").toString().normalize().trim();
	if (!idconversa || isNaN(idpessoa) || idpessoa <= 0 || !mensagem)
		res.status(400).json("Dados inválidos");
	else
		res.json(await Pessoa.enviarMensagem(idconversa, idpessoa, mensagem));
}));

export = router;
