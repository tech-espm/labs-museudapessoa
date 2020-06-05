import Sql = require("../infra/sql");
import Resposta = require("./resposta");

export = class Pessoa {
	public id: number;
	public nome: string;
	public feminino: number;
	public criacao: string;
	public respostas: Resposta[];

	private static validar(p: Pessoa): string {
		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 100)
			return "Nome inválido";
		if (isNaN(p.feminino) || p.feminino < 0 || p.feminino > 1)
			p.feminino = 1;
		if (!p.respostas)
			p.respostas = [];
		for (let i = p.respostas.length - 1; i >= 0; i--) {
			if (!p.respostas[i])
				return "Resposta inválida";
		}

		return null;
	}

	public static async listar(): Promise<Pessoa[]> {
		let lista: Pessoa[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, feminino, date_format(criacao, '%d/%m/%Y') criacao from pessoa order by nome asc")) as Pessoa[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Pessoa> {
		let lista: Pessoa[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, feminino, date_format(criacao, '%d/%m/%Y') criacao from pessoa where id = ?", [id])) as Pessoa[];

			if (lista && lista.length)
				lista[0].respostas = await Resposta.listar(sql, id);
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(p: Pessoa): Promise<string> {
		let res: string;
		if ((res = Pessoa.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("insert into pessoa (nome, feminino, criacao) values (?, ?, now())", [p.nome, p.feminino]);
				p.id = await sql.scalar("select last_insert_id()") as number;
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY") {
					res = `A pessoa ${p.nome} já existe`;
					return;
				} else {
					throw e;
				}
			}

			if (p.respostas) {
                for (let i = 0; i < p.respostas.length; i++) {
                    p.respostas[i].idpessoa = p.id;
					res = await Resposta.criar(sql, p.respostas[i]);
					if (res)
						return;
                }
            }

			await sql.commit();
		});

		return res;
	}

	public static async alterar(p: Pessoa): Promise<string> {
		let res: string;
		if ((res = Pessoa.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("update pessoa set nome = ?, feminino = ? where id = ?", [p.nome, p.feminino, p.id]);
				if (!sql.linhasAfetadas) {
					res = "Pessoa não encontrada";
					return;
				}
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY") {
					res = `A pessoa ${p.nome} já existe`;
					return;
				} else {
					throw e;
				}
			}

			const respostasExistentes = await sql.query("SELECT id FROM resposta WHERE idpessoa = ?", [p.id]) as Resposta[];

			const respostasNovas = p.respostas.slice();

            // Busca as respostas existentes para atualizar
            for (let e = 0; e < respostasExistentes.length; e++) {
                const idExistente = respostasExistentes[e].id;

                for (let n = 0; n < respostasNovas.length; n++) {
                    if (idExistente === respostasNovas[n].id) {
                        respostasNovas[n].idpessoa = p.id;
						res = await Resposta.alterar(sql, respostasNovas[n]);
						if (res)
							return;
                        respostasExistentes.splice(e, 1);
                        e--;
                        respostasNovas.splice(n, 1);
                        break;
                    }
                }
            }

            // Exclui as respostas antigas que não vieram no array novo
            for (let e = 0; e < respostasExistentes.length; e++)
                await Resposta.excluir(sql, respostasExistentes[e].id, p.id);

            // Cria as respostas novas
            for (let i = 0; i < respostasNovas.length; i++) {
                respostasNovas[i].idpessoa = p.id;
				res = await Resposta.criar(sql, respostasNovas[i]);
				if (res)
					return;
            }

			await sql.commit();
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from pessoa where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};
