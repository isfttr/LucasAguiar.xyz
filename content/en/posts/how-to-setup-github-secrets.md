---
date: 2025-04-11T16:48:47-03:00
draft: true
title: "How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications"
description: "Learn how to securely manage sensitive information in your GitHub projects using Secrets and integrate them with containerized applications and services exposed to the internet."
url: "/github-secrets-containers-guide/"
featured_image: "https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-github-secrets.png"
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
---

Working with containers and applications exposed to the internet often requires handling sensitive information like API keys, database credentials, and access tokens. Hard-coding these values into your source code is a major security risk, especially when your code is stored in public repositories. GitHub Secrets provides an elegant solution to this problem, allowing you to securely store and use sensitive data in your GitHub workflows and deployments.

In this guide, I'll walk you through setting up GitHub Secrets and how to use them with containers and internet-facing applications.

## What Are GitHub Secrets?

GitHub Secrets are encrypted environment variables that you create in a repository or organization. They allow you to store sensitive information in your GitHub repository without exposing it in your commits, logs, or to unauthorized personnel. They're particularly useful for:

- API keys and access tokens
- Database credentials
- Certificates and private keys
- Service account credentials
- Environment-specific configuration

## Why Use GitHub Secrets?

- **Security**: Values are encrypted before they reach GitHub and remain encrypted until used in a workflow
- **Access Control**: Only authorized workflows can access the secrets
- **Integration**: Seamlessly works with GitHub Actions and other CI/CD tools
- **Auditability**: Changes to secrets are logged in the repository's audit log
- **Separation of Concerns**: Keeps code and configuration separate

### Dangers of Not Using Secrets Properly

Failing to manage sensitive information correctly can lead to serious security incidents:

1. **Credential Exposure**: Hard-coded credentials in repositories can be discovered through code scanning tools or by manually browsing through code and commit history, even if later removed
2. **Supply Chain Attacks**: Compromised credentials can enable attackers to hijack your deployment pipeline or infrastructure
3. **Data Breaches**: Exposed database credentials can lead to unauthorized access to user data and potential regulatory violations (GDPR, CCPA, etc.)
4. **Account Takeovers**: API keys and access tokens can be used to impersonate your application or organization
5. **Financial Losses**: Cloud service credentials can be used to spin up expensive resources for cryptocurrency mining or other unauthorized purposes
6. **Compliance Violations**: Many industries require proper secret management as part of regulatory compliance
7. **Reputation Damage**: Public exposure of secrets can damage trust in your organization and lead to loss of customers

Real-world examples of credential leaks are unfortunately common:
- A developer unintentionally commits AWS keys to a public repository, resulting in thousands of dollars in unauthorized computing charges within hours
- API keys for paid services being scraped from GitHub and used to exceed service quotas, resulting in unexpected bills
- OAuth tokens being exposed and used to access private repositories and intellectual property

Using GitHub Secrets properly helps mitigate these risks by ensuring sensitive information never appears in your codebase or logs.

## Setting Up GitHub Secrets

### Repository-Level Secrets

These are available to workflow runs in a single repository:

1. Navigate to your GitHub repository
2. Click on "Settings" at the top-right
3. In the left sidebar, click on "Secrets and variables" -> "Actions"
4. Click "New repository secret"
5. Enter a name for your secret (e.g., `DATABASE_PASSWORD`)
6. Enter the value in the text field
7. Click "Add secret"

![GitHub Repository Secrets UI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/github-repo-secrets.png)

### Organization-Level Secrets

If you're managing multiple repositories within an organization, you can set up organization-level secrets:

1. Go to your organization's main page
2. Click "Settings"
3. In the left sidebar, click "Secrets and variables" -> "Actions"
4. Click "New organization secret"
5. Enter the name and value
6. Under "Repository access", choose whether to make it available to all repositories or select specific ones
7. Click "Add secret"

## Using GitHub Secrets with GitHub Actions

Once your secrets are set up, you can use them in GitHub Actions workflows. Here's a simple example:

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

Notice how we access the secrets using the syntax `${{ secrets.SECRET_NAME }}`.

## Integrating GitHub Secrets with Containers

### Option 1: Build-time Integration

You can pass secrets to your Docker build process:

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    build-args: |
      API_KEY=${{ secrets.API_KEY }}
```

In your Dockerfile:

```dockerfile
ARG API_KEY
ENV API_KEY=$API_KEY

