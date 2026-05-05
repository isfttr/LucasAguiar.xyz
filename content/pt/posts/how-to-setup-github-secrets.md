---
date: 2025-04-11T19:48:47.000Z
draft: true
title: >-
  Como Configurar e Usar GitHub Secrets com Contêineres e Aplicações Voltadas
  para a Internet
description: >-
  Aprenda a gerenciar com segurança informações confidenciais em seus projetos
  GitHub usando Segredos e integrá-los com aplicações conteinerizadas e serviços
  expostos à internet.
url: /github-secrets-containers-guide/
featured_image: >-
  https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-github-secrets.png
categories:
  - tutorial
tags:
  - github
  - security
  - containers
  - docker
  - devops
  - ci-cd
  - secrets-management
translation_source_hash: 39cdd177d1c2f2d4b062e5f68f90ef0f51e8fe140e1430b308676080453d8c63
---
Trabalhar com contêineres e aplicações expostas à internet frequentemente exige o manuseio de informações sensíveis como chaves de API, credenciais de banco de dados e tokens de acesso. Codificar esses valores diretamente no seu código-fonte é um grande risco de segurança, especialmente quando seu código é armazenado em repositórios públicos. GitHub Secrets oferece uma solução elegante para esse problema, permitindo que você armazene e use dados sensíveis de forma segura em seus fluxos de trabalho e implantações do GitHub.

Neste guia, vou te acompanhar na configuração do GitHub Secrets e como usá-los com contêineres e aplicações voltadas para a internet.

## O que são GitHub Secrets?

GitHub Secrets são variáveis de ambiente criptografadas que você cria em um repositório ou organização. Elas permitem que você armazene informações sensíveis no seu repositório GitHub sem expô-las em seus commits, logs ou a pessoal não autorizado. São particularmente úteis para:

- Chaves de API e tokens de acesso
- Credenciais de banco de dados
- Certificados e chaves privadas
- Credenciais de conta de serviço
- Configuração específica de ambiente

## Por que usar GitHub Secrets?

- **Segurança**: Os valores são criptografados antes de chegar ao GitHub e permanecem criptografados até serem usados em um fluxo de trabalho
- **Controle de Acesso**: Apenas fluxos de trabalho autorizados podem acessar os segredos
- **Integração**: Funciona perfeitamente com GitHub Actions e outras ferramentas de CI/CD
- **Auditabilidade**: As alterações nos segredos são registradas no log de auditoria do repositório
- **Separação de Preocupações**: Mantém o código e a configuração separados

### Perigos de não usar segredos corretamente

A falha em gerenciar informações sensíveis corretamente pode levar a sérios incidentes de segurança:

1.  **Exposição de Credenciais**: Credenciais codificadas em repositórios podem ser descobertas através de ferramentas de varredura de código ou navegando manualmente pelo código e histórico de commits, mesmo que sejam removidas posteriormente
2.  **Ataques à Cadeia de Suprimentos**: Credenciais comprometidas podem permitir que invasores sequestrem seu pipeline de implantação ou infraestrutura
3.  **Violações de Dados**: Credenciais de banco de dados expostas podem levar a acesso não autorizado a dados de usuários e potenciais violações regulatórias (GDPR, CCPA, etc.)
4.  **Assunção de Contas**: Chaves de API e tokens de acesso podem ser usados para se passar pela sua aplicação ou organização
5.  **Perdas Financeiras**: Credenciais de serviço em nuvem podem ser usadas para iniciar recursos caros para mineração de criptomoedas ou outros propósitos não autorizados
6.  **Violações de Conformidade**: Muitas indústrias exigem gerenciamento adequado de segredos como parte da conformidade regulatória
7.  **Danos à Reputação**: A exposição pública de segredos pode prejudicar a confiança em sua organização e levar à perda de clientes

Exemplos reais de vazamentos de credenciais são, infelizmente, comuns:
- Um desenvolvedor acidentalmente commita chaves da AWS para um repositório público, resultando em milhares de dólares em cobranças de computação não autorizadas em questão de horas
- Chaves de API para serviços pagos sendo extraídas do GitHub e usadas para exceder as cotas de serviço, resultando em contas inesperadas
- Tokens OAuth sendo expostos e usados para acessar repositórios privados e propriedade intelectual

Usar GitHub Secrets corretamente ajuda a mitigar esses riscos, garantindo que informações sensíveis nunca apareçam em sua base de código ou logs.

