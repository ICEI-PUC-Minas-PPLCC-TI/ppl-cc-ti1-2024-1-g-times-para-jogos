const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const openid = require('openid');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(cookieParser());

const relyingParty = new openid.RelyingParty(
    'http://localhost:3001/auth/steam/return', // URL para receber a resposta de autenticação
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

app.get('/auth/steam', (req, res) => {
    const userID = req.query.userID;
    res.cookie('userID', userID, { maxAge: 900000, httpOnly: true})
    relyingParty.authenticate(`https://steamcommunity.com/openid`, false, (error, authUrl) => {
        if (error) {
            res.status(500).send('Erro na autenticação: ' + error);
        } else {
            // Redireciona para a página de autenticação da Steam
            // Inclui o userID como um parâmetro na URL de retorno
            res.redirect(authUrl);
        }
    });
});

app.get('/auth/steam/return', (req, res) => {
    // Recuperar o userID da sessão
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
        
        // Atualize a sessão com o steamID
        req.session.steamID = steamID;

        // Atualize o usuário no JSONServer
        try {
            await axios.patch(`http://localhost:3000/usuarios/${userID}`, {
                steamID: steamID,
            });
        } catch (updateError) {
            console.error('Erro ao atualizar usuário:', updateError.message || updateError);
            return res.status(500).send('Erro ao atualizar usuário. Por favor, tente novamente mais tarde.');
        }

        res.redirect(`http://localhost:3000/perfil.html`);
    });
});

app.get('/meu-perfil', (req, res) => {
    if (req.session.steamID) {
        res.send(`<h1>Seu perfil</h1><p>Steam ID: ${req.session.steamID}</p>`);
    } else {
        res.send('<h1>Seu perfil</h1><p>Você não está conectado ao Steam</p>');
    }
});

app.get('/auth/steam/callback', async (req, res) => {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback('http://localhost:3001/auth/steam/callback', params);
    req.session.steamProfile = tokenSet.claims();
    const userID = req.query.userID;
    res.redirect(`http://localhost:3000/perfil.html?steamID=${req.session.steamProfile.sub}&userID=${userID}`);
});

app.listen(3001, () => {});
