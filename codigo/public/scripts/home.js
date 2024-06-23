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

        statusForm.addEventListener('submit', function(event) {
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
            const atividadeAmigos = document.getElementById('atividade_amigos');
            fetch(`http://localhost:3000/usuarios/${currentUserObj.id}`)
            .then(response => response.json())
            .then(usuario => {
                const amigosIds = usuario.amigos || [];
                if (amigosIds.length === 0) {
                    console.log('O usuário não tem amigos.');
                    return;
                }
                const fetchAmigos = amigosIds.map(amigoId => {
                    return fetch(`http://localhost:3000/usuarios/${amigoId}`)
                            .then(response => response.json())
                            .catch(error => console.error(`Erro ao buscar amigo ${amigoId}:`, error));
                });
                const fetchStatusUsuario = fetch(`http://localhost:3000/usuarios/${currentUserObj.id}/status`)
                                            .then(response => response.json())
                                            .catch(error => console.error('Erro ao buscar os status do usuário:', error));
                Promise.all([...fetchAmigos, fetchStatusUsuario])
                .then(results => {
                    var amigos = results.slice(0, amigosIds.length);
                    const statusUsuario = results[amigosIds.length];
                    amigos = amigos.filter(amigo => amigo && amigosIds.includes(amigo.id));
                    if (amigos.length === 0) {
                        console.log('Nenhum amigo válido encontrado.');
                        return;
                    }
                    const amigosIdsArray = amigos.map(amigo => amigo.id);
                    fetch(`http://localhost:3000/status`)
                    .then(response => response.json())
                    .then(statuses => {
                        const statusDosAmigos = statuses.filter(status => amigosIdsArray.includes(status.usuario_id));
                        const todosStatus = [...statusUsuario, ...statusDosAmigos];
                        todosStatus.sort((a, b) => new Date(b.horario) - new Date(a.horario));
                        atividadeAmigos.innerHTML = '';
                        todosStatus.forEach(status => {
                            const statusDiv = document.createElement('div');
                            statusDiv.classList.add('status-item');
                            statusDiv.innerHTML = `
                                <p>${status.usuario} (${formatarHorario(status.horario)}):</p>
                                <p>${status.status}</p>
                            `;
                            atividadeAmigos.appendChild(statusDiv);
                        });
                    })
                    .catch(error => console.error('Erro ao buscar os status dos amigos:', error));
                })
                .catch(error => console.error('Erro ao buscar os amigos ou os próprios status:', error));
            })
            .catch(error => console.error('Erro ao buscar informações do usuário:', error));
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
