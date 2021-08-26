import app = require("teem");

export = class MensagemInicial {
	public static obter(): Promise<string> {
		return app.sql.connect(async (sql) => {
			return await sql.scalar("select texto from mensageminicial where id = 1");
		});
	}

	public static alterar(m: string): Promise<void> {
		return app.sql.connect(async (sql) => {
			await sql.query("update mensageminicial set texto = ? where id = 1", [(m || "").normalize().trim()]);
		});
	}
};
