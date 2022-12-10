// Se o projeto não compilar, pelo erro Cannot find name 'File', precisa
// acrescentar a lib DOM ao array compilerOptions.lib no arquivo tsconfig.json
//Essa é a dependência que deve ser colocada no package.json: "ibm-watson": "6.1.1"
//import AssistantV2 = require("ibm-watson/assistant/v2");
//import { IamAuthenticator } from "ibm-watson/auth";
import app = require("teem");
import appsettings = require("../appsettings");
import ajustarNome = require("../utils/ajustarNome");
import DataUtil = require("../utils/dataUtil");

interface AssuntoPessoa {
	codpergunta: string;
	pergunta: string;
	resposta: string;
}

interface Pessoa {
	id: number;
	nome: string;
	nomeajustado: string;
	feminino: number;
	criacao: string;
	versaoimagem: number;
	corfundo: string;
	corbotao: string;
	cortextobotao: string;
	htmlmensagem: string;
	htmlinicial: string;
	boasvindas: string;

	// Não vem da tela, só do banco
	jsonassuntos: string;
	assuntos: AssuntoPessoa[];

	// Não vem do banco, só da tela
	codpergunta: string[];
	pergunta: string[];
	resposta: string[];
}

class Pessoa {
	private static ultimoIdConversa = 0;

	private static validar(p: Pessoa, criacao: boolean): string | null {
		if (!p)
			return "Pessoa inválida";

		if (!criacao) {
			if (isNaN(p.id = parseInt(p.id as any)))
				return "Id inválido";
		}

		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 100)
			return "Nome inválido";
		if (p.nome.indexOf("+") >= 0)
			return "Nome não pode conter o caracter +";

		p.nomeajustado = ajustarNome(p.nome);

		p.feminino = parseInt(p.feminino as any);
		if (isNaN(p.feminino) || p.feminino < 0 || p.feminino > 1)
			p.feminino = 1;

		p.corfundo = (p.corfundo || "").normalize().trim();
		if (p.corfundo.length !== 7)
			return "Cor do fundo inválida";

		p.corbotao = (p.corbotao || "").normalize().trim();
		if (p.corbotao.length !== 7)
			return "Cor do botão inválida";

		p.cortextobotao = (p.cortextobotao || "").normalize().trim();
		if (p.cortextobotao.length !== 7)
			return "Cor do fundo inválida";

		p.htmlmensagem = (p.htmlmensagem || "").normalize().trim();
		if (!p.htmlmensagem)
			return "Mensagem inválida";

		p.htmlinicial = (p.htmlinicial || "").normalize().trim();
		if (!p.htmlinicial)
			return "Texto inicial inválido";

		if (!p.codpergunta)
			return "Códigos de pergunta faltando";

		if (!p.pergunta)
			return "Perguntas faltando";

		if (!p.resposta)
			return "Respostas faltando";

		if (!Array.isArray(p.codpergunta))
			p.codpergunta = [p.codpergunta as any];

		if (!Array.isArray(p.pergunta))
			p.pergunta = [p.pergunta as any];

		if (!Array.isArray(p.resposta))
			p.resposta = [p.resposta as any];

		if (p.codpergunta.length !== p.pergunta.length || p.codpergunta.length !== p.resposta.length)
			return "Quantidades diferentes de códigos de pergunta, perguntas e respostas";

		let assuntos: AssuntoPessoa[] = [];

		for (let i = 0; i < p.codpergunta.length; i++) {
			p.codpergunta[i] = (p.codpergunta[i] || "").normalize().trim();
			if (!p.codpergunta[i] || p.codpergunta[i].length > 45)
				return `Código da pergunta ${(i + 1)} inválido`;

			p.pergunta[i] = (p.pergunta[i] || "").normalize().trim();
			if (!p.pergunta[i] || p.pergunta[i].length > 250)
				return `Pergunta ${(i + 1)} inválida`;

			p.resposta[i] = (p.resposta[i] || "").normalize().trim();
			if (!p.resposta[i] || p.resposta[i].length > 65000)
				return `Resposta ${(i + 1)} inválida`;

			assuntos.push({
				codpergunta: p.codpergunta[i],
				pergunta: p.pergunta[i],
				resposta: p.resposta[i]
			});
		}

		p.jsonassuntos = JSON.stringify(assuntos);

		p.boasvindas = (p.boasvindas || "").normalize().trim();
		if (!p.boasvindas || p.boasvindas.length > 65000)
			return "Mensagem de boas vindas inválida";

