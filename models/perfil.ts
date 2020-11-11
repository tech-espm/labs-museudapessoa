import Sql = require("../infra/sql");

export = class Perfil {
	public id: number;
	public nome: string;

	public static listar(): Promise<Perfil[]> {
		return Sql.conectar(async (sql: Sql) => {
			return (await sql.query("select id, nome from perfil order by nome asc")) as Perfil[] || [];
		});
	}
};
