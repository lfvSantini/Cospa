# Sistema de Gestão Operacional — COSPA Logística e Transportes

Repositório técnico oficial da solução de tecnologia desenvolvida sob encomenda para a gestão operacional, frotas, motoristas e controle de viagens da **COSPA LOGÍSTICA E TRANSPORTES LTDA.**

---

## 1. Visão Geral da Arquitetura

O sistema é estruturado em uma arquitetura desacoplada cliente-servidor, garantindo escalabilidade, segurança e integridade de dados:

* **Backend:** Java 17 com Spring Boot (Spring Web, Spring Security, Spring Data JPA, JWT Authentication).
* **Banco de Dados:** Relacional (PostgreSQL / MySQL).
* **Frontend:** Interface Web SPA com arquitetura Angular e layout responsivo para dispositivos móveis.
* **Segurança:** Autenticação stateless via JSON Web Token (JWT) com controle de sessão e permissões[cite: 1].
* **Armazenamento de Arquivos:** Sistema de gestão e persistência para uploads de CNH, CRLV, comprovantes e documentos[cite: 1].

---

## 2. Módulos Entregues (Escopo Original)

Conforme estabelecido na **Cláusula 1.2** do Contrato de Prestação de Serviços[cite: 1]:

1. **Módulo de Autenticação e Segurança:** Controle de acesso por JWT, gestão de credenciais e proteção de endpoints[cite: 1].
2. **Módulo de Clientes:** Cadastro, edição, listagem, inativação e gestão de documentos anexos[cite: 1].
3. **Módulo de Fornecedores:** Cadastro, edição, listagem e status de parceiros e agências[cite: 1].
4. **Módulo de Motoristas:** Cadastro de motoristas, controle de CNH, CRLV e documentações associadas com upload de arquivos[cite: 1].
5. **Módulo de Viagens e Operação:** Controle de viagens em andamento, viagens a pagar, histórico de finalizadas e upload de comprovantes[cite: 1].
6. **Adaptação Arquitetural:** Portabilidade da interface para Angular e adequação da responsividade móvel[cite: 1].

---

## 3. Pré-requisitos de Ambiente

Para executar o projeto localmente em ambiente de desenvolvimento, certifique-se de ter instalado:

* **Java Development Kit (JDK):** Versão 17 ou superior
* **Apache Maven:** Versão 3.8+
* **Node.js & NPM:** Node v18+ e NPM v9+
* **Angular CLI:** `npm install -g @angular/cli`
* **Banco de Dados:** PostgreSQL 14+ ou MySQL 8+
* **Git:** Para versionamento e controle de branches

---

## 4. Instalação e Execução Local

### 4.1. Clonando o Repositório
```bash
git clone [https://github.com/lfvsantini/cospa-sistema.git](https://github.com/lfvsantini/cospa-sistema.git)
cd cospa-sistema
