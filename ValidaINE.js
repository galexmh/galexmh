const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 1445;

const user = 'medici'; // Usuario de Windows
const password = 'Medici452'; // Contraseña de Windows
const windowsAuth = new Buffer.from(user + ':' + password).toString('base64');

const apiUser = 'medici-mexico'; // Usuario de API Nubarium
const apiPassword = '_t5E.2Pl'; // Contraseña de API Nubarium
const apiAuth = new Buffer.from(apiUser + ':' + apiPassword).toString('base64');

app.use(bodyParser.json());

app.post('/ine/v2/valida_ine', (req, res) => {
  const postData = JSON.stringify({
    "cic": req.body.cic,
    "identificadorCiudadano": req.body.identificadorCiudadano
  });
  const options = {
    'method': 'POST',
    'hostname': 'rfc.nubarium.com',
    'path': '/ine/v2/valida_ine',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + apiAuth, // Autenticación de API Nubarium
      'Proxy-Authorization': 'Basic ' + windowsAuth // Autenticación de usuario de Windows
    },
    'maxRedirects': 20
  };

  const apiRequest = https.request(options, function (apiResponse) {
    let chunks = [];

    apiResponse.on("data", function (chunk) {
      chunks.push(chunk);
    });

    apiResponse.on("end", function (chunk) {
      const body = Buffer.concat(chunks);
      res.send(body.toString());
    });

    apiResponse.on("error", function (error) {
      console.error(error);
      res.status(500).send({error: 'Internal Server Error'});
    });
  });

  apiRequest.write(postData);
  apiRequest.end();
});

// Carga los archivos de certificado y clave privada para HTTPS
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Inicia el servidor HTTPS
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS iniciado en el puerto ${port}`);
});

