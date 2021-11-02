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

# Uso
## topic-server.sh

```
node <path>/topic-server-207 -host="127.0.0.1" -port=1887  
```
donde:

| Argumento | Descripción |
| :-------: | :---------- |
| ` <path> `  | Carpeta donde esta ubicado el script |  
| ` host `  | Dirección local para el servidor TCP |    
| ` port `  | Puerto de escucha |


## websocket.sh
```
node <path>/websocket-207 -config="<ptah>/websocket.json"
```
donde:

| Argumento | Descripción |
| :-------: | :---------- |
| ` <path> `  | Carpeta donde esta ubicado el script y el json |  
| ` config `  | Indica la ruta "completa" del archico de configuración |  


##websocket.json
```json
{
  "local": {
    "host": "localhost",
    "port": 8002,
    "keepAlive": 30,
    "ipName": "dhp.webserver",
    "scounter": 1
  },
  "remote": {
    "host": "iot.home.com",
    "port": 1887,
    "keepAlive": 30,
    "device_id": "dhp.websocket.server.102",
    "device_type": "websocket.server",
    "username": "infomedia",
    "password": "****",
    "topics": [
      "infomedia/websocket"
    ]
  }
}
```
donde:

| Argumento | Descripción |
| :-------: | :---------- |
| ` local `  | Corresponde a los argumentos para la conexión websockets |  
| ` remote `  | Corresponde a los argumentos para la conexión TCP |  

**remote** debe corresponder a los argumentos del [ servidor TCP ](#topic-server.sh) 


# Visor
Se ha dispuesto de un visor basico en java, donde se puede ver el flujo de la información.
Las acciones y su significado en el archivo ` topic-driver-207.js ` 

## correr el visor
```
java -Dswing.aatext="true" -Dawt.useSystemAAFontSettings="gasp" -jar "$INIT_PATH/swing-tcp-viewer-1.0.6.jar" -cfg="$INIT_PATH/config.json" -look="GTK+"
```
 > En Windows puede que el argumento -look="GTK+" no funcione, puede omitirlo 

 > **config.json** mantendra los comados que envie, como un log

# Creando conexiones HTML