# Rest of your Dockerfile
```

**Important**: This approach should be used with caution as build arguments can be viewed in the image history. It's better for build-time configuration that doesn't need to remain secret after building.

### Option 2: Runtime Environment Variables

A more secure approach is to pass secrets as environment variables at runtime:

```yaml
- name: Run container
  run: |
    docker run -e "DB_PASSWORD=${{ secrets.DATABASE_PASSWORD }}" \
               -e "API_KEY=${{ secrets.API_KEY }}" \
               myimage:latest
```

### Option 3: Using Docker Compose

If you're using Docker Compose, you can create a `.env` file at runtime:

```yaml
- name: Prepare environment
  run: |
    echo "DB_PASSWORD=${{ secrets.DATABASE_PASSWORD }}" >> .env
    echo "API_KEY=${{ secrets.API_KEY }}" >> .env

- name: Start services
  run: docker-compose up -d
```

## Using GitHub Secrets with Kubernetes

For Kubernetes deployments, you can use GitHub Secrets to create Kubernetes Secrets:

```yaml
- name: Create Kubernetes secret
  run: |
    kubectl create secret generic app-secrets \
      --from-literal=db-password=${{ secrets.DATABASE_PASSWORD }} \
      --from-literal=api-key=${{ secrets.API_KEY }}
```

Or update a Kubernetes manifest file before applying it:

```yaml
- name: Update Kubernetes config
  run: |
    sed -i "s/DB_PASSWORD_PLACEHOLDER/${{ secrets.DATABASE_PASSWORD }}/g" k8s/deployment.yaml
    kubectl apply -f k8s/deployment.yaml
```

## Best Practices for Using GitHub Secrets

1. **Use Specific Names**: Give your secrets descriptive names to avoid confusion
2. **Limit Access**: For organization secrets, only share with repositories that need them
3. **Rotate Regularly**: Update your secrets periodically for enhanced security
4. **Avoid Logging**: Never log or echo secret values in your workflows
5. **Minimize Exposure**: Only use secrets in the specific steps that need them
6. **Clean Up**: Remove any temporary files containing secrets after use
7. **Use Environment Secrets**: For different deployment environments (staging vs production)
8. **Audit Regularly**: Review who has access to your secrets periodically

## Environment-Specific Secrets

For more advanced use cases, GitHub offers environment-specific secrets:

1. Go to your repository settings
2. Click on "Environments" in the left sidebar
3. Create or select an environment
4. Add environment-specific secrets

This allows you to have different secret values for development, staging, and production environments.

## Security Considerations for Internet-Facing Applications

When your containers and applications are exposed to the internet, security becomes even more critical:

1. **Never Expose Secrets in Client-Side Code**: Ensure secrets are only used server-side
2. **Use Secret Rotation**: Implement automatic rotation of credentials
3. **Implement Least Privilege**: Each secret should have minimal required permissions
4. **Monitor Usage**: Set up alerts for unusual access patterns to your services
5. **Consider Using a Secret Manager**: For production systems, consider dedicated solutions like AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault

## Secret Scanning

GitHub offers secret scanning to detect accidentally committed secrets:

1. Go to repository settings
2. Click on "Code security and analysis"
3. Enable "Secret scanning"

This feature will alert you if credentials are accidentally pushed to the repository.

## Using GitHub Secrets with Self-Hosted Applications

For applications hosted on your own infrastructure:

1. Use GitHub Actions to generate a deployment artifact
2. Include a script that fetches secrets from a secure source at runtime
3. Consider using environment files that are generated during deployment

Example workflow:

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

## Secret Management Alternatives on Other Platforms

While this guide focuses on GitHub Secrets, many platforms offer similar functionality for managing sensitive information securely. Here's how secret management works across other popular development platforms:

### GitLab CI/CD Variables

GitLab provides a similar feature called CI/CD Variables:

1. **Project Variables**: Specific to a single project
   - Navigate to your project > Settings > CI/CD
   - Expand the "Variables" section
   - Click "Add Variable" and choose between variable or file type
   - Set "Protect variable" to limit to protected branches/tags
   - Set "Mask variable" to hide values in job logs

2. **Group Variables**: Shared across all projects in a group
   - Go to your group > Settings > CI/CD
   - Follow similar steps as project variables

3. **Instance Variables**: Available to all projects in a GitLab instance (self-hosted)
   - Configured by administrators

Usage in `.gitlab-ci.yml`:
```yaml
deploy:
  script:
    - echo "Deploying with $DB_PASSWORD"
    - deploy-script.sh
