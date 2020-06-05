import Sql = require("../infra/sql");

export = class Resposta {
	public id: number;
	public idpessoa: number;
	public idassunto: number;
	public texto: string;
	public criacao: string;

	private static validar(r: Resposta): string {
		if (isNaN(r.idpessoa) || r.idpessoa <= 0)
			return "Pessoa inválida";
		if (isNaN(r.idassunto) || r.idassunto <= 0)
			return "Assunto inválido";
		r.texto = (r.texto || "").normalize().trim();
		if (r.texto.length < 3 || r.texto.length > 10000)
			return "Texto inválido";

		return null;
	}

	public static async listar(sql: Sql, idpessoa: number): Promise<Resposta[]> {
		const lista = (await sql.query("select r.id, r.idpessoa, r.idassunto, r.texto, date_format(r.criacao, '%d/%m/%Y') criacao from resposta r inner join assunto a on a.id = r.idassunto where r.idpessoa = ? order by a.nome asc", [idpessoa])) as Resposta[];

		return lista || [];
	}

	public static async criar(sql: Sql, r: Resposta): Promise<string> {
		let res: string;
		if ((res = Resposta.validar(r)))
			return res;

		try {
			await sql.query("insert into resposta (idpessoa, idassunto, texto, criacao) values (?, ?, ?, now())", [r.idpessoa, r.idassunto, r.texto]);
			r.id = await sql.scalar("select last_insert_id()") as number;
		} catch (e) {
			if (e.code) {
				switch (e.code) {
					case "ER_DUP_ENTRY":
						res = "Já existe uma resposta com este assunto para esta pessoa";
						break;
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						res = "Pessoa ou assunto não encontrado";
						break;
					default:
						throw e;
				}
			} else {
				throw e;
			}
		}

		return res;
	}

	public static async alterar(sql: Sql, r: Resposta): Promise<string> {
		let res: string;
		if ((res = Resposta.validar(r)))
			return res;

		try {
			await sql.query("update resposta set texto = ? where id = ? and idpessoa = ?", [r.texto, r.id, r.idpessoa]);
			if (!sql.linhasAfetadas.toString())
				res = "Resposta ou pessoa não encontrada";
		} catch (e) {
			if (e.code) {
				switch (e.code) {
					case "ER_DUP_ENTRY":
						res = "Já existe uma resposta com este assunto para esta pessoa";
						break;
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						res = "Pessoa ou assunto não encontrado";
						break;
					default:
						throw e;
				}
			} else {
				throw e;
			}
		}

		return res;
	}

	public static async excluir(sql: Sql, id: number, idpessoa: number): Promise<string> {
		await sql.query("delete from resposta where id = ? and idpessoa = ?", [id, idpessoa]);
		return sql.linhasAfetadas.toString();
	}
};
