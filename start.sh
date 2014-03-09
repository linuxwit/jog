#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
        export PATH=../../node/0.10.26/bin:/usr/local/bin:$PATH
        forever start --sourceDir /home/sites/jog app.js >> /home/log/log.txt 2>&1
fi

# @reboot /path/to/starter.sh