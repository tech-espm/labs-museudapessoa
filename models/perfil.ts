import app = require("teem");

export = class Perfil {
	public id: number;
	public nome: string;

	public static listar(): Promise<Perfil[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome from perfil order by nome asc")) as Perfil[] || [];
		});
	}
};
