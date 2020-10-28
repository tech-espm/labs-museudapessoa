CREATE DATABASE IF NOT EXISTS museu;
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
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

INSERT INTO assunto (id, nome, criacao) VALUES
(1, 'Assunto Desconhecido', now()),
(2, 'Boas vindas', now()),
(3, 'Saudação', now()),
(4, 'Introdução', now()),
(5, 'Brincadeiras', now()),
(6, 'Broncas', now()),
(7, 'Infância', now()),
(8, 'Cidade Natal', now()),
(9, 'Educação', now()),
(10, 'Gostos', now()),
(11, 'Filhos', now()),
(12, 'Idade / Ano de Nascimento', now()),
(13, 'Pais', now()),
(14, 'Profissão', now()),
(15, 'Músicas', now()),
(16, 'Filmes', now());

-- DROP TABLE IF EXISTS pessoa;
CREATE TABLE pessoa (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  nomeajustado varchar(100) NOT NULL,
  feminino tinyint(4) NOT NULL,
  criacao datetime NOT NULL,
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
