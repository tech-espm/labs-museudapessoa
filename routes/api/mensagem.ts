import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Mensagem = require("../../models/mensagem");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.get("/iniciarConversa", wrap(async (req: express.Request, res: express.Response) => {
	// @@@ retornar o id da conversa e o nome + id da pessoa
	//let u = await Usuario.cookie(req, res, true);
	//if (!u)
	//	return;
	//res.json(await Perfil.listar());
}));

router.get("/enviar", wrap(async (req: express.Request, res: express.Response) => {
	// @@@ pegar o id da conversa da query string + id da pessoa da query string
	//let u = await Usuario.cookie(req, res, true);
	//if (!u)
	//	return;
	//res.json(await Perfil.listar());
}));

export = router;
