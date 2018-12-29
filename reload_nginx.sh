#!/usr/bin/env bash
cd ~/Accomox
git pull
sudo cp -rf ~/Accomox/default /etc/nginx/sites-available/default
sudo service nginx restart