## Configurando GitHub Secrets

### Segredos de Nível de Repositório

Estes estão disponíveis para execuções de fluxo de trabalho em um único repositório:

1.  Navegue até o seu repositório GitHub
2.  Clique em "Settings" (Configurações) no canto superior direito
3.  Na barra lateral esquerda, clique em "Secrets and variables" (Segredos e variáveis) -> "Actions" (Ações)
4.  Clique em "New repository secret" (Novo segredo de repositório)
5.  Insira um nome para o seu segredo (ex: `DATABASE_PASSWORD`)
6.  Insira o valor no campo de texto
7.  Clique em "Add secret" (Adicionar segredo)

![GitHub Repository Secrets UI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/github-repo-secrets.png)

### Segredos de Nível de Organização

Se você está gerenciando vários repositórios dentro de uma organização, pode configurar segredos de nível de organização:

1.  Vá para a página principal da sua organização
2.  Clique em "Settings" (Configurações)
3.  Na barra lateral esquerda, clique em "Secrets and variables" (Segredos e variáveis) -> "Actions" (Ações)
4.  Clique em "New organization secret" (Novo segredo de organização)
5.  Insira o nome e o valor
6.  Em "Repository access" (Acesso ao repositório), escolha se deseja torná-lo disponível para todos os repositórios ou selecione específicos
7.  Clique em "Add secret" (Adicionar segredo)

## Usando GitHub Secrets com GitHub Actions

Depois que seus segredos estiverem configurados, você pode usá-los em fluxos de trabalho do GitHub Actions. Aqui está um exemplo simples:

```yaml
name: Deploy Application

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: myregistry.com/myapp:latest
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - name: Deploy to production
      env:
        DB_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
        API_KEY: ${{ secrets.API_KEY }}
      run: |
        echo "Deploying with secure credentials..."
        ./deploy-script.sh
```

Observe como acessamos os segredos usando a sintaxe `${{ secrets.SECRET_NAME }}`.

## Integrando GitHub Secrets com Contêineres

### Opção 1: Integração em Tempo de Construção

Você pode passar segredos para o seu processo de construção do Docker:

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    build-args: |
      API_KEY=${{ secrets.API_KEY }}
```

No seu Dockerfile:

```dockerfile
ARG API_KEY
ENV API_KEY=$API_KEY

# Rest of your Dockerfile
```

**Importante**: Esta abordagem deve ser usada com cautela, pois os argumentos de construção podem ser visualizados no histórico da imagem. É melhor para configuração em tempo de construção que não precisa permanecer secreta após a construção.

### Opção 2: Variáveis de Ambiente em Tempo de Execução

Uma abordagem mais segura é passar os segredos como variáveis de ambiente em tempo de execução:

```yaml
- name: Run container
  run: |
    docker run -e "DB_PASSWORD=${{ secrets.DATABASE_PASSWORD }}" \
               -e "API_KEY=${{ secrets.API_KEY }}" \
               myimage:latest
```

### Opção 3: Usando Docker Compose

Se você estiver usando Docker Compose, pode criar um arquivo `.env` em tempo de execução:

```yaml
- name: Prepare environment
  run: |
    echo "DB_PASSWORD=${{ secrets.DATABASE_PASSWORD }}" >> .env
    echo "API_KEY=${{ secrets.API_KEY }}" >> .env

- name: Start services
  run: docker-compose up -d
```

## Usando GitHub Secrets com Kubernetes

Para implantações Kubernetes, você pode usar GitHub Secrets para criar Kubernetes Secrets:

```yaml
- name: Create Kubernetes secret
  run: |
    kubectl create secret generic app-secrets \
      --from-literal=db-password=${{ secrets.DATABASE_PASSWORD }} \
      --from-literal=api-key=${{ secrets.API_KEY }}
```

Ou atualizar um arquivo de manifesto Kubernetes antes de aplicá-lo:

```yaml
- name: Update Kubernetes config
  run: |
    sed -i "s/DB_PASSWORD_PLACEHOLDER/${{ secrets.DATABASE_PASSWORD }}/g" k8s/deployment.yaml
    kubectl apply -f k8s/deployment.yaml
