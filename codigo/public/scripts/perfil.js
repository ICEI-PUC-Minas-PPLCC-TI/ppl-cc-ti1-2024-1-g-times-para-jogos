const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (!usuarioLogado) {
    window.location.href = 'login.html';
}
const userId = usuarioLogado === false ? '-1' : localStorage.getItem('usuarioCorrente');
const currentUserObj = JSON.parse(userId);
const id = currentUserObj.id;
    //Pegando o usuario atual logado
    async function updateLocalStorageFromServer(userId) {
        try {
            const response = await fetch(`http://localhost:3000/usuarios/${currentUserObj.id}`);
            if (!response.ok) {
                throw new Error('Não foi possível requisitar o ID: ' + response.statusText);
            }
            const userData = await response.json();
            localStorage.setItem('usuarioCorrente', JSON.stringify(userData));
            console.log('Dados do usuário atualizados no localStorage:', userData);
        } catch (error) {
            console.error('Houve um problema ao atualizar os dados do usuário no localStorage:', error);
        }
    }

    updateLocalStorageFromServer(userId).then(() => {
        const currentUserObj = JSON.parse(localStorage.getItem('usuarioCorrente'));
        const steamID = currentUserObj.steamID;
        //Vendo se ja existe um steamID conectado com a conta, para poder colocar no Perfil, caso nao haja, dizer que nao esta conectado
        if (steamID) {
            fetch(`http://localhost:3000/dados-steam?steamID=${steamID}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.response && data.response.players && data.response.players.length > 0) {
                    const playerName = data.response.players[0].personaname;
                    const profileLink = data.response.players[0].profileurl;
                    const linkElement = document.createElement('a');
                    linkElement.href = profileLink;
                    linkElement.textContent = playerName;
                    linkElement.setAttribute('target', '_blank')
                    const steamStatusElement = document.getElementById('steam-status');
                    steamStatusElement.innerHTML = '';
                    steamStatusElement.appendChild(linkElement);
                    document.getElementById('connect-item').style.display = 'none';
                } else {
                    document.getElementById('steam-status').innerText = "Não conectado";
                }
            })
            .catch(error => console.error('Erro ao obter informações do usuário da Steam:', error));
        } else {
            document.getElementById('steam-status').innerText = "Não conectado";
        }

        //Pegando a foto no JSONserver do usuario atual

        fetch('http://localhost:3000/usuarios/' + currentUserObj.id)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nao foi possivel requisitar o ID' + response.statusText);
                }
                return response.json();
            })
            .then(user => {
                const profilePhotoUrl = user.profilePhoto;
                document.getElementById('foto_de_perfil').src = profilePhotoUrl;
            })
            .catch(error => {
                console.error('Houve um problema com a operacao fetch:', error);
            });

        //Funcao para enviar a foto que o usuario der uploud em um servico de hospedagem de imagens

        async function uploadImageToImgBB(imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch('https://api.imgbb.com/1/upload?key=d40dec01f29b3e891bdcb3fc528e2c6e', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.data.url;
        }

        //Funcao para salvar o link da imagem que o usuario fez uploud no JSONserver

        async function saveImageLinkToUserServer(userId, imageLink) {
            const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ profilePhoto: imageLink })
            });

            const userData = await response.json();
            return userData;
        }

        //Funcao para de fato dar update na senha no JSONserver

        async function updatePass(userId, newPass) {
            const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ senha: newPass })
            });
            const userData = await response.json();
            return userData;
        }

        //Formatando a data de nascimento do usuario (se houver)

        function formatarData(data) {
            const partes = data.split('-');
            if (partes.length === 3) {
                return `${partes[0]}-${partes[1]}-${partes[2]}`;
            } else {
                console.error('Formato de data inválido:', data);
                return data;
            }
        }

        //Funcao para alterar a senha

        document.getElementById('alterarSenha').addEventListener('click', function(event) {
            event.preventDefault();
            const novaSenha = window.prompt('Digite sua nova senha:');
            const confirmarSenha = window.prompt('Confirme sua nova senha:')
            if (novaSenha !== null && confirmarSenha !== null && novaSenha === confirmarSenha) {
                updatePass(currentUserObj.id, novaSenha);
                console.log("Senha alterada com sucesso");
            } else {
                console.log("Senhas nao correspondem ou sao invalidas");
            }
        });

        //Formatacao do campo de telefone do usuario

    document.addEventListener('DOMContentLoaded', function () {
        var telefoneInput = document.getElementById('telefone');
        var telefoneMask = IMask(telefoneInput, {
            mask: '(00) 00000-0000'
        });
    });

    //Funcao gatilho para alterar a foto do usuario

    document.getElementById('profile_picture').addEventListener('change', function(event) {
        var file = event.target.files[0];
        uploadImageToImgBB(file)
        .then(imageLink => {
            console.log('Imagem enviada com sucesso:', imageLink);
            document.getElementById('foto_de_perfil').src = imageLink;
            return saveImageLinkToUserServer(userId, imageLink);
        })
        .then(userData => {
            console.log('Link da imagem salvo no JSON do usuário:', userData.profilePhoto);
        })
        .catch(error => {
            console.error('Houve um problema:', error);
        })
    });

    //Funcao gatilho para iniciar o vinculo das conta steam

    document.querySelectorAll('.connect-item').forEach(item => {
        item.addEventListener('click', function(event) {
            if(event.target.classList.contains('fa-steam')){
                const userID = currentUserObj.id;
                if (currentUserObj.steamID == "") {
                    console.log('Iniciar processo de vinculação da conta Steam...');
                    window.location.href = `http://localhost:3001/auth/steam?userID=${userID}`
                }
            }
        });
    });

    // Evento para fazer as alteracoes do perfil

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('.salvar-conta').addEventListener('click', () => {
            const userId = currentUserObj.id;
            const updatedAccountData = {
                login: document.getElementById('username').value,
                email: document.getElementById('email').value
            };
            updateUserData(userId, updatedAccountData);
        });

        document.querySelector('.salvar-pessoal').addEventListener('click', () => {
            const userId = currentUserObj.id; 
            var getGenero = document.getElementById("genero");
            var generoUser = getGenero.options[getGenero.selectedIndex].text;
            const updatedPersonalData = {
                nome: document.getElementById('nome').value,
                nascimento: document.getElementById('birthday').value,
                genero: generoUser,
                estado: document.getElementById('estado').value,
                cidade: document.getElementById('cidade').value,
                telefone: document.getElementById('telefone').value
            };
            updateUserData(userId, updatedPersonalData);
        });
        fillingForms(currentUserObj);
    });

    document.getElementById('logout').addEventListener('click', function(event) {
        fetch(`http://localhost:3000/usuarios/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "offline" })
        });
        usuarioCorrente = {};
        localStorage.setItem('usuarioCorrente', JSON.stringify (usuarioCorrente));
        window.location = 'login.html';
    });
    });
    //Preenchendo os campos do usuario no meu perfil

    async function fillingForms(userId) {
        try {
            const response = await fetch('http://localhost:3000/usuarios/' + userId.id);
            const userData = await response.json();
            document.getElementById('username').value = userData.login;
            document.getElementById('nome').value = userData.nome;
            document.getElementById('email').value = userData.email;
            if (userData.nascimento && !isNaN(Date.parse(userData.nascimento))) {
                const formattedBirthday = formatarData(userData.nascimento);
                document.getElementById('birthday').value = formattedBirthday;
            } else {
                console.error('Data de nascimento inválida:', userData.nascimento);
            }
            document.getElementById('genero').value = userData.genero;
            document.getElementById('estado').value = userData.estado;
            document.getElementById('cidade').value = userData.cidade;
            document.getElementById('telefone').value = userData.telefone;
        } catch (error) {
            console.error('Houve um problema ao preencher os dados do perfil:', error);
        }
    }

    //Atualizando os dados do usuario no JSONserver

    async function updateUserData(userId, updatedUserData) {
        try {
            const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUserData)
            });

            const updatedData = await response.json();
            console.log('Dados do usuário atualizados com sucesso:', updatedData);
        } catch (error) {
            console.error('Houve um problema ao atualizar os dados do usuário:', error);
        }
    }

    //Formatacao do campo de telefone do usuario

    document.addEventListener('DOMContentLoaded', function () {
        var telefoneInput = document.getElementById('telefone');
        var telefoneMask = IMask(telefoneInput, {
            mask: '(00) 00000-0000'
        });
    });

    //Funcao gatilho para alterar a foto do usuario

    document.getElementById('profile_picture').addEventListener('change', function(event) {
        var file = event.target.files[0];
        uploadImageToImgBB(file)
        .then(imageLink => {
            console.log('Imagem enviada com sucesso:', imageLink);
            document.getElementById('foto_de_perfil').src = imageLink;
            return saveImageLinkToUserServer(userId, imageLink);
        })
        .then(userData => {
            console.log('Link da imagem salvo no JSON do usuário:', userData.profilePhoto);
        })
        .catch(error => {
            console.error('Houve um problema:', error);
        })
    });

    //Funcao gatilho para iniciar o vinculo das conta steam

    document.querySelectorAll('.connect-item').forEach(item => {
        item.addEventListener('click', function(event) {
            if(event.target.classList.contains('fa-steam')){
                const userID = currentUserObj.id;
                if (currentUserObj.steamID == "") {
                    console.log('Iniciar processo de vinculação da conta Steam...');
                    window.location.href = `http://localhost:3001/auth/steam?userID=${userID}`
                }
            }
        });
    });

    // Evento para fazer as alteracoes do perfil

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('.salvar-conta').addEventListener('click', () => {
            const userId = currentUserObj.id;
            const updatedAccountData = {
                login: document.getElementById('username').value,
                email: document.getElementById('email').value
            };
            updateUserData(userId, updatedAccountData);
        });

        document.querySelector('.salvar-pessoal').addEventListener('click', () => {
            const userId = currentUserObj.id; 
            var getGenero = document.getElementById("genero");
            var generoUser = getGenero.options[getGenero.selectedIndex].text;
            const updatedPersonalData = {
                nome: document.getElementById('nome').value,
                nascimento: document.getElementById('birthday').value,
                genero: generoUser,
                estado: document.getElementById('estado').value,
                cidade: document.getElementById('cidade').value,
                telefone: document.getElementById('telefone').value
            };
            updateUserData(userId, updatedPersonalData);
        });
        fillingForms(currentUserObj);
    });

    document.getElementById('logout').addEventListener('click', function(event) {
        fetch(`http://localhost:3000/usuarios/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "offline" })
        });
        usuarioCorrente = {};
        localStorage.setItem('usuarioCorrente', JSON.stringify (usuarioCorrente));
        window.location = 'login.html';
    });