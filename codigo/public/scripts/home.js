var usuarioLogado = true;
if (localStorage.getItem('usuarioCorrente') == "{}" || localStorage.getItem('usuarioCorrente') == null) {
    const atividadeAmigos = document.getElementById('feed');
  atividadeAmigos.innerHTML = '<span style="display: block; text-align: center;">Você não está logado. <a href="login.html">Entre ou registre-se</a>.</span>';
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
        const statusContent = document.getElementById('statusContent');
        if (currentUserObj.login && currentUserObj.userRole === 'admin') {
            const adminPanelLink = document.getElementById('admin-panel-link');
            adminPanelLink.removeAttribute('hidden');
        }
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
                                acceptButton.textContent = '✓';
                                acceptButton.classList.add('accept-sol-button');
                                acceptButton.addEventListener('click', () => {
                                    acceptFriendRequest(request.id);
                                });
        
                                const declineButton = document.createElement('button');
                                declineButton.textContent = 'x';
                                declineButton.classList.add('decline-sol-button');
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

        async function addFriend(friendName) {
            try {
                const userResponse = await fetch(`http://localhost:3000/usuarios/${id}`);
                if (!userResponse.ok) {
                    throw new Error('Erro ao buscar informações do usuário');
                }
                const user = await userResponse.json();
        
                if (user.login === friendName) {
                    alert("Você não pode enviar uma solicitação de amizade para si mesmo!");
                    return;
                }
                const usuariosResponse = await fetch(`http://localhost:3000/usuarios`);
                if (!usuariosResponse.ok) {
                    throw new Error('Erro ao buscar usuários');
                }
                const usuarios = await usuariosResponse.json();
        
                const friend = usuarios.find(usuario => usuario.login === friendName);
                if (!friend) {
                    alert("Usuário não encontrado!");
                    return;
                }
        
                const friendId = friend.id;
        
                const solicitacoesResponse = await fetch(`http://localhost:3000/solicitacoesAmizade?de=${id}&para=${friendId}`);
                if (!solicitacoesResponse.ok) {
                    throw new Error('Erro ao buscar solicitações pendentes');
                }
                const requests = await solicitacoesResponse.json();
        
                if (requests.length > 0) {
                    alert("Você já enviou uma solicitação de amizade para essa pessoa!");
                    return;
                }
        
                if (user.amigos.includes(friendId)) {
                    alert("Você já é amigo dessa pessoa!");
                    return;
                }
        
                const newRequest = {
                    de: id,
                    para: friendId
                };
        
                const requestResponse = await fetch(`http://localhost:3000/solicitacoesAmizade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newRequest)
                });
        
                if (!requestResponse.ok) {
                    throw new Error('Erro ao enviar solicitação');
                }
        
                alert("Solicitação de amizade enviada!");
                friendNameInput.value = '';
                fetchFriendRequests();
            } catch (error) {
                console.error('Erro ao processar solicitação de amizade:', error);
            }
        }
        
        function deleteFriend(friendId) {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then(response => response.json())
                .then(user => {
                    const updatedFriends = user.amigos.filter(friend => friend !== friendId);
                    return fetch(`http://localhost:3000/usuarios/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ amigos: updatedFriends })
                    });
                })
                .then(() => {
                    fetch(`http://localhost:3000/usuarios/${friendId}`)
                        .then(response => response.json())
                        .then(friend => {
                            const updatedFriendsOfFriend = friend.amigos.filter(amigo => amigo !== id);
                            return fetch(`http://localhost:3000/usuarios/${friendId}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ amigos: updatedFriendsOfFriend })
                            });
                        })
                        .then(() => {
                            fetchFriends();
                        })
                        .catch(error => console.error('Erro ao atualizar lista de amigos do amigo:', error));
                })
                .catch(error => console.error('Erro ao deletar amigo:', error));
        }
        
        
        async function acceptFriendRequest(requestId) {
            try {
                const requestResponse = await fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`);
                if (!requestResponse.ok) {
                    throw new Error('Erro ao buscar solicitação');
                }
                const request = await requestResponse.json();
        
                await fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`, {
                    method: 'DELETE'
                });
        
                fetchFriendRequests();
        
                const amigoResponse = await fetch(`http://localhost:3000/usuarios/${request.de}`);
                if (!amigoResponse.ok) {
                    throw new Error('Erro ao buscar usuário');
                }
                const amigo = await amigoResponse.json();
        
                if (!amigo || !amigo.amigos) {
                    throw new Error('Usuário ou lista de amigos não encontrados');
                }
        
                if (amigo.amigos.includes(id)) {
                    alert("Vocês já são amigos!");
                    return;
                }
        
                const updatedFriendsOfUser = [...amigo.amigos, id];
                await fetch(`http://localhost:3000/usuarios/${request.de}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amigos: updatedFriendsOfUser
                    })
                });
        
                const userResponse = await fetch(`http://localhost:3000/usuarios/${id}`);
                if (!userResponse.ok) {
                    throw new Error('Erro ao buscar usuário');
                }
                const user = await userResponse.json();
        
                const updatedFriendsOfFriend = [...user.amigos, request.de];
                await fetch(`http://localhost:3000/usuarios/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amigos: updatedFriendsOfFriend
                    })
                });
        
                alert("Solicitação de amizade aceita!");
                fetchFriends();
                fetchFriendRequests();
            } catch (error) {
                console.error('Erro ao processar solicitação de amizade:', error);
            }
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

        function cancelSentFriendRequest(requestId) {
            fetch(`http://localhost:3000/solicitacoesAmizade/${requestId}`, {
                method: 'DELETE'
            })
            .then(() => {
                fetchSentFriendRequests();
                alert("Solicitação de amizade cancelada!");
            })
            .catch(error => console.error('Erro ao cancelar solicitação de amizade:', error));
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
                                
                                const statusPedido = document.createElement('span');
                                statusPedido.textContent = 'Pendente';
                                statusPedido.classList.add('pending-status-friend');

                                const cancelButton = document.createElement('button');
                                cancelButton.textContent = 'x';
                                cancelButton.classList.add('cancel-sol-button')
                                cancelButton.addEventListener('click', () => {
                                    cancelSentFriendRequest(request.id);
                                });
        
                                const buttonsDiv = document.createElement('div');
                                buttonsDiv.classList.add('sent-friend-request-buttons');
                                buttonsDiv.appendChild(cancelButton);
        
                                li.appendChild(img);
                                li.appendChild(nomeAmigo);
                                li.appendChild(statusPedido);
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
        fetchAndDisplayStatuses();
        fetchFriendRequests();
        fetchAndDisplayStatuses();
        fetchFriends();
        setInterval(fetchFriendRequests, 5000);
        setInterval(fetchSentFriendRequests, 5000);
        setInterval(fetchAndDisplayStatuses, 5000);
        setInterval(fetchFriends, 5000);
    });