```

## Melhores Práticas para Usar GitHub Secrets

1.  **Use Nomes Específicos**: Dê nomes descritivos aos seus segredos para evitar confusão
2.  **Limite o Acesso**: Para segredos da organização, compartilhe apenas com os repositórios que precisam deles
3.  **Rotacione Regularmente**: Atualize seus segredos periodicamente para maior segurança
4.  **Evite Registrar**: Nunca registre ou exiba valores de segredos em seus fluxos de trabalho
5.  **Minimize a Exposição**: Use segredos apenas nas etapas específicas que precisam deles
6.  **Limpe**: Remova quaisquer arquivos temporários contendo segredos após o uso
7.  **Use Segredos de Ambiente**: Para diferentes ambientes de implantação (staging vs produção)
8.  **Audite Regularmente**: Revise quem tem acesso aos seus segredos periodicamente

## Segredos Específicos do Ambiente

Para casos de uso mais avançados, o GitHub oferece segredos específicos do ambiente:

1.  Vá para as configurações do seu repositório
2.  Clique em "Environments" (Ambientes) na barra lateral esquerda
3.  Crie ou selecione um ambiente
4.  Adicione segredos específicos do ambiente

Isso permite que você tenha diferentes valores de segredo para ambientes de desenvolvimento, staging e produção.

## Considerações de Segurança para Aplicações Voltadas para a Internet

Quando seus contêineres e aplicações são expostos à internet, a segurança se torna ainda mais crítica:

1.  **Nunca Exponha Segredos no Código do Lado do Cliente**: Garanta que os segredos sejam usados apenas no lado do servidor
2.  **Use Rotação de Segredos**: Implemente rotação automática de credenciais
3.  **Implemente o Princípio do Menor Privilégio**: Cada segredo deve ter as permissões mínimas necessárias
4.  **Monitore o Uso**: Configure alertas para padrões de acesso incomuns aos seus serviços
5.  **Considere Usar um Gerenciador de Segredos**: Para sistemas de produção, considere soluções dedicadas como AWS Secrets Manager, HashiCorp Vault ou Azure Key Vault

## Varredura de Segredos

O GitHub oferece varredura de segredos para detectar segredos acidentalmente commitados:

1.  Vá para as configurações do repositório
2.  Clique em "Code security and analysis" (Segurança e análise de código)
3.  Habilite "Secret scanning" (Varredura de segredos)

Este recurso irá alertá-lo se as credenciais forem acidentalmente enviadas para o repositório.

## Usando GitHub Secrets com Aplicações Auto-Hospedadas

Para aplicações hospedadas em sua própria infraestrutura:

1.  Use GitHub Actions para gerar um artefato de implantação
2.  Inclua um script que busca segredos de uma fonte segura em tempo de execução
3.  Considere usar arquivos de ambiente que são gerados durante a implantação

Exemplo de fluxo de trabalho:

```yaml
- name: Build application
  run: npm run build

- name: Generate environment file
  run: |
    echo "API_KEY=${{ secrets.API_KEY }}" > .env.production
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env.production

- name: Deploy to server
  uses: some-deployment-action@v1
  with:
    files: |
      dist/
      .env.production
```

## Alternativas de Gerenciamento de Segredos em Outras Plataformas

Embora este guia se concentre no GitHub Secrets, muitas plataformas oferecem funcionalidades semelhantes para gerenciar informações sensíveis com segurança. Veja como o gerenciamento de segredos funciona em outras plataformas de desenvolvimento populares:

### Variáveis CI/CD do GitLab

O GitLab oferece um recurso semelhante chamado Variáveis CI/CD:

1.  **Variáveis de Projeto**: Específicas para um único projeto
    - Navegue até seu projeto > Configurações > CI/CD
    - Expanda a seção "Variables"
    - Clique em "Add Variable" e escolha entre tipo variável ou arquivo
    - Defina "Protect variable" para limitar a branches/tags protegidas
    - Defina "Mask variable" para ocultar valores nos logs de job

2.  **Variáveis de Grupo**: Compartilhadas entre todos os projetos em um grupo
    - Vá para seu grupo > Configurações > CI/CD
    - Siga passos semelhantes aos das variáveis de projeto

3.  **Variáveis de Instância**: Disponíveis para todos os projetos em uma instância GitLab (auto-hospedada)
    - Configuradas por administradores

Uso em `.gitlab-ci.yml`:
```yaml
deploy:
  script:
    - echo "Deploying with $DB_PASSWORD"
    - deploy-script.sh
