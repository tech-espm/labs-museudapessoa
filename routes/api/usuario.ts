import app = require("teem");
import jsonRes = require("../../utils/jsonRes");
import Usuario = require("../../models/usuario");

class UsuarioApiRoute {
	@app.http.post()
	public static async alterarPerfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
		if (!u)
			return;
		jsonRes(res, 400, await u.alterarPerfil(res, req.body.nome as string, req.body.senhaAtual as string, req.body.novaSenha as string));
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		res.json(await Usuario.listar());
	}

	public static async obter(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = parseInt(req.query["id"] as string);
		res.json(isNaN(id) ? null : await Usuario.obter(id));
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		u = req.body as Usuario;
		if (u)
			u.idperfil = parseInt(req.body.idperfil);
		jsonRes(res, 400, u ? await Usuario.criar(u) : "Dados inválidos");
	}

	@app.http.post()
	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = u.id;
		u = req.body as Usuario;
		if (u) {
			u.id = parseInt(req.body.id);
			u.idperfil = parseInt(req.body.idperfil);
		}
		jsonRes(res, 400, (u && !isNaN(u.id)) ? (id === u.id ? "Um usuário não pode alterar a si próprio" : await Usuario.alterar(u)) : "Dados inválidos");
	}

	@app.http.delete()
	public static async excluir(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = parseInt(req.query["id"] as string);
		jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : (id === u.id ? "Um usuário não pode excluir a si próprio" : await Usuario.excluir(id)));
	}

	public static async redefinirSenha(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = parseInt(req.query["id"] as string);
		jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : (id === u.id ? "Um usuário não pode redefinir sua própria senha" : await Usuario.redefinirSenha(id)));
	}
}

export = UsuarioApiRoute;
