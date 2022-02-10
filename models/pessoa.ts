// Se o projeto não compilar, pelo erro Cannot find name 'File', precisa
// acrescentar a lib DOM ao array compilerOptions.lib no arquivo tsconfig.json
//Essa é a dependência que deve ser colocada no package.json: "ibm-watson": "6.1.1"
//import AssistantV2 = require("ibm-watson/assistant/v2");
//import { IamAuthenticator } from "ibm-watson/auth";
import app = require("teem");
import appsettings = require("../appsettings");
import Assunto = require("./assunto");
import Resposta = require("./resposta");
import ajustarNome = require("../utils/ajustarNome");
import DataUtil = require("../utils/dataUtil");

export = class Pessoa {
	private static ultimoIdConversa = 0;

	public id: number;
	public nome: string;
	public nomeajustado: string;
	public feminino: number;
	public criacao: string;
	public respostas: Resposta[];

	private static validar(p: Pessoa): string {
		if (!p)
			return "Pessoa inválida";

		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 100)
			return "Nome inválido";
		if (p.nome.indexOf("+") >= 0)
			return "Nome não pode conter o caracter +";

		p.nomeajustado = ajustarNome(p.nome);

		p.feminino = parseInt(p.feminino as any);
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

	public static listar(): Promise<Pessoa[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome, nomeajustado, feminino, date_format(criacao, '%d/%m/%Y') criacao from pessoa order by nome asc")) as Pessoa[] || [];
		});
	}

	public static obter(id: number): Promise<Pessoa> {
		return app.sql.connect(async (sql) => {
			const lista = (await sql.query("select id, nome, nomeajustado, feminino, date_format(criacao, '%d/%m/%Y') criacao from pessoa where id = ?", [id])) as Pessoa[];

			if (lista && lista.length) {
				lista[0].respostas = await Resposta.listar(sql, id);
				return lista[0];
			}

			return null;
		});
	}

	public static criar(p: Pessoa): Promise<string> {
		const erro = Pessoa.validar(p);
		if (erro)
			return Promise.resolve(erro);

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("insert into pessoa (nome, nomeajustado, feminino, criacao) values (?, ?, ?, ?)", [p.nome, p.nomeajustado, p.feminino, DataUtil.horarioDeBrasiliaISOComHorario()]);
				p.id = await sql.scalar("select last_insert_id()") as number;
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `A pessoa ${p.nome} já existe`;
				throw e;
			}

			if (p.respostas) {
                for (let i = 0; i < p.respostas.length; i++) {
                    p.respostas[i].idpessoa = p.id;
					const erro = await Resposta.criar(sql, p.respostas[i]);
					if (erro)
						return erro;
                }
            }

			await sql.commit();

			return null;
		});
	}

	public static alterar(p: Pessoa): Promise<string> {
		const erro = Pessoa.validar(p);
		if (erro)
			return Promise.resolve(erro);

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("update pessoa set nome = ?, nomeajustado = ?, feminino = ? where id = ?", [p.nome, p.nomeajustado, p.feminino, p.id]);
				if (!sql.affectedRows)
					return "Pessoa não encontrada";
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `A pessoa ${p.nome} já existe`;
				throw e;
			}

			const respostasExistentes = await sql.query("SELECT id FROM resposta WHERE idpessoa = ?", [p.id]) as Resposta[];

			const respostasNovas = p.respostas.slice();

            // Busca as respostas existentes para atualizar
            for (let e = 0; e < respostasExistentes.length; e++) {
                const idExistente = respostasExistentes[e].id;

                for (let n = 0; n < respostasNovas.length; n++) {
                    if (idExistente === respostasNovas[n].id) {
                        respostasNovas[n].idpessoa = p.id;
						const erro = await Resposta.alterar(sql, respostasNovas[n]);
						if (erro)
							return erro;
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
				const erro = await Resposta.criar(sql, respostasNovas[i]);
				if (erro)
					return erro;
            }

			await sql.commit();

			return null;
		});
	}

	public static excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("delete from pessoa where id = ?", [id]);
			return (sql.affectedRows ? null : "Pessoa não encontrada");
		});
	}

	/*
	public static async iniciarConversa(nomepessoa: string): Promise<{ idconversa: string, idpessoa: number, nomepessoa: string, resposta: string }> {
		// Pega o idconversa da API da IBM, e a resposta da mensagem de boas vindas,
		// que deveria ser o id de um assunto...
		const assistant = new AssistantV2({
			version: appsettings.assistantVersion,
			authenticator: new IamAuthenticator({
				apikey: appsettings.serviceCredentials.apikey,
			}),
			url: appsettings.serviceCredentials.url,
		});
		const respostaSessao = await assistant.createSession({ assistantId: appsettings.assistantId });
		let idconversa = respostaSessao.result.session_id;
		// Como a conversa é simples, o diálogo só tem um nível de profundidade,
		// daria para utilizar a versão sem estado, mais simples???
		// https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#send-user-input-to-assistant-stateless
		// https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#send-user-input-to-assistant-stateful
		const respostaMensagem = await assistant.message({
			assistantId: appsettings.assistantId,
			sessionId: idconversa,
			input: { message_type: "text", text: "" }
		});
		let resposta = ((respostaMensagem.result && respostaMensagem.result.output && respostaMensagem.result.output.generic && respostaMensagem.result.output.generic[0] && (respostaMensagem.result.output.generic[0] as AssistantV2.RuntimeResponseGenericRuntimeResponseTypeText).text) || "");
		const respostaInt = parseInt(resposta);

		let idpessoa = 0;

		await app.sql.connect(async (sql) => {
			let lista: Pessoa[] = null;

			if (nomepessoa)
				nomepessoa = nomepessoa.normalize().trim().toLowerCase().replace(/\+/g, " ");

			// Novo requisito: não teremos mais chat aleatório
			if (!nomepessoa)
				nomepessoa = "mani";

			if (nomepessoa)
				lista = (await sql.query("select id, nome from pessoa where nomeajustado = ?", [nomepessoa])) as Pessoa[];

			if (!lista || !lista.length)
				lista = (await sql.query("select id, nome from pessoa order by id asc")) as Pessoa[];

			if (lista && lista.length) {
				const i = ((Math.random() * lista.length * 100) | 0) % lista.length;
				idpessoa = lista[i].id;
				nomepessoa = lista[i].nome;
				resposta = (isNaN(respostaInt) ? null : await sql.scalar("select texto from resposta where idpessoa = ? and idassunto = ?", [idpessoa, respostaInt]));
			}
		});

		return {
			idconversa: idconversa,
			idpessoa: idpessoa,
			nomepessoa: nomepessoa,
			resposta: resposta || (`Olá! Me chamo ${nomepessoa}. Vamos conversar? 😊`)
		};
	}

	public static async enviarMensagem(idconversa: string, idpessoa: number, mensagem: string): Promise<string> {
		// Envia a mensagem para a API da IBM, usando idconversa,
		// e pega a resposta, que deveria ser o id de um assunto...
		const assistant = new AssistantV2({
			version: appsettings.assistantVersion,
			authenticator: new IamAuthenticator({
				apikey: appsettings.serviceCredentials.apikey,
			}),
			url: appsettings.serviceCredentials.url,
		});
		// Como a conversa é simples, o diálogo só tem um nível de profundidade,
		// daria para utilizar a versão sem estado, mais simples???
		// https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#send-user-input-to-assistant-stateless
		// https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#send-user-input-to-assistant-stateful
		const respostaMensagem = await assistant.message({
			assistantId: appsettings.assistantId,
			sessionId: idconversa,
			input: { message_type: "text", text: mensagem }
		});
		const resposta = ((respostaMensagem.result && respostaMensagem.result.output && respostaMensagem.result.output.generic && respostaMensagem.result.output.generic[0] && (respostaMensagem.result.output.generic[0] as AssistantV2.RuntimeResponseGenericRuntimeResponseTypeText).text) || ""),
			respostaInt = parseInt(resposta);
		if (resposta && isNaN(respostaInt))
			return resposta;

		return ((!isNaN(respostaInt) && await app.sql.connect(async (sql) => {
			return (await sql.scalar("select texto from resposta where idpessoa = ? and idassunto = ?", [idpessoa, respostaInt]) ||
				await sql.scalar("select respostapadrao from assunto where id = ?", [respostaInt]) ||
				await sql.scalar("select texto from resposta where idpessoa = ? and idassunto = 1", [idpessoa]) ||
				await sql.scalar("select respostapadrao from assunto where id = 1"));
		})) || "Não sei o que dizer sobre isso 😥\nPoderia falar de novo, por favor, de outra forma? 😊");
	}
	*/

	public static obterConversa(nomepessoa: string): Promise<{ info: { id: number, nome: string, boasVindas: string, idconversa: string }, conversa: { id: number, pergunta: string, resposta: string }[] }> {
		return app.sql.connect(async (sql) => {
			if (nomepessoa)
				nomepessoa = nomepessoa.normalize().trim().toLowerCase().replace(/\+/g, " ");

			// Novo requisito: não teremos mais chat aleatório
			if (!nomepessoa)
				nomepessoa = "mani";

			let pessoas: { id: number, nome: string }[] = null;

			if (nomepessoa)
				pessoas = (await sql.query("select id, nome from pessoa where nomeajustado = ?", [nomepessoa])) as Pessoa[];

			let idpessoa: number;

			if (!pessoas || !pessoas.length) {
				pessoas = (await sql.query("select id, nome from pessoa order by id asc")) as Pessoa[];
				const i = ((Math.random() * pessoas.length * 100) | 0) % pessoas.length;
				idpessoa = pessoas[i].id;
				nomepessoa = pessoas[i].nome;
			} else {
				idpessoa = pessoas[0].id;
				nomepessoa = pessoas[0].nome;
			}

			let boasVindas: string = await sql.scalar("select texto from resposta where idpessoa = ? and idassunto = ?", [idpessoa, Assunto.IdAssuntoBoasVindas]);

			if (!boasVindas)
				boasVindas = await sql.scalar("select respostapadrao from assunto where id = ?", [Assunto.IdAssuntoBoasVindas]);

			const conversaPadrao: { id: number, pergunta: string, resposta: string }[] = await sql.query("select id, nome pergunta, respostapadrao resposta from assunto where visivel = 1 and respostapadrao is not null and length(respostapadrao) > 0");

			const conversaPessoa: { id: number, pergunta: string, resposta: string }[] = await sql.query("select a.id, a.nome pergunta, r.texto resposta from resposta r inner join assunto a on a.id = r.idassunto and a.visivel = 1 where r.idpessoa = ?", [idpessoa]);

			for (let i = conversaPadrao.length - 1; i >= 0; i--) {
				const p = conversaPadrao[i];

				let jaExiste = false;
				for (let j = conversaPessoa.length - 1; j >= 0; j--) {
					if (p.id === conversaPessoa[j].id) {
						jaExiste = true;
						break;
					}
				}

				if (!jaExiste)
					conversaPessoa.push(p);
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
				info: {
					id: idpessoa,
					nome: nomepessoa,
					boasVindas,
					idconversa: idconversa.toString(16)
				},
				conversa: conversaPessoa
			};
		});
	}

	public static logarMensagem(idpessoa: number, idassunto: number, idconversa: bigint): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("insert into conversalog (idpessoa, idassunto, idconversa, criacao) values (?, ?, ?, ?)", [idpessoa, idassunto, idconversa, DataUtil.horarioDeBrasiliaISOComHorario()]);
			return null;
		});
	}

	public static logMensagens(): Promise<any[]> {
		return app.sql.connect(async (sql) => {
			return await sql.query("select p.nome pessoa, a.nome assunto, hex(l.idconversa) idconversa, date_format(l.criacao, '%d/%m/%Y %H:%i') criacao from conversalog l inner join pessoa p on p.id = l.idpessoa inner join assunto a on a.id = l.idassunto");
		});
	}
};
