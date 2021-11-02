#!/bin/bash
### BEGIN INIT INFO
# Provides:          node-topics-server
# Required-Start:    $all
# Required-Stop:
# Default-Start:     1 2 3 4 5
# Default-Stop:      0 6
# Short-Description: Topic Server (node.js)
### END INIT INFO
#
# Server connection by topics.
#
SERVICE_NAME="node-topics-server"
APP_PATH="/mnt/kdata/programs/nodejs/tcp-server/v2.0.7"
EXE_FILE=""$APP_PATH"/tcp-server-207.js"
PID_FILE=""$APP_PATH"/topics-server.pid"
HOST="iot.home.com"
PORT="1887"
#
#
#
if [ ! -z "$2" ]; then
    HOST="$2"
fi
if [ ! -z "$3" ]; then
    PORT="$3"
fi
#
# Select accord arguments
#
case $1 in
  start|restart)
    if [ -f $PID_FILE ]; then
      PID_NUMBER=$(cat $PID_FILE)
      kill $PID_NUMBER
      rm $PID_FILE
      sleep 1
    fi
    #
    echo "Server address : $HOST"
    echo "Server Port    : $PORT"
    nohup node $EXE_FILE -host="$HOST" -port="$PORT" >> /dev/null >> /dev/null &
    #
    echo $! > $PID_FILE
    sleep 1
    # checks application running
    echo " Checks for application runnig ..."
    if [ -f $PID_FILE ]; then
      PID_NUMBER=$(cat $PID_FILE)
      PID_NAME=$(ps -p $PID_NUMBER -o comm=)
      echo "   PID:  "$PID_NUMBER""
      echo "   COMM: "$PID_NAME""
      if [ -z "$PID_NAME" ];then
        rm $PID_FILE
      fi
    else 
      echo " [ ERROR ] PID File not found "  
    fi
    ;;
  stop)
    if [ -f $PID_FILE ]; then
      PID_NUMBER=$(cat $PID_FILE)
      kill $PID_NUMBER
      rm $PID_FILE
    fi
    ;;
esac
#
# Checks Service Status
#
PID_NUMBER=0
PID_NAME=""
if [ -f $PID_FILE ]; then
  PID_NUMBER=$(cat $PID_FILE)
  PID_NAME=$(ps -p $PID_NUMBER -o comm=)
  echo " PID: $PID_NUMBER"
  echo " COM: \""$PID_NAME"\""
  if [ -z "$PID_NAME" ];then
    rm $PID_FILE
    echo " $SERVICE_NAME [ bad process ]"
    echo " $SERVICE_NAME [   stopped   ]"
    echo
    exit -1
  fi
  echo " $SERVICE_NAME [   running   ]"
  echo
  exit 0
fi
echo " $SERVICE_NAME [   stopped   ]"
echo
exit 0
