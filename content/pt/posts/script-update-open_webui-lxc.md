---
date: 2025-03-08T03:47:39.000Z
draft: false
title: Script para Atualizar Open WebUI em um LXC Proxmox
description: null
url: ''
featured_image: /images/open-webui-script-thumb.png
categories:
  - article
tags:
  - Linux
  - Proxmox
  - LXC
  - script
  - Docker
  - open-webui
translation_source_hash: 7c6b25e151c5603bbef85ef44fd93c0e533e1ba719eba4cb59ecdf626245d25f
---
Um script muito simples para aqueles que, por alguma razão estranha, decidiram executar o servidor Open WebUI de dentro de um LXC.

## O problema

Eu realmente gosto da interface no Proxmox e a prefiro a lidar com o Portainer para alguns serviços mais acessados. Este é o caso do [Open WebUI](https://docs.openwebui.com/), que uso diariamente.

O problema que enfrentei foi o processo de atualização do serviço, sobre o qual eu sabia pouco. Então eu precisava entender como o serviço funciona internamente. No Proxmox podemos usar os [Proxmox VE Community Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=openwebui) que são muito úteis, mas não possuem muita documentação sobre como os scripts funcionam. Por causa disso, o usuário precisa ir à documentação do serviço e aprender como ele funciona. Para o Open WebUI, a documentação é direcionada às instalações usando Docker.

No início, eu realmente pensei em migrar o LXC para um contêiner Docker e usar o Watchtower para atualizar o contêiner regularmente, mas então tive a ideia de ir ao repositório público e ler o script diretamente. Primeiro li o script errado com o mesmo nome e fiquei realmente confuso, depois encontrei o espírito correto e ficou claro quais eram os passos para atualizar o contêiner.

Para automatizar este processo, peguei um trecho do script de instalação para o LXC e o modifiquei para que eu pudesse executar a atualização a partir do host Proxmox.

## O script de atualização

```bash

#!/usr/bin/env bash

# Script to update Open WebUI in a Proxmox LXC container

# Check if the container ID is provided
if [[ -z "$1" ]]; then
  echo "Usage: $0 <CTID>"
  echo "Please provide the container ID (CTID) as an argument."
  exit 1
fi

CTID="$1"

# Function to update Open WebUI
update_openwebui() {
  echo "Updating Open WebUI in container $CTID..."
  pct exec "$CTID" -- bash <<EOF
  if [[ ! -d /opt/open-webui ]]; then
    echo "Error: Open WebUI is not installed in this container."
    exit 1
  fi
  echo "Pulling latest code..."
  cd /opt/open-webui
  git pull --no-rebase || { echo "Error: Failed to pull latest code."; exit 1; }
  echo "Updating Node.js dependencies..."
  npm install || { echo "Error: Failed to install Node.js dependencies."; exit 1; }
  export NODE_OPTIONS="--max-old-space-size=3584"
  echo "Building the application..."
  npm run build || { echo "Error: Failed to build the application."; exit 1; }
  echo "Updating Python dependencies..."
  cd ./backend
  pip install -r requirements.txt -U || { echo "Error: Failed to install Python dependencies."; exit 1; }
  echo "Restarting the Open WebUI service..."
  systemctl restart open-webui.service || { echo "Error: Failed to restart the service."; exit 1; }
  echo "Open WebUI updated successfully!"
EOF
}

# Run the update function
update_openwebui

```

Para executar o script:

```bash
# Make it executable
chmod +x update-openwebui.sh


# Run the script with the container ID as an argument
./update-openwebui.sh <CTID>

```

Você também pode criar um cronjob para executar o contêiner com o seguinte comando:

```bash
crontab -e

# Create a cronjob to run every day at 3 in the morning
0 3 * * * /path/to/your/update-openwebui.sh <CTID>

```

## Conclusão

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu email **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
