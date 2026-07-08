#!/bin/bash
# SUOP Server Watchdog — keeps Next.js production server alive
# Restarts automatically if the process dies

LOG=/home/z/my-project/dev.log
SERVER=/home/z/my-project/.next/standalone/server.js

while true; do
  # Check if server is listening on port 3000
  if ! ss -tlnp 2>/dev/null | grep -q ":3000.*LISTEN"; then
    echo "[$(date)] Server not running. Starting..." >> $LOG
    cd /home/z/my-project
    PORT=3000 HOSTNAME=0.0.0.0 node $SERVER >> $LOG 2>&1 &
    SERVER_PID=$!
    echo "[$(date)] Started server PID: $SERVER_PID" >> $LOG
    sleep 3
  fi
  sleep 5
done
