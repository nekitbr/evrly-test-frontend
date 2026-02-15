### # Frontend - Fullstack Test
Visualização e gerenciamento de dados dos usuários.

#### Tecnologias Utilizadas
* Angular
* Tailwind

#### Diferenciais Implementados
* **Paginação**: A listagem de usuários não carrega todos os registros de uma vez, otimizando o desempenho.
* **Estratégia Look-ahead**: Para contornar a ausência de um ORM com paginação nativa no backend, o componente solicita páginas antecipadamente para garantir uma navegação fluída.
* **Componentização**: A aplicação foi dividida em componentes para facilitar a leitura e entendimento do projeto.
* **DIY**: Paginação desenvolvida manualmente, mantendo o bundle leve.

#### Funcionalidades
* **Botão Execute**: Aciona o fluxo de busca, descriptografia e persistência de dados. A tabela é atualizada dinamicamente.
* **Botão Clear**: Aciona o comando de TRUNCATE no banco de dados via N8N e limpa a visualização local.
* **Tabela Responsiva**: Interface adaptável para diferentes tamanhos de tela.

#### Configuração e Instalação
1. `npm install`
2. Configure a URL da API backend no ambiente do Angular (`environment.ts`).
3. `ng serve` (disponível em `http://localhost:4200`).


### # Backend - Fullstack Test
Consumo de dados criptografados, descriptografia (AES-256-GCM) e orquestração com N8N.

#### Tecnologias Utilizadas
* Node.js
* Fastify (Framework Web)
* Crypto (Módulo nativo)

#### Arquitetura do Projeto
* **server.js**: Ponto de entrada e configuração.
* **controllers/**: Gerenciamento de Endpoints.
* **services/**: Regras de negócio e criptografia.
* **clients/**: Integrações com APIs externas.

#### Configuração e Instalação
1. `npm install`
2. Configure o arquivo `.env` (URLs de webhooks e chaves).
3. `npm run local` (disponível em `http://localhost:3000`).
