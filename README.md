# node-tcp-server
Topic based server using javascript

# Requerimientos
Se debe realizar pruebas de conectividad y verificar que las conexiones sean abiertas y bien cerradas.

# Organización
Esta compuesto de dos scripts principales ubicados en la carpeta ` tcp-server/v2.0.7 ` :
- topic-server.sh
- websocket.sh

El primero crea un servidor TCP quien organiza las conexiones en tópicos, tipo [ MQTT ](https://en.wikipedia.org/wiki/MQTT) https://en.wikipedia.org/wiki/MQTT

El segundo crea un servidor WEBSOCKET para enlazar con páginas web, cuyo objeto es enlazar las páginas web con el servidor TCP.



