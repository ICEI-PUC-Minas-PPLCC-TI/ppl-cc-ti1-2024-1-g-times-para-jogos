const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const openid = require('openid');
const axios = require('axios');
const jsonServer = require('json-server');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const relyingParty = new openid.RelyingParty(
    'http://localhost:3000/api/auth/steam/return',
    null,
    true,
    true,
    []
);

app.use(session({
    secret: 'dwP[J5w&{SQ&~JWp{e^ZB1C)!0bFZz0G&D_i,=8pJ=!$HN-LKH',
    resave: false,
    saveUninitialized: true,
}));

// Roteador separado para autenticação Steam
const authRouter = express.Router();

authRouter.get('/auth/steam', (req, res) => {
    const userID = req.query.userID;
    res.cookie('userID', userID, { maxAge: 900000, httpOnly: true });
    relyingParty.authenticate('https://steamcommunity.com/openid', false, (error, authUrl) => {
        if (error) {
            res.status(500).send('Erro na autenticação: ' + error);
        } else {
            res.redirect(authUrl);
        }
    });
});

authRouter.get('/auth/steam/return', (req, res) => {
    const userID = req.cookies.userID;
    console.log("userID:", userID);
    if (!userID) {
        console.error('userID não está definido na sessão.');
        return res.status(500).send('Erro durante a autenticação com Steam. Por favor, tente novamente mais tarde.');
    }
    relyingParty.verifyAssertion(req, async (error, result) => {
        if (error) {
            console.error('Erro durante a autenticação:', error.message || error);
            return res.status(500).send('Falha na autenticação com Steam. Por favor, tente novamente mais tarde.');
        }

        if (!result.authenticated) {
            console.error('Autenticação falhou:', result.error_message || 'Não autenticado');
            return res.status(500).send('Falha na autenticação com Steam. Por favor, tente novamente mais tarde.');
        }

        const steamID = result.claimedIdentifier.split('/').pop();
        req.session.steamID = steamID;

        try {
            await axios.patch(`http://localhost:3000/usuarios/${userID}`, {
                steamID: steamID,
            }, {
                withCredentials: true
            });
        } catch (updateError) {
            console.error('Erro ao atualizar usuário:', updateError.message || updateError);
            return res.status(500).send('Erro ao atualizar usuário. Por favor, tente novamente mais tarde.');
        }

        res.redirect(`http://localhost:3000/perfil.html`);
    });
});

authRouter.get('/meu-perfil', (req, res) => {
    if (req.session.steamID) {
        res.send(`<h1>Seu perfil</h1><p>Steam ID: ${req.session.steamID}</p>`);
    } else {
        res.send('<h1>Seu perfil</h1><p>Você não está conectado ao Steam</p>');
    }
});

app.use('/api', authRouter);

const jsonServerRouter = jsonServer.router('./db/db.json');
const middlewares = jsonServer.defaults();
app.use(middlewares);
app.use(jsonServer.bodyParser);

app.get('/dados-steam', async (req, res) => {
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

app.use(jsonServerRouter);

app.listen(3000, () => {
    console.log(`Servidor rodando em http://localhost:3000`);
});
