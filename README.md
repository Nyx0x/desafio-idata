# 🚢 Desafio Técnico iData — Monitoramento Logístico de Cargas

Solução completa desenvolvida para o desafio técnico da **iData**, consumo de um modelo relacional existente, extração de dados com consultas SQL com múltiplos joins e subquery correlacionada, API RESTful construída em **.NET 8 (C#)** e interface analítica em **React** com **Material UI** e **AG Grid**.

---

## 🏛️ Visão Geral da Arquitetura

O sistema integra o fluxo completo de dados operacionais de comércio exterior:
```
[ MySQL 8.0 (Docker) ]
        │  chaves compostas / subqueries de ordem máxima
        ▼
[ .NET 8 Web API ]
        │  Entity Framework Core + DTOs
        ▼
[ React + AG Grid ]
```


---

## 🛠️ Tecnologias & Bibliotecas

- **Banco de Dados:** MySQL 8.0 rodando em contêiner Docker.
- **Backend:** C# / .NET 8, ASP.NET Core Web API, Entity Framework Core com driver `Pomelo.EntityFrameworkCore.MySql`.
- **Frontend:** React via Vite, Material UI (MUI v5), AG Grid Community.
- **Utilitários:** Swagger / OpenAPI, Docker CLI.

---

## 📋 Resolução das Questões SQL

### Questão 1 — Consulta Base

Qual seria o comando para trazer o seguinte resultado?
<img width="602" height="199" alt="Screenshot 2026-10-05 at 01-09-44 " src="https://github.com/user-attachments/assets/413ea2fd-45e2-4c71-984c-e97bfc84bea5" />

Resposta:
Com base nas tabelas `DISCIPLINA` e `DOCENTE`, o comando para obter a projeção unificada com o nome do professor por disciplina é:

```sql
SELECT 
    d.Cod, 
    d.Componente, 
    d.Unid, 
    doc.Professor
FROM DISCIPLINA d
INNER JOIN DOCENTE doc 
        ON d.Cod = doc.Cod;
```


### Questão 2 - Consulta Relacional com Confirmação de Embarque

Através do dump fornecido para você, faça um consulta que retorne todos os dados da tabela processo, o nome da empresa importadora(processo.cod_importador - empresa.codemp) e da empresa exportadora(processo.cod_exportador - empresa.codemp), o nome do usuário do processo (processo.processo_usuario - usuario.usuarioid) e a data de confirmação de embarque(colunas nro_pro, ano_pro da tabela processo lincadas com nro_pro, ano_pro da tabela processotracking onde a coluna ordem no processotracking for igual a 1, a coluna processotracking.confirmacaodata é a confirmação do embarque). 

Resposta:

```sql
SELECT 
    p.*,
    imp.razaosocial_emp AS nome_importador,
    exp.razaosocial_emp AS nome_exportador,
    u.nome_usu          AS nome_usuario,
    pt.confirmacaodata  AS data_confirmacao_embarque
FROM processo p
LEFT JOIN empresa imp 
       ON p.cod_importador = imp.cod_emp
LEFT JOIN empresa exp 
       ON p.cod_exportador = exp.cod_emp
LEFT JOIN usuario u 
       ON p.processo_usuario = u.usuarioid
LEFT JOIN processotracking pt 
       ON p.nro_pro = pt.nro_pro 
      AND p.ano_pro = pt.ano_pro 
      AND pt.ordem = 1;
```
                             

### Questão 3 - Embarque e Chegada na Ordem Máxima

Assim como na questão anterior pegue todos os dados informados, mas adicione também da tabela processotracking a data de confirmação de chegada que seria a ordem máxima, ou seja, seria processotracking.confirmacaodata quando a ordem fosse maxima.

Resposta:

```sql
SELECT 
    p.*,
    imp.razaosocial_emp AS nome_importador,
    exp.razaosocial_emp AS nome_exportador,
    u.nome_usu          AS nome_usuario,
    emb.confirmacaodata AS data_confirmacao_embarque,
    che.confirmacaodata AS data_confirmacao_chegada
FROM processo p
LEFT JOIN empresa imp 
       ON p.cod_importador = imp.cod_emp
LEFT JOIN empresa exp 
       ON p.cod_exportador = exp.cod_emp
LEFT JOIN usuario u   
       ON p.processo_usuario = u.usuarioid
LEFT JOIN processotracking emb
       ON emb.nro_pro = p.nro_pro
      AND emb.ano_pro = p.ano_pro
      AND emb.ordem = 1
LEFT JOIN processotracking che
       ON che.nro_pro = p.nro_pro
      AND che.ano_pro = p.ano_pro
      AND che.ordem = (
            SELECT MAX(t.ordem)
            FROM processotracking t
            WHERE t.nro_pro = p.nro_pro
              AND t.ano_pro = p.ano_pro
      );
```


### Questão 4 - Aplicação Backend em C# (.NET 8 + Entity Framework Core)

 - Implementação de API REST em ASP.NET Core expondo o controlador ProcessosController com os métodos:

        GET /api/processos/questao2: Retorna a lista de processos com confirmação de embarque.

        GET /api/processos/questao3: Retorna a lista de processos com confirmação de embarque e data da ordem máxima de chegada.

 -  Mapeamento configurado com HasNoKey() no AppDbContext e DTOs desacoplados (ProcessoQuestao2Dto e ProcessoQuestao3Dto) para suporte direto a consultas FromSqlRaw.

 - Driver Pomelo MySQL com versão fixada para resiliência na inicialização.

 - Reaproveitamento das Queries validadas nas questões anteriores, garantindo resultado idêntico.


### Questão 5 — Aplicação Frontend em React (MUI + AG Grid)

 - Dashboard desenvolvido com React e Vite.

 - Navegação por abas (Material UI Tabs) permitindo alternar de forma reativa entre os dados da Questão 2 e Questão 3.

 - Tabela analítica com AG Grid React:

        Ordenação e ativos em todas as colunas.

        Formatação condicional com badges/chips coloridos (success para datas confirmadas e warning com rótulo "Pendente" para valores nulos).

        Ajuste responsivo de cabeçalho (wrapHeaderText: true e autoHeaderHeight: true) para visualização integral dos títulos sem truncamento.

        Recurso adicional de Exportação CSV formatada nativamente com separadores de ponto e vírgula e marcador UTF-8 BOM (\uFEFF) para compatibilidade imediata com Microsoft Excel.


🛠️ Tecnologias Utilizadas

    Base de Dados: MySQL 8.0 (Docker)

    Backend: .NET 8 SDK, C#, Entity Framework Core, Pomelo.EntityFrameworkCore.MySql, Swagger/OpenAPI

    Frontend: React 18, Vite, Material UI (MUI v5), AG Grid Community

    Ambiente Operacional: Pop!_OS Linux

## 🚀 Como Executar o Projeto Localmente

### 1. Iniciar a Base de Dados (MySQL no Docker)

Inicie o contêiner do MySQL 8.0:
```bash
docker run --name mysql-idata \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=desafioidatadb \
  -p 3306:3306 \
  -d mysql:8.0
```

> **Nota:** Aguarde cerca de 20 a 30 segundos para o MySQL concluir a inicialização interna antes de importar o dump.

Importe o ficheiro de dump fornecido para a base de dados:
```bash
docker exec -i mysql-idata mysql -uroot -proot desafioidatadb < dump.sql
```

---

### 2. Iniciar a API (.NET 8)

Navegue até à pasta do backend, restaure os pacotes e execute o servidor:
```bash
cd backend
dotnet restore
dotnet run
```
*A cadeia de ligação (`ConnectionStrings`) encontra-se parametrizada em `backend/appsettings.json` (utilizador `root`, palavra-passe `root`, porta `3306`).*

- **Acesso à API:** `http://localhost:5248`
- **Documentação Swagger:** `http://localhost:5248/swagger`

---

### 3. Iniciar o Frontend (React + Vite)

Num novo terminal, aceda ao diretório do frontend, instale as dependências e inicie o ambiente de desenvolvimento:
```bash
cd frontend
npm install
npm run dev
```

- **Acesso ao Dashboard:** `http://localhost:5173`

  <div align="center">
  <sub>Desenvolvido com muito café ⛾.</sub>
</div>