```

### Variáveis Bitbucket Pipelines

O Bitbucket Pipelines oferece variáveis de repositório e workspace:

1.  **Variáveis de Repositório**: Disponíveis para um único repositório
    - Configurações do Repositório > Pipelines > Variáveis do repositório
    - Adicione variáveis com a opção "Secured" opcional para mascarar valores

2.  **Variáveis de Workspace**: Compartilhadas entre todos os repositórios em um workspace
    - Configurações do Workspace > Pipelines > Variáveis do workspace

Uso em `bitbucket-pipelines.yml`:
```yaml
pipelines:
  default:
    - step:
        script:
          - echo "Using $DB_PASSWORD for deployment"
```

### Plataforma de Aplicações Digital Ocean

A Plataforma de Aplicações da Digital Ocean oferece gerenciamento de ambiente:

1.  Navegue até seu aplicativo no painel de controle da Digital Ocean
2.  Vá para a guia "Settings"
3.  Role até "Environment Variables"
4.  Adicione variáveis, marcando as sensíveis como "Encrypted"

A Digital Ocean injeta automaticamente essas variáveis no ambiente do seu aplicativo em tempo de execução.

### Variáveis do Azure DevOps Pipeline

O Azure DevOps oferece variáveis de pipeline e grupos de variáveis:

1.  **Variáveis de Pipeline**: Definidas no próprio pipeline
    - Edite seu pipeline > Variáveis
    - Adicione nome, valor e, opcionalmente, marque como "Secret"

2.  **Grupos de Variáveis**: Reutilizáveis em múltiplos pipelines
    - Pipelines > Library > Grupos de variáveis
    - Crie um grupo e adicione variáveis
    - Vincule o grupo a pipelines

Uso em `azure-pipelines.yml`:
```yaml
steps:
- script: echo "Connecting with $(DB_PASSWORD)"
  env:
    DB_PASSWORD: $(DB_PASSWORD)
```

### Variáveis de Ambiente AWS CodeBuild

O AWS CodeBuild oferece três tipos de variáveis de ambiente:

1.  **Variáveis de Texto Simples**: Para dados não sensíveis
2.  **Valores do Parameter Store**: Para dados semi-sensíveis usando o AWS Systems Manager
3.  **Valores do Secrets Manager**: Para dados altamente sensíveis usando o AWS Secrets Manager

Configuração em `buildspec.yml`:
```yaml
env:
  variables:
    APP_NAME: "my-application"
  parameter-store:
    DB_CONNECTION: "/my-app/database/connection"
  secrets-manager:
    DB_PASSWORD: "production/db/password:password"
```

### Comparando Recursos de Gerenciamento de Segredos

| Plataforma | Criptografia Local | Integração | Rotação de Segredos | RBAC | Log de Auditoria |
|----------|-----------------|-------------|----------------|------|--------------|
| GitHub Secrets | ✅ | GitHub Actions | Manual | ✅ | ✅ |
| GitLab CI/CD Variables | ✅ | GitLab CI | Manual | ✅ | ✅ |
| Bitbucket Pipelines | ✅ | Bitbucket Pipelines | Manual | Limitado | Limitado |
| Digital Ocean | ✅ | App Platform | Manual | Limitado | ✅ |
| Azure DevOps | ✅ | Azure Pipelines | Manual/Key Vault | ✅ | ✅ |
| AWS CodeBuild | ✅ | CodeBuild/CodePipeline | Automático com Secrets Manager | ✅ | ✅ |

### Quando Usar Serviços Dedicados de Gerenciamento de Segredos

Para aplicações empresariais ou implantações altamente sensíveis, considere serviços dedicados de gerenciamento de segredos:

-   **HashiCorp Vault**: Gerenciamento de segredos de código aberto, altamente configurável com recursos avançados
-   **AWS Secrets Manager**: Serviço gerenciado com capacidades de rotação automática
-   **Azure Key Vault**: Solução da Microsoft para segredos, chaves e certificados
-   **Google Secret Manager**: Serviço de gerenciamento de segredos do Google Cloud
-   **Doppler**: Gerenciamento de segredos multiplataforma e amigável para desenvolvedores

Esses serviços dedicados frequentemente fornecem recursos avançados como:
- Rotação automática de segredos
- Controles de acesso detalhados e trilhas de auditoria
- Integração com provedores de identidade
- Histórico de versões de segredos
- Suporte de Módulo de Segurança de Hardware (HSM)

Para implantações complexas que abrangem múltiplas plataformas, esses serviços dedicados podem fornecer uma abordagem unificada para o gerenciamento de segredos que funciona em toda a sua infraestrutura.

## Exemplo: Aplicação Flask Segura com Banco de Dados SQL e Docker

Vamos ver um exemplo completo de uma aplicação Flask que se conecta a bancos de dados SQL (como PostgreSQL, MySQL ou SQLite) usando GitHub Secrets:

1.  **Crie uma aplicação Flask com conexão de banco de dados**:

```python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configure database from environment variables
# Works with PostgreSQL, MySQL, SQLite, or other SQL databases
DB_TYPE = os.environ.get('DB_TYPE', 'postgresql')  # postgresql, mysql, sqlite, etc.
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
API_KEY = os.environ.get('API_KEY')

