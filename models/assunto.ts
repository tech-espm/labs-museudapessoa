import Sql = require("../infra/sql");

export = class Assunto {
	public id: number;
	public nome: string;
	public respostapadrao: string;
	public criacao: string;

	private static validar(a: Assunto): string {
		if (!a)
			return "Assunto inválido";

		a.id = parseInt(a.id as any);
		if (isNaN(a.id) || a.id < 1 || a.id > 9999)
			return "Id inválido";

		a.nome = (a.nome || "").normalize().trim();
		if (a.nome.length < 3 || a.nome.length > 100)
			return "Nome inválido";

		a.respostapadrao = (a.respostapadrao || "").normalize().trim();
		if (a.respostapadrao.length > 10000)
			return "Resposta padrão inválida";

		return null;
	}

	public static listar(): Promise<Assunto[]> {
		return Sql.conectar(async (sql: Sql) => {
			return (await sql.query("select id, nome, date_format(criacao, '%d/%m/%Y') criacao from assunto order by nome asc")) as Assunto[] || [];
		});
	}

	public static obter(id: number): Promise<Assunto> {
		return Sql.conectar(async (sql: Sql) => {
			const lista = (await sql.query("select id, nome, respostapadrao, date_format(criacao, '%d/%m/%Y') from assunto where id = ?", [id])) as Assunto[];
			return (lista && lista[0]) || null;
		});
	}

	public static criar(a: Assunto): Promise<string> {
		const erro = Assunto.validar(a);
		if (erro)
			return Promise.resolve(erro);

		return Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into assunto (id, nome, respostapadrao, criacao) values (?, ?, ?, now())", [a.id, a.nome, a.respostapadrao]);
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

		return Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update assunto set nome = ?, respostapadrao = ? where id = ?", [a.nome, a.respostapadrao, a.id]);
				return (sql.linhasAfetadas ? null : "Assunto não encontrado");
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `O assunto ${a.nome} já existe`;
				throw e;
			}
		});
	}

	public static excluir(id: number): Promise<string> {
		return Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from assunto where id = ?", [id]);
			return (sql.linhasAfetadas ? null : "Assunto não encontrado");
		});
	}
};
