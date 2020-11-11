import mysql = require("mysql");
import SqlPool = require("./sqlPool");

export = class Sql {
	// https://www.npmjs.com/package/mysql

	private connection: any;
	private transacaoAberta: boolean;
	public linhasAfetadas: number;

	public static async conectar<T>(callback: (sql: Sql) => Promise<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			SqlPool.pool.getConnection((error: any, connection: any) => {
				if (error) {
					reject(error);
					return;
				}

				let sql = new Sql();
				sql.connection = connection;
				sql.transacaoAberta = false;
				sql.linhasAfetadas = 0;
				try {
					callback(sql)
						.then((value: T) => {
							if (sql.transacaoAberta) {
								sql.transacaoAberta = false;
								connection.rollback((error: any) => {
									connection.release();
									if (error)
										reject(error);
									else
										resolve(value);
								});
							} else {
								connection.release();
								resolve(value);
							}
						}, reason => {
							if (sql.transacaoAberta) {
								sql.transacaoAberta = false;
								connection.rollback((error: any) => {
									connection.release();
									if (error)
										reject(error);
									else
										reject(reason);
								});
							} else {
								connection.release();
								reject(reason);
							}
						});
				} catch (e) {
					if (sql.transacaoAberta) {
						sql.transacaoAberta = false;
						connection.rollback(error => {
							connection.release();
							if (error)
								reject(error);
							else
								reject(e);
						});
					} else {
						connection.release();
						reject(e);
					}
				}
			});
		});
	}

	public async query(queryStr: string, valores: any[] = null): Promise<any[]> {
		return new Promise<any[]>((resolve, reject) => {
			let terminar = (error: any, results: any, fields: any) => {
				if (error) {
					reject(error);
					return;
				}

				this.linhasAfetadas = parseInt(results.affectedRows);

				resolve(results as any[]);
			};

			if (valores)
				this.connection.query(queryStr, valores, terminar);
			else
				this.connection.query(queryStr, terminar);
		});
	}

	public async scalar(queryStr: string, valores: any[] = null): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let terminar = (error: any, results: any, fields: any) => {
				if (error) {
					reject(error);
					return;
				}

				this.linhasAfetadas = parseInt(results.affectedRows);

				let r: any;

				if (!results || !(r = results[0]))
					resolve(null);

				for (let i in r) {
					resolve(r[i]);
					return;
				}

				resolve(null);
			};

			if (valores)
				this.connection.query(queryStr, valores, terminar);
			else
				this.connection.query(queryStr, terminar);
		});
	}

	public async beginTransaction(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.transacaoAberta) {
				reject(new Error("Já existe uma transação aberta"));
				return;
			}

			this.connection.beginTransaction((error: any) => {
				if (error) {
					reject(error);
					return;
				}
				this.transacaoAberta = true;
				resolve();
			});
		});
	}

	public async commit(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.transacaoAberta) {
				resolve();
				return;
			}

			this.connection.commit((error: any) => {
				if (error) {
					reject(error);
					return;
				}
				this.transacaoAberta = false;
				resolve();
			});
		});
	}

	public async rollback(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.transacaoAberta) {
				resolve();
				return;
			}

			this.connection.rollback((error: any) => {
				if (error) {
					reject(error);
					return;
				}
				this.transacaoAberta = false;
				resolve();
			});
		});
	}
}