# Construct database URI based on the type
if DB_TYPE == 'sqlite':
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}.db'
else:
    # Works for PostgreSQL, MySQL, and other SQL databases
    app.config['SQLALCHEMY_DATABASE_URI'] = f'{DB_TYPE}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Simple model for demonstration
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

@app.route('/')
def hello():
    db_type = "SQLite" if DB_TYPE == "sqlite" else DB_TYPE.capitalize()
    return f"Connected to {db_type} database: {DB_NAME} using API key: {API_KEY[:3]}..."

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

2.  **Crie um Dockerfile**:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install database dependencies based on which database you'll use
RUN apt-get update && apt-get install -y \
    # PostgreSQL dependencies
    libpq-dev \
    # MySQL dependencies
    default-libmysqlclient-dev \
    # Common build tools
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# requirements.txt should include:
# flask
# flask-sqlalchemy
# psycopg2-binary (for PostgreSQL)
# mysqlclient (for MySQL)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Note: We don't hardcode any secrets here
CMD ["python", "app.py"]
```

3.  **Fluxo de trabalho do GitHub Actions**:

```yaml
name: Deploy Flask App

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ghcr.io/${{ github.repository }}/flask-app:latest

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USERNAME }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          docker pull ghcr.io/${{ github.repository }}/flask-app:latest
          docker stop flask-app || true
          docker rm flask-app || true
          docker run -d --name flask-app \
            -e "DB_TYPE=${{ secrets.DB_TYPE }}" \
            -e "DB_USER=${{ secrets.DB_USER }}" \
            -e "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" \
            -e "DB_HOST=${{ secrets.DB_HOST }}" \
            -e "DB_NAME=${{ secrets.DB_NAME }}" \
            -e "API_KEY=${{ secrets.API_KEY }}" \
            -p 5000:5000 \
            ghcr.io/${{ github.repository }}/flask-app:latest
```

Neste exemplo:
- Construímos uma aplicação Flask que pode se conectar a vários bancos de dados SQL (PostgreSQL, MySQL, SQLite) em um contêiner Docker
- Enviamos o contêiner para o GitHub Container Registry
- Implantamos em um servidor usando SSH, injetando nossas credenciais de banco de dados e outros segredos como variáveis de ambiente em tempo de execução
- As informações sensíveis de conexão com o banco de dados e as chaves de API nunca aparecem na imagem Docker ou no código
- Ao alterar o segredo DB_TYPE no GitHub, você pode facilmente alternar entre diferentes sistemas de banco de dados SQL sem alterar seu código

## Conclusão

GitHub Secrets fornece uma solução robusta para gerenciar informações sensíveis em seus fluxos de trabalho de desenvolvimento e implantação. Seguindo as práticas descritas neste guia, você pode garantir que seus contêineres e aplicações voltadas para a internet permaneçam seguros, enquanto ainda aproveita a conveniência dos recursos de CI/CD do GitHub.

Lembre-se, a segurança é um processo contínuo. Audite regularmente o uso de seus segredos, rotacione as credenciais e mantenha-se informado sobre as melhores práticas no gerenciamento de segredos.


Leia também:

- [Usando a camada gratuita do Oracle Cloud]({{< relref "posts/oracle_cloud_vps/" >}})
- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Duas Semanas com GitButler: Simplificando Meu Fluxo de Trabalho Git]({{< relref "posts/one-week-review-gitbutler/" >}})

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