		return null;
	}

	public static listar(): Promise<Pessoa[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome, nomeajustado, feminino, date_format(criacao, '%d/%m/%Y') criacao, versaoimagem from pessoa order by nome asc")) as Pessoa[] || [];
		});
	}

	public static obter(id: number): Promise<Pessoa | null> {
		return app.sql.connect(async (sql) => {
			const lista = (await sql.query("select id, nome, nomeajustado, feminino, versaoimagem, corfundo, corbotao, cortextobotao, htmlmensagem, htmlinicial, jsonassuntos, boasvindas from pessoa where id = ?", [id])) as Pessoa[];

			if (lista && lista.length) {
				lista[0].assuntos = JSON.parse(lista[0].jsonassuntos);
				return lista[0];
			}

			return null;
		});
	}

	public static criar(p: Pessoa, fundo: app.UploadedFile | null, avatar: app.UploadedFile | null, imagem: app.UploadedFile | null): Promise<string | null> {
		const erro = Pessoa.validar(p, true);
		if (erro)
			return Promise.resolve(erro);

		if (!fundo)
			return Promise.resolve("Fundo faltando");
		if (fundo.mimetype !== "image/jpeg" && fundo.mimetype !== "image/png")
			return Promise.resolve("Fundo com tipo inválido (deve ser uma imagem PNG ou JPEG)");
		if (fundo.buffer.length > 1024 * 1024)
			return Promise.resolve("O fundo deve ter no máximo 1024 KB");

		if (!avatar)
			return Promise.resolve("Avatar faltando");
		if (avatar.mimetype !== "image/jpeg" && avatar.mimetype !== "image/png")
			return Promise.resolve("Avatar com tipo inválido (deve ser uma imagem PNG ou JPEG)");
		if (avatar.buffer.length > 512 * 1024)
			return Promise.resolve("O avatar deve ter no máximo 512 KB");

		if (!imagem)
			return Promise.resolve("Imagem faltando");
		if (imagem.mimetype !== "image/jpeg" && imagem.mimetype !== "image/png")
			return Promise.resolve("Imagem com tipo inválido (deve ser uma imagem PNG ou JPEG)");
		if (imagem.buffer.length > 512 * 1024)
			return Promise.resolve("A imagem deve ter no máximo 512 KB");

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("insert into pessoa (nome, nomeajustado, feminino, criacao, versaoimagem, corfundo, corbotao, cortextobotao, htmlmensagem, htmlinicial, jsonassuntos, boasvindas) values (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)", [p.nome, p.nomeajustado, p.feminino, DataUtil.horarioDeBrasiliaISOComHorario(), p.corfundo, p.corbotao, p.cortextobotao, p.htmlmensagem, p.htmlinicial, p.jsonassuntos, p.boasvindas]);
				p.id = await sql.scalar("select last_insert_id()") as number;
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `A pessoa ${p.nome} já existe`;
				throw e;
			}

			await app.fileSystem.saveUploadedFile(`public/img/pessoa/fundo${p.id}.jpg`, fundo);
			await app.fileSystem.saveUploadedFile(`public/img/pessoa/avatar${p.id}.jpg`, avatar);
			await app.fileSystem.saveUploadedFile(`public/img/pessoa/imagem${p.id}.jpg`, imagem);

			await sql.commit();

			return null;
		});
	}

	public static alterar(p: Pessoa, fundo?: app.UploadedFile | null, avatar?: app.UploadedFile | null, imagem?: app.UploadedFile | null): Promise<string | null> {
		const erro = Pessoa.validar(p, false);
		if (erro)
			return Promise.resolve(erro);

		if (fundo) {
			if (fundo.mimetype !== "image/jpeg" && fundo.mimetype !== "image/png")
				return Promise.resolve("Fundo com tipo inválido (deve ser uma imagem PNG ou JPEG)");
			if (fundo.buffer.length > 1024 * 1024)
				return Promise.resolve("O fundo deve ter no máximo 1024 KB");
		}

		if (avatar) {
			if (avatar.mimetype !== "image/jpeg" && avatar.mimetype !== "image/png")
				return Promise.resolve("Avatar com tipo inválido (deve ser uma imagem PNG ou JPEG)");
			if (avatar.buffer.length > 512 * 1024)
				return Promise.resolve("O avatar deve ter no máximo 512 KB");
		}

		if (imagem) {
			if (imagem.mimetype !== "image/jpeg" && imagem.mimetype !== "image/png")
				return Promise.resolve("Imagem com tipo inválido (deve ser uma imagem PNG ou JPEG)");
			if (imagem.buffer.length > 512 * 1024)
				return Promise.resolve("A imagem deve ter no máximo 512 KB");
		}

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("update pessoa set nome = ?, nomeajustado = ?, feminino = ?, corfundo = ?, corbotao = ?, cortextobotao = ?, htmlmensagem = ?, htmlinicial = ?, jsonassuntos = ?, boasvindas = ?" + ((fundo || avatar || imagem) ? ", versaoimagem = versaoimagem + 1" : "") + " where id = ?", [p.nome, p.nomeajustado, p.feminino, p.corfundo, p.corbotao, p.cortextobotao, p.htmlmensagem, p.htmlinicial, p.jsonassuntos, p.boasvindas, p.id]);
				if (!sql.affectedRows)
					return "Pessoa não encontrada";
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `A pessoa ${p.nome} já existe`;
				throw e;
			}

			if (fundo)
				await app.fileSystem.saveUploadedFile(`public/img/pessoa/fundo${p.id}.jpg`, fundo);
			if (avatar)
				await app.fileSystem.saveUploadedFile(`public/img/pessoa/avatar${p.id}.jpg`, avatar);
			if (imagem)
				await app.fileSystem.saveUploadedFile(`public/img/pessoa/imagem${p.id}.jpg`, imagem);

			await sql.commit();

			return null;
		});
	}

	public static excluir(id: number): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			await sql.query("delete from pessoa where id = ?", [id]);

			if (!sql.affectedRows)
				return "Pessoa não encontrada";

			await app.fileSystem.deleteFile(`public/img/pessoa/fundo${id}.jpg`);
			await app.fileSystem.deleteFile(`public/img/pessoa/avatar${id}.jpg`);
			await app.fileSystem.deleteFile(`public/img/pessoa/imagem${id}.jpg`);

			await sql.commit();

			return null;
		});
	}

	public static obterConversa(nomepessoa: string): Promise<{ pessoa: Pessoa, idconversa: string }> {
		return app.sql.connect(async (sql) => {
			if (nomepessoa)
				nomepessoa = nomepessoa.normalize().trim().toLowerCase().replace(/\+/g, " ");

			// Novo requisito: não teremos mais chat aleatório
			if (!nomepessoa)
				nomepessoa = "mani";

			let ids: { id: number }[] = null;

			if (nomepessoa)
				ids = (await sql.query("select id from pessoa where nomeajustado = ?", [nomepessoa])) as Pessoa[];

			let idpessoa: number;

			if (!ids || !ids.length) {
				ids = (await sql.query("select id from pessoa order by id asc")) as Pessoa[];
				const i = ((Math.random() * ids.length * 100) | 0) % ids.length;
				idpessoa = ids[i].id;
			} else {
				idpessoa = ids[0].id;
			}

			// Os ids só repetirão se ocorrerem mais de 16 requisições no mesmo milissegundo,
			// e se o Math.random() ficar igual. Pode acontecer, mas a chance é bem pequena!

			// Como não é multithread, fica mais fácil incrementar esse id!
			Pessoa.ultimoIdConversa = (Pessoa.ultimoIdConversa + 1) & 15;

			let agora = (new Date()).getTime(),
				temp = agora,
				idconversa = BigInt(((Math.random() * 16) << 4) | Pessoa.ultimoIdConversa),
				_256 = BigInt(256);

			// Não pode usar |, ~ e & porque vira 32 bits, e agora e temp são maiores do que 32 bits...
			// Um jeito meio simples de contar bytes.... Tem jeitos melhores! :)
			while (temp > 0) {
				idconversa *= _256;
				temp = Math.trunc(temp / 256);
			}
			idconversa += BigInt(agora);

			return {
				pessoa: await Pessoa.obter(idpessoa),
				idconversa: idconversa.toString(16)
			};
		});
	}

	public static logarMensagem(idpessoa: number, idconversa: bigint, codpergunta: string): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			await sql.query("insert into conversalogindividual (idpessoa, idconversa, codpergunta, criacao) values (?, ?, ?, ?)", [idpessoa, idconversa, codpergunta, DataUtil.horarioDeBrasiliaISOComHorario()]);
			return null;
		});
	}

	public static logMensagens(): Promise<any[]> {
		return app.sql.connect(async (sql) => {
			return await sql.query("select p.nome pessoa, hex(l.idconversa) idconversa, l.codpergunta, date_format(l.criacao, '%d/%m/%Y %H:%i') criacao from conversalogindividual l left join pessoa p on p.id = l.idpessoa");
		});
	}
}

export = Pessoa;
