const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (!usuarioLogado) {
  const atividadeAmigos = document.getElementById('atividade_amigos');
  atividadeAmigos.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
  const listaAmigos = document.getElementById('lista_amigos');
  listaAmigos.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
} else {
    const userId = localStorage.getItem('usuarioCorrente');
    const currentUserObj = JSON.parse(userId);
    const id = currentUserObj.id;
    var db_usuarios = {}
    fetch('/usuarios').then(response => response.json()).then(data => {
                db_usuarios = data;
            }).catch(error => {
                console.error('Erro ao ler usuários via API JSONServer:', error);
                displayMessage("Erro ao ler usuários");
    });

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

    document.addEventListener('DOMContentLoaded', () => {
        const addFriendForm = document.getElementById('addFriendForm');
        const friendNameInput = document.getElementById('friendName');
        const friendsList = document.getElementById('friendsList');

        // Função para buscar os amigos do usuário
        function fetchFriends() {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then(response => response.json())
                .then(user => {
                    friendsList.innerHTML = '';
                    user.amigos.forEach(friend => { fetch(`http://localhost:3000/usuarios/${friend}`).then(response => response.json()).then(amigo => {
                        const li = document.createElement('li');
                        li.classList.add('friend-item')
                        const img = document.createElement('img');
                        img.src = amigo.profilePhoto;
                        img.alt = "Foto de " + amigo.login;
                        console.log(amigo);
                        const nomeAmigo = document.createElement('span');
                        nomeAmigo.textContent = amigo.login;
                        const statusAmigo = document.createElement('span');
                        if(amigo.status == "online"){
                            statusAmigo.textContent = "Online";
                        } else {
                            statusAmigo.textContent = "Offline";
                        }
                        statusAmigo.classList.add('status', amigo.status);
                        console.log(amigo.login + " status: " + amigo.status);
                        const deleteButton = document.createElement('button');
                        const friendInfo = document.createElement('div');
                        friendInfo.classList.add('friend-info');
                        friendInfo.appendChild(img);
                        friendInfo.appendChild(nomeAmigo);
                        friendInfo.appendChild(statusAmigo);
                        deleteButton.textContent = 'Remover';
                        deleteButton.classList.add('delete');
                        deleteButton.addEventListener('click', () => {
                            deleteFriend(friend);
                        });
                        li.appendChild(friendInfo);
                        li.appendChild(deleteButton);
                        friendsList.appendChild(li);
                    })});
                })
                .catch(error => console.error('Erro ao buscar amigos:', error));
        }

        // Função para adicionar um novo amigo ao servidor
        function addFriend(friendName) {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then(response => response.json())
                .then(user => {
                    let userFound = false;
                    for (var i = 0; i < db_usuarios.length; i++) {
                        var usuario = db_usuarios[i];
                        if (friendName == usuario.login) {
                            userFound = true;
                            const updatedFriends = [...user.amigos, usuario.id];
                            return fetch(`http://localhost:3000/usuarios/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ ...user, amigos: updatedFriends })
                            });
                        }
                    }
                    if (!userFound) {
                    alert("Usuario nao encontrado!");
                }
                }).then(response => response.json()).then(() => {
                    fetchFriends();
                    friendNameInput.value = '';
                }).catch(error => console.error('Erro ao adicionar amigo:', error));
        }
        // Função para deletar um amigo do servidor
        function deleteFriend(friendName) {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then(response => response.json())
                .then(user => {
                    const updatedFriends = user.amigos.filter(friend => friend !== friendName);
                    return fetch(`http://localhost:3000/usuarios/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ...user, amigos: updatedFriends })
                    });
                })
                .then(response => response.json())
                .then(() => {
                    fetchFriends();
                })
                .catch(error => console.error('Erro ao deletar amigo:', error));
        }

        // Evento de submissão do formulário
        addFriendForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const friendName = friendNameInput.value.trim();
            if (friendName) {
                addFriend(friendName);
            }
        });

        // Carregar lista de amigos quando a página é carregada
        fetchFriends();
    });
}