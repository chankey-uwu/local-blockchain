# Blockchain local con Kurtosis

## Instrucciones
1. En `go-ethereum/` correr el siguiente comando para crear la imagen de geth en Docker (asegurarse de tener Docker Desktop abierto):
   ```console
   ../go-ethereum$ docker build -t geth-usm:v2 .
   ```

2. Determinar los parámetros del archivo `network_params.yaml`, para más información: [Configuración de YAML](https://github.com/ethpandaops/ethereum-package?tab=readme-ov-file#configuration). Tiene que estar incluído `el_image: "geth-usm:v1"` para que use el geth forkeado.

Con `usbipd` se debe "attachear" a wsl y luego cambiar la ruta correcta del bus en `network_params.yaml` 

3. Para iniciar la network, correr en la consola:
   ```console
   ../local-blockchain$ kurtosis run --enclave local-blockchain github.com/ethpandaops/ethereum-package --args-file ./network_params.yaml
   ```

4. Para permitir que el nodo detecte la **YubiKey**:\
   Primero se abre la consola del nodo:
   ```console
   ..$ kurtosis service shell local-blockchain el-1-geth-lighthouse
   ```
   Luego dentro de la consola se ejecuta:
   ```
   / # /usr/sbin/pcscd
   ```

## Comandos Kurtosis
1. `kurtosis enclave inspect local-blockchain`: devuelve la lista de todos los servicios junto sus respectivos puertos.
2. `kurtosis enclave stop local-blockchain`: detiene la ejecución de la Blockchain. ADVERTENCIA: No se puede volver a reanudar.
3. `kurtosis enclave rm -f local-blockchain`: elimina los archivos de la Blockchain.
4. `kurtosis engine restart`: reinicia el motor de kurtosis. Sirve porque a veces quedan Encloves eliminados aún siendo listados o se desconecta de Docker.
5. `kurtosis service shell local-network el-x-geth-lighthouse`: abre una terminal para el servicio **x**.

## Crear cuenta desde geth (con YubiKey)
Crear archivo `password.txt` (si no se hace no deja crear la cuenta):
```
/ # echo "contraseña" > password.txt
```
Dentro del nodo `el-1-geth-lighthouse`, correr:
```
/ # geth account new --password password.txt --yubikey true
```
(Opcional) Eliminar archivo `password.txt`:
```
/ # rm password.txt
```

## Archivos adicionales
1. `transfer.js`: realiza una transacción de 1 ETH desde una cuenta "ballena" a una cuenta a elección.
2. `checkBalance.js`: revisa el saldo de las cuentas (no todas, las que están en una lista).
3. `accountCreate.js`: crea una cuenta e imprime su dirección y llave privada.

## Dora
Abriendo `http://127.0.0.1:35000` en el navegador se puede ver un Dashboard de la Blockchain, como las épocas, bloques, buscar *smart contracts*, etc.

## Clef
**Clef** es el *signer* remoto de **geth**, es necesario correrlo antes que Kurtosis. (Todo se hace en `go-ethereum/` y WSL).
1. Correr el siguiente comando para correr el *daemon* de las *smartcards*:
```console
   ../go-ethereum$ sudo service pcscd start
```
2. Luego se corre **Clef** el cual va a leer las cuentas de la keystore:
```console
   ../go-ethereum$ sudo ./build/bin/clef-linux --keystore ./build/keystore/ --chainid 585858 --http --http.addr "0.0.0.0" --http.port 8550
``` 
## *Smart Contracts*
Se despliega el *smart contract* ubicado en `../local-blockchain/smartcontracts/contracts` llamado `Storage.sol`, el cual almacena un número en la *Blockchain* y luego da la interfaz para cambiarlo y leerlo y luego se interactúa con él:
1. Correr en `../local-blockchain/smartcontracts>` para desplegar el contrato:
   ```console
   ../local-blockchain/smartcontracts> npx hardhat run .\scripts\deploy.js --network kurtosis
   ```
2. Luego, para interactuar con él:
   ```console
   ../local-blockchain/smartcontracts> npx hardhat run .\scripts\interact.js --network kurtosis
   ```