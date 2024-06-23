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
        const friendRequestsList = document.getElementById('friendList')

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

        function fetchFriendRequests() {
            fetch(`http://localhost:3000/solicitacoesAmizade?para=${id}`)
                .then(response => response.json())
                .then(requests => {
                    const friendRequestsList = document.getElementById('friendRequestsList');
                    friendRequestsList.innerHTML = '';
        
                    requests.forEach(request => {
                        fetch(`http://localhost:3000/usuarios/${request.de}`)
                            .then(response => response.json())
                            .then(amigo => {
                                const li = document.createElement('li');
                                li.classList.add('friend-request-item');
        
                                const img = document.createElement('img');
                                img.src = amigo.profilePhoto;
                                img.alt = "Foto de " + amigo.login;
        
                                const nomeAmigo = document.createElement('span');
                                nomeAmigo.textContent = amigo.login;
        
                                const acceptButton = document.createElement('button');
                                acceptButton.textContent = 'Aceitar';
                                acceptButton.addEventListener('click', () => {
                                    acceptFriendRequest(request.id);
                                });
        
                                const declineButton = document.createElement('button');
                                declineButton.textContent = 'Recusar';
                                declineButton.addEventListener('click', () => {
                                    declineFriendRequest(request.id);
                                });
        
                                const buttonsDiv = document.createElement('div');
                                buttonsDiv.classList.add('friend-request-buttons');
                                buttonsDiv.appendChild(acceptButton);
                                buttonsDiv.appendChild(declineButton);
        
                                li.appendChild(img);
                                li.appendChild(nomeAmigo);
                                li.appendChild(buttonsDiv);
        
                                friendRequestsList.appendChild(li);
                            })
                            .catch(error => console.error('Erro ao buscar usuário:', error));
                    });
                })
                .catch(error => console.error('Erro ao buscar solicitações de amizade:', error));
        }

        function fetchFriends() {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then(response => response.json())
                .then(user => {
                    const friendsList = document.getElementById('friendsList');
                    friendsList.innerHTML = '';
        
                    user.amigos.forEach(friend => {
                        fetch(`http://localhost:3000/usuarios/${friend}`)
                            .then(response => response.json())
                            .then(amigo => {
                                const li = document.createElement('li');
                                li.classList.add('friend-item');
        
                                const img = document.createElement('img');
                                img.src = amigo.profilePhoto;
                                img.alt = "Foto de " + amigo.login;
        
                                const nomeAmigo = document.createElement('span');
                                nomeAmigo.textContent = amigo.login;
        
                                const statusAmigo = document.createElement('span');
                                statusAmigo.textContent = amigo.status === "online" ? "Online" : "Offline";
                                statusAmigo.classList.add('status', amigo.status);
        
                                const deleteButton = document.createElement('button');
                                deleteButton.textContent = 'x';
                                deleteButton.classList.add('delete');
                                deleteButton.addEventListener('click', () => {
                                    deleteFriend(friend);
                                });
        
                                const friendInfo = document.createElement('div');
                                friendInfo.classList.add('friend-info');
                                friendInfo.appendChild(img);
                                friendInfo.appendChild(nomeAmigo);
                                friendInfo.appendChild(statusAmigo);
        
                                li.appendChild(friendInfo);
                                li.appendChild(deleteButton);
        
                                friendsList.appendChild(li);
                            })
                            .catch(error => console.error('Erro ao buscar amigo:', error));
                    });
                })
                .catch(error => console.error('Erro ao buscar amigos:', error));
        }

        function addFriend(friendName) {
            fetch(`http://localhost:3000/usuarios`)
                .then(response => response.json())
                .then(usuarios => {
                    const friend = usuarios.find(usuario => usuario.login === friendName);
                    if (!friend) {
                        alert("Usuário não encontrado!");
                        return;
                    }
        
                    const newRequest = {
                        de: id,
                        para: friend.id
                    };
        
                    fetch(`http://localhost:3000/solicitacoesAmizade`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newRequest)
                    })
                    .then(response => response.json())
                    .then(() => {
                        alert("Solicitação de amizade enviada!");
                        fetchFriendRequests(); // Atualiza a lista de solicitações de amizade
                        fetchFriends(); // Atualiza a lista de amigos
                        document.getElementById('friendName').value = '';
                    })
                    .catch(error => console.error('Erro ao enviar solicitação de amizade:', error));
                })
                .catch(error => console.error('Erro ao buscar usuários:', error));
        }

        function deleteFriend(friendId) {
            fetch(`http://localhost:3000/solicitacoesAmizade?para=${id}&de=${friendId}`)
                .then(response => response.json())
                .then(request => {
                    if (request.length > 0) {
                        const requestId = request[0].id;
                        fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`, {
                            method: 'DELETE'
                        })
                        .then(() => {
                            alert("Solicitação de amizade cancelada!");
                            fetchFriendRequests(); // Atualiza a lista de solicitações de amizade
                        })
                        .catch(error => console.error('Erro ao cancelar solicitação de amizade:', error));
                    } else {
                        fetch(`http://localhost:3000/usuarios/${id}`)
                            .then(response => response.json())
                            .then(user => {
                                const updatedFriends = user.amigos.filter(friend => friend !== friendId);
                                fetch(`http://localhost:3000/usuarios/${id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ ...user, amigos: updatedFriends })
                                })
                                .then(() => {
                                    alert("Amigo removido!");
                                    fetchFriends(); // Atualiza a lista de amigos
                                })
                                .catch(error => console.error('Erro ao remover amigo:', error));
                            })
                            .catch(error => console.error('Erro ao buscar usuário:', error));
                    }
                })
                .catch(error => console.error('Erro ao buscar solicitação de amizade:', error));
        }

        function acceptFriendRequest(requestId) {
            fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`, {
                method: 'DELETE'
            })
            .then(() => {
                fetchFriendRequests(); // Atualiza a lista de solicitações de amizade
        
                // Busca a solicitação para adicionar o amigo
                fetch(`http://localhost:3000/solicitacoesAmizade?para=${id}&id=${requestId}`)
                    .then(response => response.json())
                    .then(request => {
                        const friendId = request[0].de;
                        fetch(`http://localhost:3000/usuarios/${id}`)
                            .then(response => response.json())
                            .then(user => {
                                const updatedFriends = [...user.amigos, friendId];
                                fetch(`http://localhost:3000/usuarios/${id}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        amigos: updatedFriends
                                    })
                                })
                                .then(() => {
                                    alert("Solicitação de amizade aceita!");
                                    fetchFriends(); // Atualiza a lista de amigos
                                })
                                .catch(error => console.error('Erro ao atualizar lista de amigos:', error));
                            })
                            .catch(error => console.error('Erro ao buscar usuário:', error));
                    })
                    .catch(error => console.error('Erro ao buscar solicitação de amizade:', error));
            })
            .catch(error => console.error('Erro ao aceitar solicitação de amizade:', error));
        }

        function declineFriendRequest(requestId) {
            fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`, {
                method: 'DELETE'
            })
            .then(() => {
                fetchFriendRequests();
                alert("Solicitação de amizade recusada!");
            })
            .catch(error => console.error('Erro ao recusar solicitação de amizade:', error));
        }

        function fetchSentFriendRequests() {
            fetch(`http://localhost:3000/solicitacoesAmizade?de=${id}`)
                .then(response => response.json())
                .then(requests => {
                    const sentFriendRequestsList = document.getElementById('friendRequestsList');
                    sentFriendRequestsList.innerHTML = '';
                    requests.forEach(request => {
                        fetch(`http://localhost:3000/usuarios/${request.para}`)
                            .then(response => response.json())
                            .then(amigo => {
                                const li = document.createElement('li');
                                li.classList.add('sent-friend-request-item');
        
                                const img = document.createElement('img');
                                img.src = amigo.profilePhoto;
                                img.alt = "Foto de " + amigo.login;
        
                                const nomeAmigo = document.createElement('span');
                                nomeAmigo.textContent = amigo.login;
        
                                const cancelButton = document.createElement('button');
                                cancelButton.textContent = 'Cancelar';
                                cancelButton.addEventListener('click', () => {
                                    cancelSentFriendRequest(request.id);
                                });
        
                                const buttonsDiv = document.createElement('div');
                                buttonsDiv.classList.add('sent-friend-request-buttons');
                                buttonsDiv.appendChild(cancelButton);
        
                                li.appendChild(img);
                                li.appendChild(nomeAmigo);
                                li.appendChild(buttonsDiv);
        
                                sentFriendRequestsList.appendChild(li);
                            })
                            .catch(error => console.error('Erro ao buscar usuário:', error));
                    });
                })
                .catch(error => console.error('Erro ao buscar solicitações de amizade enviadas:', error));
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
        fetchFriendRequests();
        fetchSentFriendRequests();
        fetchAndDisplayStatuses();
    });
