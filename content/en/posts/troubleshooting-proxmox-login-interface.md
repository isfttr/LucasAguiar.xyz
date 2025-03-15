---
date: 2025-03-13T23:29:45-03:00
draft: false
title: Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide
description: 
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-proxmox-login-error.png
categories:
- tutorial
tags:
- linux
- proxmox
- troubleshooting
- tutorial
---


This article details a troubleshooting process for a Proxmox cluster authentication failure that prevented users from logging into the web interface. The root cause was identified as a missing `/etc/pve/access.cfg` file, crucial for user authentication, likely due to `corosync` communication issues. The problem was resolved by restarting the `pve-cluster` service, forcing quorum, manually creating a minimal `access.cfg` file, and restarting the `pveproxy` service. Preventative measures include regular cluster health checks, automated configuration file backups, ensuring proper shutdown procedures, maintaining network stability, monitoring storage health, applying Proxmox updates, and careful permissions management.

## Initial Investigation

1. **Service Status:** Checked the status of `pve-cluster` and `pveproxy` services, which were running.
2. **Logs:** Examined logs for errors related to RRD database updates.
3. **Authentication Configuration:** Verified `/etc/pve/user.cfg`.
4. **Missing Configuration File:** Discovered that `/etc/pve/access.cfg` was missing.
5. **Firewall Interference:** Suspected Tailscale firewall rules might be interfering. Attempted to adjust iptables.

Here are the commands used during the investigation:

```bash
# 1. Check service status
systemctl status pve-cluster
systemctl status pveproxy

# 2. Check logs for errors
journalctl -u pveproxy -n 100
journalctl -u pve-cluster -n 100
tail -n 100 /var/log/pveproxy/access.log

# 3. Verify authentication configuration
cat /etc/pve/user.cfg
ls -la /etc/pve/user.cfg

# 4. Check for missing access.cfg
ls -la /etc/pve/access.cfg
file /etc/pve/access.cfg

# 5. Check firewall rules and Tailscale status
iptables -L -n -v
tailscale status
systemctl status tailscaled
```

## Root Cause Analysis

The primary cause of the login issue was the absence of the `/etc/pve/access.cfg` file. This file is crucial for user authentication in Proxmox. Its absence indicated a potential problem with the Proxmox cluster configuration, possibly related to the `corosync` service.

Further investigation revealed issues with `corosync` connectivity and permissions related to `pve-ha-lrm`. Although `corosync` was running, errors indicated communication problems within the cluster. The `/etc/pve/access.cfg` file wasn't being automatically generated or populated, leading to authentication failures.

The filesystem check on `/etc/pve` showed it was a FUSE filesystem, making underlying storage issues less likely, focusing the investigation on the cluster configuration itself.

## Solution

The following steps were taken to resolve the issue:

1. **Restarted `pve-cluster` service:** Stopped and started the `pve-cluster` service to attempt to re-establish cluster connectivity.
2. **Forced Quorum:** This step potentially helped to re-establish cluster leadership.
3. **Created `access.cfg` file:** Manually created the `/etc/pve/access.cfg` file with minimal content.
4. **Restarted `pveproxy` service:** Restarted the `pveproxy` service to force it to recognize the newly created `access.cfg` file.

Here are the commands used to implement the solution:

```bash
# 1. Restart pve-cluster service
systemctl stop pve-cluster
systemctl start pve-cluster
systemctl status pve-cluster

# 2. Force quorum in a single-node setup
pvecm expected 1

# 3. Create minimal access.cfg file
cat > /etc/pve/access.cfg << 'EOF'
acl:1
path /
role Administrator
user root@pam
EOF

chmod 0640 /etc/pve/access.cfg
chown root:www-data /etc/pve/access.cfg

# 4. Restart pveproxy service
systemctl restart pveproxy
systemctl status pveproxy
```

After these steps, users were able to log in to the Proxmox web interface successfully.

## Additional Notes

- If the login still fails after these steps, further investigation into user permissions and the contents of `access.cfg` may be required. The `pveum` command-line tools can be used to manage users and permissions.

## Prevention measures

Preventing the "Proxmox Authentication Failure due to Missing Cluster Configuration File" error involves ensuring the stability and proper functioning of the Proxmox cluster and its configuration files. Here are several strategies:

1. **Regular Cluster Health Checks:**
  
  - Implement automated monitoring of the Proxmox cluster's health. This should include checks for:
  
  - Corosync quorum status: Ensure the cluster maintains a quorum to prevent configuration inconsistencies.  
  - Service status: Monitor the status of critical services like `pve-cluster`, `pveproxy`, `corosync`, `pve-ha-lrm`, and `pve-ha-crm`.  
  - Log analysis: Regularly scan logs for errors or warnings related to cluster communication, authentication, and storage.

2. **Configuration File Backups:**
  
  - Automate regular backups of the `/etc/pve` directory. This allows for quick restoration of configuration files in case of accidental deletion or corruption.

3. **Proper Shutdown Procedures:**
  
  - Ensure that all Proxmox nodes are shut down gracefully. Avoid abrupt shutdowns or power outages, as these can lead to data corruption or configuration inconsistencies.

4. **Network Stability:**
  
  - Maintain a stable and reliable network connection between the Proxmox nodes. Network disruptions can lead to cluster instability and configuration issues.

5. **Storage Health Monitoring:**
  
  - Monitor the health of the underlying storage used by the Proxmox cluster. Storage failures can lead to data loss and configuration corruption.

6. **Proxmox Updates and Patches:**
  
  - Keep the Proxmox installation up to date with the latest updates and security patches. These updates often include bug fixes and improvements that can enhance cluster stability.

7. **Permissions Management:**
  
  - Review and manage file permissions within the `/etc/pve` directory. Ensure that the correct users and groups have the necessary permissions to access and modify configuration files.  
  - Avoid making manual changes to files in `/etc/pve` unless absolutely necessary, and always back up the original file before making any changes.

8. **Cluster Awareness during Maintenance:**
  
  - When performing maintenance on any node in the cluster, ensure that the other nodes are aware of the maintenance and can maintain quorum. Consider using Proxmox's built-in maintenance mode.

9. **Implement redundancy**
  
  - Consider having multiple nodes. If `/etc/pve/access.cfg` is missing on one node, it can be copied over from another.

By implementing these preventative measures, you can significantly reduce the risk of encountering the "Proxmox Authentication Failure due to Missing Cluster Configuration File" error and ensure the stability and reliability of your Proxmox cluster.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.

{{< form-contact >}}
