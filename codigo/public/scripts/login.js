// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo realiza o registro de novos usuários e login para aplicações com 
// backend baseado em API REST provida pelo JSONServer
// Os dados de usuário estão disponíveis na seguinte URL
// https://jsonserver.rommelpuc.repl.co/usuarios
//
// Para fazer o seu servidor, acesse o projeto do JSONServer no Replit, faça o 
// fork do projeto e altere o arquivo db.json para incluir os dados do seu projeto.
// URL Projeto JSONServer: https://replit.com/@rommelpuc/JSONServer
//
// Autor: Rommel Vieira Carneiro (rommelcarneiro@gmail.com)
// Data: 29/04/2024
//
// Código LoginApp  


// Página inicial de Login
const LOGIN_URL = "login.html";
const apiUrl = '/usuarios';

// Objeto para o banco de dados de usuários baseado em JSON
var db_usuarios = {};

// Objeto para o usuário corrente
var usuarioCorrente = {};

// função para gerar códigos randômicos a serem utilizados como código de usuário
// Fonte: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


// Dados de usuários para serem utilizados como carga inicial
const dadosIniciais = {
    usuarios: [
        { "id": generateUUID (), "login": "admin", "userRole": "", "senha": "123", "nome": "Administrador do Sistema", "email": "admin@abc.com", "steamID": "", "profilePhoto": "", "nascimento": "", "genero": "", "estado": "", "cidade": "", "telefone": "", "amigos": [], "status": ""},
    ]
};

async function checkIfUserIsBanned(userId) {
    try {
        const response = await fetch(`http://localhost:3000/banidos/${userId}`);
        if (!response.ok) {
            return null;
        }
        const bannedUser = await response.json();
        return bannedUser;
    } catch (error) {
        console.error('Erro ao verificar banimento:', error);
        throw error;
    }
}

// Inicializa o usuarioCorrente e banco de dados de usuários da aplicação de Login
function initLoginApp () {
    // PARTE 1 - INICIALIZA USUARIOCORRENTE A PARTIR DE DADOS NO LOCAL STORAGE, CASO EXISTA
    usuarioCorrenteJSON = localStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse (usuarioCorrenteJSON);
    }

    // PARTE 2 - INICIALIZA BANCO DE DADOS DE USUÁRIOS
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            db_usuarios = data;
        })
        .catch(error => {
            console.error('Erro ao ler usuários via API JSONServer:', error);
            displayMessage("Erro ao ler usuários");
        });
};

// Verifica se o login do usuário está ok e, se positivo, direciona para a página inicial
async function loginUser(login, senha) {
    // Verifica todos os itens do banco de dados de usuários 
    // para localizar o usuário informado no formulário de login
    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];
        // Se encontrou login, verifica senha e se o usuário não está banido
        if ((login == usuario.email || login == usuario.login) && senha == usuario.senha) {
            // Verifica se o usuário está banido
            const banned = await checkIfUserIsBanned(usuario.id);
            if (banned) {
                alert(`Você está banido!\nMotivo: ${banned.reason}`);
                return 3; // Retorna 3 indicando que o usuário está banido
            }
            // Se não estiver banido, procede com o login normal
            usuarioCorrente.id = usuario.id;
            usuarioCorrente.login = usuario.login;
            usuarioCorrente.userRole = usuario.userRole;
            usuarioCorrente.email = usuario.email;
            usuarioCorrente.nome = usuario.nome;
            usuarioCorrente.steamID = usuario.steamID;
            usuarioCorrente.profilePhoto = usuario.profilePhoto;
            usuarioCorrente.nascimento = usuario.nascimento;
            usuarioCorrente.genero = usuario.genero;
            usuarioCorrente.estado = usuario.estado;
            usuarioCorrente.cidade = usuario.cidade;
            usuarioCorrente.telefone = usuario.telefone;
            localStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
            return 1; // Retorna 1 indicando login bem-sucedido
        } else if ((login == usuario.email || login == usuario.login) && senha != usuario.senha) {
            return 2; // Retorna 2 indicando senha incorreta
        }
    }
    // Se chegou até aqui é porque não encontrou o usuário
    return -1; // Retorna -1 indicando usuário não encontrado
}

// Apaga os dados do usuário corrente no sessionStorage
function logoutUser () {
    usuarioCorrente = {};
    localStorage.setItem ('usuarioCorrente', JSON.stringify (usuarioCorrente));
    window.location = LOGIN_URL;
}

function addUser (nome, login, senha, email) {

    // Cria um objeto de usuario para o novo usuario 
    let newId = generateUUID ();
    let PhotoUrl = "https://robohash.org/" + encodeURIComponent(newId) + ".png";
    let usuario = { "id": newId, "login": login, "userRole": "", "senha": senha, "nome": nome, "email": email, "steamID": "", "profilePhoto": PhotoUrl, "nascimento": "", "genero": "", "estado": "", "cidade": "", "telefone": "", "amigos": [], "status": "online"};

    // Envia dados do novo usuário para ser inserido no JSON Server
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
    })
        .then(response => response.json())
        .then(data => {
            // Adiciona o novo usuário na variável db_usuarios em memória
            db_usuarios.push (usuario);
            displayMessage("Usuário inserido com sucesso");
        })
        .catch(error => {
            console.error('Erro ao inserir usuário via API JSONServer:', error);
            displayMessage("Erro ao inserir usuário");
        });
}

// Inicializa as estruturas utilizadas pelo LoginApp
initLoginApp ();