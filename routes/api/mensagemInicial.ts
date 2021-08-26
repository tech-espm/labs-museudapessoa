import app = require("teem");
import MensagemInicial = require("../../models/mensagemInicial");
import Usuario = require("../../models/usuario");

class MensagemInicialApiRoute {
	@app.http.post()
	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		await MensagemInicial.alterar(req.body && req.body.mensagem);
		res.sendStatus(204);
	}
}

export = MensagemInicialApiRoute;
