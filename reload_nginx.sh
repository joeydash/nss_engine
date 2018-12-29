#!/usr/bin/env bash
git pull
sudo cp -rf default /etc/nginx/sites-available/default
sudo service nginx restart