import app = require("teem");
import DataUtil = require("../utils/dataUtil");

export = class Assunto {
	// Manter sincronizado com o arquivo sql/script.sql
	public static readonly IdAssuntoBoasVindas = 2;

	public id: number;
	public nome: string;
	public visivel: number;
	public respostapadrao: string;
	public criacao: string;

	private static validar(a: Assunto): string {
		if (!a)
			return "Assunto inválido";

		a.id = parseInt(a.id as any);
		if (isNaN(a.id) || a.id < 1 || a.id > 9999)
			return "Id inválido";

		a.nome = (a.nome || "").normalize().trim();
		if (a.nome.length < 3 || a.nome.length > 200)
			return "Nome inválido";

		a.visivel = parseInt(a.visivel as any);
		if (isNaN(a.visivel) || a.visivel < 0 || a.visivel > 1)
			return "Visibilidade inválida";

		a.respostapadrao = (a.respostapadrao || "").normalize().trim();
		if (a.respostapadrao.length > 10000)
			return "Resposta padrão inválida";

		return null;
	}

	public static listar(): Promise<Assunto[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome, visivel, date_format(criacao, '%d/%m/%Y') criacao from assunto order by nome asc")) as Assunto[] || [];
		});
	}

	public static obter(id: number): Promise<Assunto> {
		return app.sql.connect(async (sql) => {
			const lista = (await sql.query("select id, nome, visivel, respostapadrao, date_format(criacao, '%d/%m/%Y') from assunto where id = ?", [id])) as Assunto[];
			return (lista && lista[0]) || null;
		});
	}

	public static criar(a: Assunto): Promise<string> {
		const erro = Assunto.validar(a);
		if (erro)
			return Promise.resolve(erro);

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into assunto (id, nome, visivel, respostapadrao, criacao) values (?, ?, ?, ?, ?)", [a.id, a.nome, a.visivel, a.respostapadrao, DataUtil.horarioDeBrasiliaISOComHorario()]);
				return null;
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `O assunto ${a.nome} ou o id ${a.id} já existe`;
				throw e;
			}
		});
	}

	public static alterar(a: Assunto): Promise<string> {
		const erro = Assunto.validar(a);
		if (erro)
			return Promise.resolve(erro);

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("update assunto set nome = ?, visivel = ?, respostapadrao = ? where id = ?", [a.nome, a.visivel, a.respostapadrao, a.id]);
				return (sql.affectedRows ? null : "Assunto não encontrado");
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `O assunto ${a.nome} já existe`;
				throw e;
			}
		});
	}

	public static excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("delete from assunto where id = ?", [id]);
			return (sql.affectedRows ? null : "Assunto não encontrado");
		});
	}
};
