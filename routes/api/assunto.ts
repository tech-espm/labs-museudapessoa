import express = require("express");
import wrap = require("express-async-error-wrapper");
import Assunto = require("../../models/assunto");
import Usuario = require("../../models/usuario");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Assunto.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Assunto.obter(parseInt(req.query["id"])));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	const r = await Assunto.criar(req.body as Assunto);
	if (r)
		res.status(400).json(r);
	else
		res.sendStatus(204);
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	const r = await Assunto.alterar(req.body as Assunto);
	if (r)
		res.status(400).json(r);
	else
		res.sendStatus(204);
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	const r = await Assunto.excluir(parseInt(req.query["id"]));
	if (r)
		res.status(400).json(r);
	else
		res.sendStatus(204);
}));

export = router;
