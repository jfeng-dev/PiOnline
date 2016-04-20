# PiOnline

This is yet another tool to solve the 'How do I access my Raspberry Pi from the internet' issue.
There are already services like DynDns and DuckDns, but I wrote this to experiment with systemd services and node.

Requirements:
1. A domain you have access to
2. A free account on Cloudflare

Install
Run sudo install pi-online -g
This takes care of moving the service file, enabling, and starting the service
Add your Cloudflare credentials to ./config/cache.js