```

### Bitbucket Pipelines Variables

Bitbucket Pipelines offers repository and workspace variables:

1. **Repository Variables**: Available to a single repository
   - Repository Settings > Pipelines > Repository variables
   - Add variables with optional "Secured" option to mask values

2. **Workspace Variables**: Shared across all repositories in a workspace
   - Workspace Settings > Pipelines > Workspace variables

Usage in `bitbucket-pipelines.yml`:
```yaml
pipelines:
  default:
    - step:
        script:
          - echo "Using $DB_PASSWORD for deployment"
```

### Digital Ocean App Platform

Digital Ocean's App Platform provides environment management:

1. Navigate to your app in the Digital Ocean dashboard
2. Go to the "Settings" tab
3. Scroll to "Environment Variables"
4. Add variables, marking sensitive ones as "Encrypted"

Digital Ocean automatically injects these variables into your application's environment at runtime.

### Azure DevOps Pipeline Variables

Azure DevOps offers both pipeline and variable groups:

1. **Pipeline Variables**: Defined in the pipeline itself
   - Edit your pipeline > Variables
   - Add name, value, and optionally mark as "Secret"

2. **Variable Groups**: Reusable across multiple pipelines
   - Pipelines > Library > Variable groups
   - Create a group and add variables
   - Link the group to pipelines

Usage in `azure-pipelines.yml`:
```yaml
steps:
- script: echo "Connecting with $(DB_PASSWORD)"
  env:
    DB_PASSWORD: $(DB_PASSWORD)
```

### AWS CodeBuild Environment Variables

AWS CodeBuild provides three types of environment variables:

1. **Plaintext Variables**: For non-sensitive data
2. **Parameter Store Values**: For semi-sensitive data using AWS Systems Manager
3. **Secrets Manager Values**: For highly sensitive data using AWS Secrets Manager

Configuration in `buildspec.yml`:
```yaml
env:
  variables:
    APP_NAME: "my-application"
  parameter-store:
    DB_CONNECTION: "/my-app/database/connection"
  secrets-manager:
    DB_PASSWORD: "production/db/password:password"
```

### Comparing Secret Management Features

| Platform | Local Encryption | Integration | Secret Rotation | RBAC | Audit Logging |
|----------|-----------------|-------------|----------------|------|--------------|
| GitHub Secrets | ✅ | GitHub Actions | Manual | ✅ | ✅ |
| GitLab CI/CD Variables | ✅ | GitLab CI | Manual | ✅ | ✅ |
| Bitbucket Pipelines | ✅ | Bitbucket Pipelines | Manual | Limited | Limited |
| Digital Ocean | ✅ | App Platform | Manual | Limited | ✅ |
| Azure DevOps | ✅ | Azure Pipelines | Manual/Key Vault | ✅ | ✅ |
| AWS CodeBuild | ✅ | CodeBuild/CodePipeline | Auto with Secrets Manager | ✅ | ✅ |

### When to Use Dedicated Secret Management Services

For enterprise applications or highly sensitive deployments, consider dedicated secret management services:

- **HashiCorp Vault**: Open-source, highly configurable secret management with advanced features
- **AWS Secrets Manager**: Managed service with automatic rotation capabilities
- **Azure Key Vault**: Microsoft's solution for secrets, keys, and certificates
- **Google Secret Manager**: Google Cloud's secret management service
- **Doppler**: Developer-friendly, cross-platform secret management

These dedicated services often provide advanced features like:
- Automatic secret rotation
- Detailed access controls and audit trails
- Integration with identity providers
- Version history of secrets
- Hardware security module (HSM) backing

For complex deployments that span multiple platforms, these dedicated services can provide a unified approach to secret management that works across your entire infrastructure.

## Example: Secure Flask Application with SQL Database and Docker

Let's look at a complete example of a Flask application that connects to SQL databases (like PostgreSQL, MySQL, or SQLite) using GitHub Secrets:

1. **Create a Flask application with database connection**:

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

2. **Create a Dockerfile**:

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

3. **GitHub Actions workflow**:

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

In this example:
- We build a Flask application that can connect to various SQL databases (PostgreSQL, MySQL, SQLite) in a Docker container
- We push the container to GitHub Container Registry
- We deploy to a server using SSH, injecting our database credentials and other secrets as environment variables at runtime
- The sensitive database connection information and API keys never appear in the Docker image or the code
- By changing the DB_TYPE secret in GitHub, you can easily switch between different SQL database systems without changing your code

## Conclusion

GitHub Secrets provide a robust solution for managing sensitive information in your development and deployment workflows. By following the practices outlined in this guide, you can ensure your containers and internet-facing applications remain secure while still leveraging the convenience of GitHub's CI/CD capabilities.

Remember, security is an ongoing process. Regularly audit your secrets usage, rotate credentials, and stay informed about best practices in secret management.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.
