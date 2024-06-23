const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (usuarioLogado == false) {
  const atividadeAmigos = document.getElementById('atividade_amigos');
  atividadeAmigos.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
  const listaAmigos = document.getElementById('lista_amigos');
  listaAmigos.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
  const statusElement = document.querySelector('.status');
  statusElement.classList.add('hidden');
} 
    const userId = usuarioLogado === false ? '-1' : localStorage.getItem('usuarioCorrente');
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
        const statusForm = document.getElementById('statusForm');
        const statusContent = document.getElementById('statusContent');
        const atividadeAmigos = document.getElementById('atividade_amigos');

        statusContent.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                const status = statusContent.value.trim();
                    if (status === '') {
                        alert('Por favor, digite algo para publicar.');
                        return;
                    }
                    const data = {
                        usuario: currentUserObj.login,
                        status: status,
                        horario: new Date().toISOString() 
                    };
                    fetch('http://localhost:3000/status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(status => {
                        statusContent.value = '';
                        fetchAndDisplayStatuses();
                    })
                    .catch(error => console.error('Erro ao enviar o status:', error));
                }
        });

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
                        const nomeAmigo = document.createElement('span');
                        nomeAmigo.textContent = amigo.login;
                        const statusAmigo = document.createElement('span');
                        if(amigo.status == "online"){
                            statusAmigo.textContent = "Online";
                        } else {
                            statusAmigo.textContent = "Offline";
                        }
                        statusAmigo.classList.add('status', amigo.status);
                        const deleteButton = document.createElement('button');
                        const friendInfo = document.createElement('div');
                        friendInfo.classList.add('friend-info');
                        friendInfo.appendChild(img);
                        friendInfo.appendChild(nomeAmigo);
                        friendInfo.appendChild(statusAmigo);
                        deleteButton.textContent = 'x';
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

        function fetchAndDisplayStatuses() {
            fetch(`http://localhost:3000/usuarios/${currentUserObj.id}`)
                .then(response => response.json())
                .then(currentUser => {
                    const amigosIds = currentUser.amigos || [];
                    const fetchAmigos = amigosIds.map(amigoId => {
                        return fetch(`http://localhost:3000/usuarios/${amigoId}`)
                            .then(response => response.json())
                            .then(amigo => {
                                return {
                                    nome: amigo.login,
                                    fotoPerfil: amigo.profilePhoto
                                };
                            })
                            .catch(error => console.error(`Erro ao buscar amigo ${amigoId}:`, error));
                    });
                    Promise.all(fetchAmigos)
                        .then(amigos => {
                            fetch(`http://localhost:3000/status`)
                                .then(response => response.json())
                                .then(statuses => {
                                    const todosStatus = statuses.filter(status => {
                                        return amigos.some(amigo => amigo.nome === status.usuario) || status.usuario === currentUserObj.login;
                                    });
                                    todosStatus.sort((a, b) => new Date(b.horario) - new Date(a.horario));
                                    const atividadeAmigos = document.getElementById('atividade_amigos');
                                    atividadeAmigos.innerHTML = '';
                                    todosStatus.forEach(status => {
                                        const amigo = amigos.find(amigo => amigo.nome === status.usuario);
                                        const fotoPerfil = amigo ? amigo.fotoPerfil : currentUser.profilePhoto;
                                        const statusDiv = document.createElement('div');
                                        statusDiv.classList.add('status-item');
                                        statusDiv.innerHTML = `
                                            <p style="display: flex; align-items: center;"><img src="${fotoPerfil}" alt="Foto de perfil" style="width: 64px; height: 64px; border-radius: 50%; margin-right: 10px; display: inline;"><strong>${status.usuario} (${formatarHorario(status.horario)}):</strong></p>
                                            <p>${status.status}</p>
                                        `;
                                        atividadeAmigos.appendChild(statusDiv);
                                    });
                                })
                                .catch(error => console.error('Erro ao buscar os status:', error));
                        })
                        .catch(error => console.error('Erro ao buscar os nomes dos amigos:', error));
                })
                .catch(error => console.error('Erro ao buscar informações do usuário atual:', error));
        }
    
        function formatarHorario(data) {
            const date = new Date(data);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
        }
        addFriendForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const friendName = friendNameInput.value.trim();
            if (friendName) {
                addFriend(friendName);
            }
        });
        fetchFriends();
        fetchAndDisplayStatuses();
    });
