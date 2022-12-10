CREATE DATABASE IF NOT EXISTS museu DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE museu;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

INSERT INTO perfil (nome) VALUES ('ADMINISTRADOR'), ('COMUM');

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY login_UN (login),
  KEY idperfil_FK_idx (idperfil),
  CONSTRAINT idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (login, nome, idperfil, senha, token, criacao) VALUES ('ADMIN', 'ADMINISTRADOR', 1, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL, NOW());

-- DROP TABLE IF EXISTS assunto;
CREATE TABLE assunto (
  id int NOT NULL,
  nome varchar(200) NOT NULL,
  visivel tinyint NOT NULL,
  respostapadrao TEXT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

-- Manter sincronizado com o arquivo models/assunto.ts
-- O id do assunto de boas vindas deve ser 2!!!
INSERT INTO assunto (id, nome, visivel, respostapadrao, criacao) VALUES
(1, 'Assunto Desconhecido', 0, 'Me desculpe... Não sei o que dizer sobre isso 😥\r\nPor favor, poderia falar de novo, de outra forma?\r\n\r\nAqui estão alguns dos tópicos que talvez eu saiba alguma coisa:\r\n\r\n- Introdução sobre mim\r\n- Origem do meu nome\r\n- Brincadeiras\r\n- Broncas\r\n- Infância\r\n- Cidade natal\r\n- Educação\r\n- Gostos\r\n- Filhos\r\n- Idade / Ano de nascimento\r\n- Pais\r\n- Profissão\r\n- Músicas\r\n- Filmes\r\n\r\nAlém de informações sobre o Museu da Pessoa:\r\n\r\n- O que é o Museu\r\n- Contato com o Museu\r\n- Programa \"Conte Sua História\"\r\n- Apoio ao Museu / Voluntariado\r\n- Quantidade de histórias do Museu\r\n- Fundação do Museu\r\n- Programação do Museu\r\n- Redes sociais do Museu', NOW()),
(2, 'Boas vindas', 0, 'Olá, seja muito bem-vinde ao Museu da Pessoa! O que você gostaria de saber?', NOW()),
(3, 'Saudação', 1, 'Olá! Tudo bem? 😊', NOW()),
(4, 'Introdução / Sobre mim', 1, NULL, NOW()),
(5, 'Brincadeiras', 1, NULL, NOW()),
(6, 'Broncas', 1, NULL, NOW()),
(7, 'Infância', 1, NULL, NOW()),
(8, 'Cidade Natal', 1, NULL, NOW()),
(9, 'Educação', 1, NULL, NOW()),
(10, 'Gostos', 1, NULL, NOW()),
(11, 'Filhos', 1, NULL, NOW()),
(12, 'Idade / Ano de Nascimento', 1, NULL, NOW()),
(13, 'Pais', 1, NULL, NOW()),
(14, 'Profissão', 1, NULL, NOW()),
(15, 'Músicas', 1, NULL, NOW()),
(16, 'Filmes', 1, NULL, NOW()),
(17, 'Programa \"Conte Sua História\"', 1, 'O Museu possui um programa, chamado Conte Sua História, onde conduzimos entrevistas de história de vida, realizadas por pesquisadores do museu e gravadas através de videoconferência.\r\n\r\nO material registrado passa a fazer parte do acervo do Museu da Pessoa, preservado para o futuro e disponível para acesso público.\r\n\r\n<a href=\"https://docs.google.com/forms/d/e/1FAIpQLSfaXRdADz0lp0MSPgWb-k7gBNPuOP17qQGg1jI_8dHeBWtuiQ/closedform\" target=\"_blank\">Clique aqui para se inscrever</a> 😊', NOW()),
(18, 'Fundação do Museu', 1, 'O Museu da Pessoa nasceu em 1991, antes da Internet. Em 1997 abriu seu espaço virtual para receber histórias pela Internet. Desde 2014 passou a receber também coleções montadas pelos usuários. Em 2009, criou uma Tecnologia Social de Memória para apoiar pessoas, comunidades e instituições a registrarem suas histórias. \r\n\r\nNossa visão é ter um museu em cada mão para que as histórias de vida se tornem um antídoto contra a intolerância. Ouvir é o primeiro passo para transformar seu jeito de ver o mundo.\r\n\r\nColabore. Participe. Cada história importa!\r\n\r\n#somosnossashistórias', NOW()),
(19, 'O que é o Museu', 1, 'O Museu da Pessoa é um museu virtual e colaborativo de histórias de vida 😊\r\n\r\nNossa missão é transformar a história de toda e qualquer pessoa em patrimônio da humanidade.', NOW()),
(20, 'Ajuda sobre o Chat', 1, 'Se pediu ajuda, ela chegou! Aqui estão alguns dos tópicos que talvez eu saiba alguma coisa:\r\n\r\n- Introdução sobre mim\r\n- Origem do meu nome\r\n- Brincadeiras\r\n- Broncas\r\n- Infância\r\n- Cidade natal\r\n- Educação\r\n- Gostos\r\n- Filhos\r\n- Idade / Ano de nascimento\r\n- Pais\r\n- Profissão\r\n- Músicas\r\n- Filmes\r\n\r\nAlém de informações sobre o Museu da Pessoa:\r\n\r\n- O que é o Museu\r\n- Contato com o Museu\r\n- Programa \"Conte Sua História\"\r\n- Apoio ao Museu / Voluntariado\r\n- Quantidade de histórias do Museu\r\n- Fundação do Museu\r\n- Programação do Museu\r\n- Redes sociais do Museu', NOW()),
(21, 'Apoio ao Museu / Voluntariado', 1, 'O Museu também é feito por voluntários! Se você quiser fazer parte deste time, <a href=\"https://museudapessoa.us10.list-manage.com/subscribe?u=50cf1cee8ddf1afde00b87af7&id=0139059499\" target=\"_blank\"> responda este formulário que entraremos em contato</a>. 😊\r\n\r\nVamos, juntos, transformar histórias de vida de toda e qualquer pessoal em patrimônio da humanidade!\r\n\r\nSe você gostou da nossa causa, <a href=\"https://museudapessoa.org/apoie\" target=\"_blank\">clique aqui para saber mais como nos ajudar</a>. 😊', NOW()),
(22, 'Contato com o Museu', 1, 'Caso você queira falar diretamente conosco, o e-mail de nossa equipe de atendimento é: <a href=\"mailto:atendimento@museudapessoa.org\" target=\"_blank\">atendimento@museudapessoa.org</a> ✉\r\n\r\nNão sei se você sabe, mas a casa do Museu é na internet, pois somos um Museu Virtual de histórias de vida.\r\n\r\nComo estamos construindo nossa nova plataforma, você pode visitar a gente através de dois canais: <a href=\"https://acervo.museudapessoa.org\" target=\"_blank\">acervo.museudapessoa.org</a> pra você navegar no nosso acervo e o <a href=\"https://museudapessoa.org\" target=\"_blank\">museudapessoa.org</a> para você experimentar nossas exposições em um novo formato.\r\n\r\nA gente também tem uma sede administrativa que fica na Vila Madalena, mas estamos fechados temporariamente para visitação por conta da pandemia de COVID-19. 😥', NOW()),
(23, 'Quantidade de Histórias do Museu', 1, 'O Museu tem mais de 18 mil histórias de vida! 😳\r\n\r\nSe você quiser acessá-las, <a href=\"https://museudapessoa.org/programacao/\" target=\"_blank\">clique aqui para visitar o site do acervo</a>.', NOW()),
(24, 'Programação do Museu', 1, 'Você pode conferir a programação do Museu da Pessoa <a href=\"https://museudapessoa.org/programacao/\" target=\"_blank\">clicando aqui</a>. 😉\r\n\r\nAssine a nossa newsletter para receber todas as nossas novidades!', NOW()),
(25, 'Redes Sociais do Museu', 1, 'Siga o Museu nas suas redes sociais favoritas:\r\n\r\nLinkedIn: <a href=\"https://www.linkedin.com/company/museudapessoa/\" target=\"_blank\">linkedin.com/company/museudapessoa</a>\r\n\r\nInstagram: <a href=\"https://www.instagram.com/museudapessoa/\" target=\"_blank\">instagram.com/museudapessoa</a>\r\n\r\nTwitter: <a href=\"https://twitter.com/museudapessoa\" target=\"_blank\">twitter.com/museudapessoa</a>\r\n\r\nYoutube: <a href=\"https://www.youtube.com/user/museudapessoa\" target=\"_blank\">youtube.com/user/museudapessoa</a>\r\n\r\nFacebook: <a href=\"https://www.facebook.com/museudapessoa/\" target=\"_blank\">facebook.com/museudapessoa</a>', NOW()),
(26, 'Origem do Nome', 1, NULL, NOW()),
(27, 'Time de Futebol', 1, 'Eu não acompanho futebol 😢', NOW());

-- DROP TABLE IF EXISTS pessoa;
CREATE TABLE pessoa (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  nomeajustado varchar(100) NOT NULL,
  feminino tinyint(4) NOT NULL,
  criacao datetime NOT NULL,
  versaoimagem int NULL,
  corfundo varchar(7) NOT NULL,
  corbotao varchar(7) NOT NULL,
  cortextobotao varchar(7) NOT NULL,
  htmlmensagem text NOT NULL,
  htmlinicial mediumtext NOT NULL,
  jsonassuntos mediumtext NOT NULL,
  boasvindas text NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome),
  KEY nomeajustado_idx (nomeajustado)
);

