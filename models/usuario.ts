import app = require("teem");
import { randomBytes } from "crypto";
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");
import DataUtil = require("../utils/dataUtil");

export = class Usuario {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id: number;
	public login: string;
	public nome: string;
	public idperfil: number;
	public senha: string;
	public criacao: string;

	// Utilizados apenas através do cookie
	public admin: boolean;

	// Não estamos utilizando Usuario.cookie como middleware, porque existem muitas requests
	// que não precisam validar o usuário logado, e agora, é assíncrono...
	// http://expressjs.com/pt-br/guide/writing-middleware.html
	//public static cookie(req: app.Request, res: app.Response, next: Function): void {
	public static async cookie(req: app.Request, res: app.Response = null, admin: boolean = false): Promise<Usuario> {
		let cookieStr = req.cookies[appsettings.cookie] as string;
		if (!cookieStr || cookieStr.length !== 48) {
			if (res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return null;
		} else {
			let id = parseInt(cookieStr.substr(0, 8), 16) ^ appsettings.usuarioHashId;
			let usuario: Usuario = null;

			await app.sql.connect(async (sql) => {
				let rows = await sql.query("select id, login, nome, idperfil, token from usuario where id = ?", [id]);
				let row: any;

				if (!rows || !rows.length || !(row = rows[0]))
					return;

				let token = cookieStr.substring(16);

				if (!row.token || token !== (row.token as string))
					return;

				let u = new Usuario();
				u.id = id;
				u.login = row.login as string;
				u.nome = row.nome as string;
				u.idperfil = row.idperfil as number;
				u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

				usuario = u;
			});

			if (admin && usuario && usuario.idperfil !== Usuario.IdPerfilAdmin)
				usuario = null;
			if (!usuario && res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return usuario;
		}
	}

	private static gerarTokenCookie(id: number): [string, string] {
		let idStr = intToHex(id ^ appsettings.usuarioHashId);
		let idExtra = intToHex(0);
		let token = randomBytes(16).toString("hex");
		let cookieStr = idStr + idExtra + token;
		return [token, cookieStr];
	}

	public static async efetuarLogin(login: string, senha: string, res: app.Response): Promise<[string, Usuario]> {
		if (!login || !senha)
			return ["Usuário ou senha inválidos", null];

		let r: string = null;
		let u: Usuario = null;

		await app.sql.connect(async (sql) => {
			login = login.normalize().trim().toUpperCase();

			let rows = await sql.query("select id, nome, idperfil, senha from usuario where login = ?", [login]);
			let row: any;
			let ok: boolean;

			if (!rows || !rows.length || !(row = rows[0]) || !(ok = await GeradorHash.validarSenha(senha.normalize(), row.senha))) {
				r = "Usuário ou senha inválidos";
				return;
			}

			let [token, cookieStr] = Usuario.gerarTokenCookie(row.id);

			await sql.query("update usuario set token = ? where id = ?", [token, row.id]);

			u = new Usuario();
			u.id = row.id;
			u.login = login;
			u.nome = row.nome as string;
			u.idperfil = row.idperfil as number;
			u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

			res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});

		return [r, u];
	}

	public async efetuarLogout(res: app.Response): Promise<void> {
		await app.sql.connect(async (sql) => {
			await sql.query("update usuario set token = null where id = ?", [this.id]);

			res.cookie(appsettings.cookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});
	}

	public async alterarPerfil(res: app.Response, nome: string, senhaAtual: string, novaSenha: string): Promise<string> {
		nome = (nome || "").normalize().trim().toUpperCase();
		if (nome.length < 3 || nome.length > 100)
			return "Nome inválido";

		if (!!senhaAtual !== !!novaSenha || (novaSenha && novaSenha.length > 40))
			return "Senha inválida";

		let r: string = null;

		await app.sql.connect(async (sql) => {
			if (senhaAtual) {
				let hash = await sql.scalar("select senha from usuario where id = ?", [this.id]) as string;
				if (!await GeradorHash.validarSenha(senhaAtual.normalize(), hash)) {
					r = "Senha atual não confere";
					return;
				}

				hash = await GeradorHash.criarHash(novaSenha.normalize());

				let [token, cookieStr] = Usuario.gerarTokenCookie(this.id);

				await sql.query("update usuario set nome = ?, senha = ?, token = ? where id = ?", [nome, hash, token, this.id]);

				this.nome = nome;

				res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
			} else {
				await sql.query("update usuario set nome = ? where id = ?", [nome, this.id]);

				this.nome = nome;
			}
		});

		return r;
	}

	private static validar(u: Usuario): string {
		u.nome = (u.nome || "").normalize().trim().toUpperCase();
		if (u.nome.length < 3 || u.nome.length > 100)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Usuario[]> {
		let lista: Usuario[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Usuario[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Usuario> {
		let lista: Usuario[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, login, nome, idperfil, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Usuario[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validar(u)))
			return res;

		u.login = (u.login || "").normalize().trim().toUpperCase();
		if (u.login.length < 3 || u.login.length > 100)
			return "Login inválido";

		await app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into usuario (login, nome, idperfil, senha, criacao) values (?, ?, ?, ?, ?)", [u.login, u.nome, u.idperfil, appsettings.usuarioHashSenhaPadrao, DataUtil.horarioDeBrasiliaISOComHorario()]);
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							res = `O login ${u.login} já está em uso`;
							break;
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Perfil não encontrado";
							break;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});

		return res;
	}

	public static async alterar(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validar(u)))
			return res;

		if (u.id === Usuario.IdAdmin)
			return "Não é possível editar o usuário administrador principal";

		await app.sql.connect(async (sql) => {
			await sql.query("update usuario set nome = ?, idperfil = ? where id = ?", [u.nome, u.idperfil, u.id]);
			res = sql.affectedRows.toString();
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		if (id === Usuario.IdAdmin)
			return "Não é possível excluir o usuário administrador principal";

		let res: string = null;

		await app.sql.connect(async (sql) => {
			await sql.query("delete from usuario where id = ?", [id]);
			res = sql.affectedRows.toString();
		});

		return res;
	}

	public static async redefinirSenha(id: number): Promise<string> {
		let res: string = null;

		await app.sql.connect(async (sql) => {
			let login = await sql.scalar("select login from usuario where id = ?", [id]) as string;
			if (!login) {
				res = "0";
			} else {
				await sql.query("update usuario set token = null, senha = ? where id = ?", [appsettings.usuarioHashSenhaPadrao, id]);
				res = sql.affectedRows.toString();
			}
		});

		return res;
	}
}
