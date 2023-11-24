## CHALLENGE RATHERLABS

### Tecnología

- NodeJs
- Typescript
- Express
- Websocket

### Herramientas

- Postman
- Newman
- Eslint
- Prettier
- Git
- winston


### Descripción del Servicio

El servicio proporciona información de mercado de criptoactivos a través de Bitfinex, utilizando exclusivamente endpoints públicos del exchange. La fuente de datos se gestiona en tiempo real mediante websockets, permitiendo la suscripción a una criptomoneda específica para obtener información actualizada del orderbook.

El servicio se compone de dos endpoints principales: uno para obtener los mejores precios bid-ask del orderbook y otro para calcular el precio efectivo de una operación de compra/venta. Además, se incluyen endpoints auxiliares para realizar un "health check" del servicio, obtener un reporte de testing en formato HTML (utilizando Newman), y conectar/desconectar a un websocket para recibir actualizaciones en tiempo real del orderbook de un par específico.

### Endpoints

- **Health Check**

GET http://localhost:4000/api/health/check
Permite verificar el estado del servicio, indicando si está en proceso de inicio, ha encontrado algún error, ha completado la inicialización, o se encuentra en un estado desconocido. Ejemplo de respuesta:
```
{
   "message": "Ok"
}
```
- **Obtener Orderbook Tips**

GET http://localhost:4000/api/orderbook/tips/:pair
Permite obtener los mejores precios bid-ask del orderbook para un par de criptomonedas específico. Ejemplo de respuesta:
```

{
   "message": "Ok",
   "data": {
      "pair": "BTCUSD",
      "bid": {
         "price": 37407,
         "count": 1,
         "amount": -0.53466
      },
      "ask": {
         "price": 37310,
         "count": 1,
         "amount": 0.02739
      },
      "error": false,
      "message": "Connection Ok"
   }
}

```

- **Calcular Precio Efectivo de Operación**

POST http://localhost:4000/api/execution/effectivePrice/:pair
Permite calcular el precio efectivo de una operación de compra o venta para un par de criptomonedas específico. Ejemplo de respuesta:

```
{
   "message": "Ok",
   "data": {
      "pair": "XRPUSD",
      "amount": 2,
      "operation": "buy",
      "message": "Effective Price",
      "effectivePrice": 0.62077,
      "error": false
   }
}
```

- **Endpoint de Testing**

GET http://localhost:4000/api/test_view
Retorna el reporte en formato HTML del proceso de testing.

- **Websocket para Orderbook en Tiempo Real**

WEBSOCKET ws://localhost:4000/api/gateway
Permite suscribirse o desuscribirse a un par específico para recibir actualizaciones en tiempo real del orderbook.

```
Subscribirse a un par: 
				{
					"pair": ":PAIR",
					"event": "subscribe"
				}
				
Desubscribirse a un par: 
				{
					"pair": ":PAIR",
					"event": "unsubscribe"
				}
```

### Características y Consideraciones

- El servicio no utiliza un modelado de datos, empleando Redis como fuente de almacenamiento temporal y caché.
- Se generan logs de error e información con Winston.
- Los entornos se configuran en src/infraestructure/server/envs.
- Se utiliza ESLint y Prettier como formateador de código.
- La automatización de testing se realiza con Postman y Newman, generando un reporte en formato HTML.
- Durante la inicialización, se realiza una limpieza de Redis, se espera 10 segundos, se subscriben automáticamente algunas criptomonedas, se espera la conexión y se ejecuta el test.
- En lugar de utilizar testing unitario con Jest o Mocha-Chai, se ha optado por herramientas opcionales que facilitan la automatización de CI/CD.


### Instalación

1) Asegúrese de tener Node.js instalado.

2) Tener Redis corriendo localmente

   - Si no tiene localmente Redis puede correrlo, dependiendo de la ejecución, utilizando docker-compose-redis.yml o bien correr app + Redis con docker-compose.yml

   - Para el punto aterior tener instalado Docker y Docker Compose

3) Modifique los entornos según sea necesario. (.env | .env.local)

4) Si se ejecuta la Aplicación desde la terminal entonces, ejecute los siguientes comandos en la raíz del proyecto:

    ```
        npm install
        opcional: docker-compose -f docker-compose-redis.yml up -d
        npm run start:local => modificar .env.local
    ```
5) Si se ejecuta desde docker-compose.yml App + Redis
   ```
         docker-compose up -d
   ```

6) Una vez inicializado, esperar 10 segundos

7) Pruebe la conexión con el endpoint health check, debería ser message: "Ok"

8) Compruebe el reporte de testing ingresando por el navegador http://localhost:4000/api/test_view

### Nota Final

Se pueden importar los archivos JSON de Newman en Postman para realizar pruebas manuales y explorar los resultados del testing. La elección de herramientas como Postman y Newman se ha realizado para facilitar la automatización del proceso.


### BASIC ARCHITECTURE

![Alt text](/public/image-6.png)
![Alt text](/public/image-3.png)
![Alt text](/public/image-1.png)
![Alt text](/public/image-4.png)
![Alt text](/public/image-5.png)