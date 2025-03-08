---
date: 2025-03-08T00:47:39-03:00
draft: true
title: Script for Updating Open WebUI in a Proxmox LXC
description: 
url: ""
featured_image: /images/open-webui-script-thumb.png
categories:
  - article
tags:
  - Linux
  - Proxmox
  - LXC
  - script
  - Docker
---

A really simple script for those that, for some odd reason, decided to run the Open WebUI server from inside a LXC.

## The problem

I really like the interface in Proxmox and i prefer it than dealing with Portainer for some services that are more accessed. This is the case for [Open WebUI](https://docs.openwebui.com/), which I use daily.

The problem I faced was to understand how the service works under the hood. In Proxmox we can use the [Proxmox VE Community Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=openwebui) which are really handy, but they don't have much documentation on how the scripts work. Because of this, the user has to go to the service documentation and learn how it works. In the case of Open WebUI, the documentation was directed at the use cases using Docker.

So, I really had to start looking around for answers. First I really thought about migrating the LXC to a Docker container and use Watchtower to update the container regularly, but then I had the idea of going to the public repository and reading the script directly. First I read the wrong script with the same name and got really confused, then I found the correct spirit and it become clear what were the steps to update the container.

To automate this process, I took a snippet of the installation script for the LXC and modified it so I could run the update from the Proxmox host.

## The update script

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

To run the script:

```bash
# Make it executable
chmod +x update-openwebui.sh


# Run the script with the container ID as an argument
./update-openwebui.sh <CTID>

```

You can also create a cronjob to run the container with the following command:

```bash
crontab -e

# Create a cronjob to run every day at 3 in the morning
0 3 * * * /path/to/your/update-openwebui.sh <CTID>

```

## Conclusion

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.

{{< form-contact >}}
