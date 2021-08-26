import app = require("teem");
import MensagemInicial = require("../models/mensagemInicial");
import Usuario = require("../models/usuario");

class MensagemInicialRoute {
	public static async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("mensagemInicial/alterar", { titulo: "Editar Mensagem Inicial", usuario: u, item: await MensagemInicial.obter() });
	}
}

export = MensagemInicialRoute;