-- DROP TABLE IF EXISTS resposta;
CREATE TABLE resposta (
  id int NOT NULL AUTO_INCREMENT,
  idpessoa int NOT NULL,
  idassunto int NOT NULL,
  texto text NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY idpessoaidassunto_UN (idpessoa, idassunto),
  KEY idassunto_FK_idx (idassunto),
  CONSTRAINT idpessoa_FK FOREIGN KEY (idpessoa) REFERENCES pessoa (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT idassunto_FK FOREIGN KEY (idassunto) REFERENCES assunto (id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO resposta (idpessoa, idassunto, texto, criacao) VALUES
(1, 4, 'Sou a Mani, tenho 25 anos, sou estudante e pesquisadora e serei sua guia aqui no Museu. \nTenho descendência indígena.', NOW()),
(1, 14, 'Sou a guia do Museu da Pessoa e espero conseguir te ajudar.', NOW()),
(1, 5, 'Quando eu era pequena adorava brincar na beira do rio com os meus irmãos.', NOW()),
(1, 8, 'Nasci em Cruzeiro do Sul, no Acre.', NOW()),
(1, 10, 'Gosto de ler, sou conhecedora de lendas e histórias, e muito interessada em museus, arte e cultura.', NOW()),
(1, 20, 'Se pediu ajuda, ela chegou! Aqui estão alguns dos tópicos que talvez eu saiba alguma coisa:\n\n- Introdução sobre mim\n- Origem do meu nome\n- Cidade natal\n- Gostos\n- Profissão\n\nAlém de informações sobre o Museu da Pessoa:\n\n- O que é o Museu\n- Contato com o Museu\n- Programa \"Conte Sua História\"\n- Apoio ao Museu / Voluntariado\n- Quantidade de histórias do Museu\n- Fundação do Museu\n- Programação do Museu\n- Redes sociais do Museu', NOW()),
(1, 1, 'Me desculpe... Não sei o que dizer sobre isso 😥\nPor favor, poderia falar de novo, de outra forma?\n\nAqui estão alguns dos tópicos que talvez eu saiba alguma coisa:\n\n- Introdução sobre mim\n- Origem do meu nome\n- Cidade natal\n- Gostos\n- Profissão\n\nAlém de informações sobre o Museu da Pessoa:\n\n- O que é o Museu\n- Contato com o Museu\n- Programa \"Conte Sua História\"\n- Apoio ao Museu / Voluntariado\n- Quantidade de histórias do Museu\n- Fundação do Museu\n- Programação do Museu\n- Redes sociais do Museu', NOW()),
(1, 26, 'Meu nome é de origem indígena e rememora a lenda da mandioca, que faz parte do folclore brasileiro e é de origem indígena.\n\nDe acordo com a história, a filha do cacique de uma tribo tupi-guarani havia engravidado. Seu pai, muito furioso, queria saber de quem era o bebê que ela estava esperando. A índia afirmava que não sabia como tal fato teria acontecido, pois não tinha se entregado para nenhum homem.\n\nO cacique não acreditou na filha, e certa noite, o chefe da tribo sonhou que alguém lhe dizia para acreditar em sua filha, pois ela contava a verdade. A partir deste momento, o cacique passou a aceitar a gravidez e a esperar ansioso pela chegada da neta.\n\nA menina era muito bonita, tinha a pele branca e se chamava Mani. Trazia muita alegria para a aldeia pois era uma criança muito feliz e querida. Certa manhã, Mani foi encontrada sem vida pela sua mãe.\n\nCom muita tristeza, o povo enterrou a menina dentro da própria oca. A terra ficava umedecida com tantas lágrimas. Depois de alguns dias, nasceu uma planta diferente no mesmo local onde o corpo havia sido enterrado.\n\nA planta não era conhecida pela aldeia. Perceberam que ela tinha uma raiz escura e por dentro era toda branca. Em homenagem à filha, ela colocou o nome de Manioca na planta, uma junção de Mani (nome da criança) e Oca (local onde foi enterrada).\n\nCom o passar dos anos, o nome se tornou mandioca. Os índios passaram a utilizar a raiz da planta para fazer farinha e uma bebida chamada cauim. 😊', NOW());

-- DROP TABLE IF EXISTS mensageminicial;
CREATE TABLE mensageminicial (
  id int NOT NULL,
  texto mediumtext NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO mensageminicial (id, texto) VALUES (1, '');

CREATE TABLE conversalog (
  id bigint NOT NULL AUTO_INCREMENT,
  idpessoa int NOT NULL,
  idassunto int NOT NULL,
  idconversa bigint NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY conversalog_criacao_idx (criacao)
);

CREATE TABLE conversalogindividual (
  id bigint NOT NULL AUTO_INCREMENT,
  idpessoa int NOT NULL,
  idconversa bigint NOT NULL,
  codpergunta varchar(45) NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY conversalog_criacao_idx (criacao)
);
