#!/bin/bash

sudo cp ./lib/install/pi-online.service /etc/systemd/system/pi-online.service &&
sudo  systemctl enable pi-online.service &&
sudo systemctl start pi-online.service &
