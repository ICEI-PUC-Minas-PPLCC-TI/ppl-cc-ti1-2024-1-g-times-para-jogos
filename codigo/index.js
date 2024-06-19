// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo implementa uma API RESTful baseada no JSONServer
// O servidor JSONServer fica hospedado na seguinte URL
// https://jsonserver.rommelpuc.repl.co/contatos
//
// Para montar um servidor para o seu projeto, acesse o projeto 
// do JSONServer no Replit, faça o FORK do projeto e altere o 
// arquivo db.json para incluir os dados do seu projeto.
//
// URL Projeto JSONServer: https://replit.com/@rommelpuc/JSONServer
//
// Autor: Rommel Vieira Carneiro
// Data: 03/10/2023

const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./db/db.json')
const middlewares = jsonServer.defaults()
const axios = require('axios')
const cors = require('cors');

// Para permitir que os dados sejam alterados, altere a linha abaixo
// colocando o atributo readOnly como false.
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(cors())

server.get('/dados-steam', async (req, res) => {
  const steamID = req.query.steamID;
  const apiKey = 'CFF4B22287330E0E42C18FE49749AC03';
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamID}`;

  try {
      const response = await axios.get(url);
      res.json(response.data);
  } catch (error) {
      console.error('Erro ao obter dados da API do Steam:', error);
      res.status(500).send('Erro ao obter dados da API do Steam');
  }
});

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running in http://localhost:3000/login.html')
})