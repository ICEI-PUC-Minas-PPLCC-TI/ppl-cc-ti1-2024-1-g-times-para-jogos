const userId = localStorage.getItem('usuarioCorrente');
const currentUserObj = JSON.parse(userId);
const id = currentUserObj.id;

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

    async function fetchSala(salaId) {
        const response = await fetch(`http://localhost:3000/salas/${salaId}`);
        if (!response.ok) {
          console.error('Erro ao buscar sala:', response.statusText);
          return null;
        }
        return await response.json();
      }
  
      async function fetchUser(userId) {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`);
        if (!response.ok) {
          console.error('Erro ao buscar usuário:', response.statusText);
          return null;
        }
        return await response.json();
      }
  
      async function displaySalaDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const salaId = urlParams.get('salaId');
  
        const sala = await fetchSala(salaId);
        if (!sala) return;
  
        const container = document.getElementById('sala-detalhes');
        container.innerHTML = `
          <h1>${sala.nome}</h1>
          <h4>${sala.jogo} - ${sala.modo}</h4>
          <p>Dono: ${sala.dono}</p>
          <h4>Jogadores:</h4>
          <ul id="jogadores-list"></ul>
        `;
  
        const jogadoresList = document.getElementById('jogadores-list');
        for (const userId of sala.jogadores) {
          const user = await fetchUser(userId);
          if (user) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<img src="${user.profilePhoto}" alt="Foto de ${user.nome}" style="width: 30px; height: 30px;"> ${user.login}
            ${(currentUserObj.login === sala.dono && user.login !== sala.dono) ? `<span class="kick-icon" onclick="kickPlayer('${salaId}', '${userId}')">✖</span>` : ''}`;
            jogadoresList.appendChild(listItem);
          }
          if (currentUserObj.login === sala.dono) {
            document.getElementById('delete-sala').style.display = 'block';
          }
        }
      }
    
      async function kickPlayer(salaId, userId) {
        try {
          const response = await fetch(`http://localhost:3000/salas/${salaId}`);
          if (!response.ok) {
            console.error('Erro ao buscar sala:', response.statusText);
            return;
          }
  
          const sala = await response.json();
          sala.jogadores = sala.jogadores.filter(jogador => jogador !== userId);
          
          const updateResponse = await fetch(`http://localhost:3000/salas/${salaId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jogadores: sala.jogadores })
          });
  
          if (updateResponse.ok) {
            console.log('Jogador removido da sala:', userId);
            displaySalaDetails();  // Atualizar a lista de jogadores
          } else {
            console.error('Erro ao atualizar a sala:', updateResponse.statusText);
          }
        } catch (error) {
          console.error('Erro ao expulsar jogador:', error);
        }
      }

      async function deleteSala() {
        const urlParams = new URLSearchParams(window.location.search);
        const salaId = urlParams.get('salaId');
        try {
          const response = await fetch(`http://localhost:3000/salas/${salaId}`, {
            method: 'DELETE'
          });
  
          if (response.ok) {
            console.log('Sala excluída:', salaId);
            window.location.href = 'salas.html';  // Redireciona de volta para a lista de salas
          } else {
            console.error('Erro ao excluir a sala:', response.statusText);
          }
        } catch (error) {
          console.error('Erro ao excluir a sala:', error);
        }
      }
      
  
      async function leaveSala() {
        const urlParams = new URLSearchParams(window.location.search);
        const salaId = urlParams.get('salaId');
        const currentUser = JSON.parse(localStorage.getItem('usuarioCorrente'));
  
        if (!currentUser || !currentUser.id) {
          console.error('Usuário não está logado');
          return;
        }
  
        try {
          const response = await fetch(`http://localhost:3000/salas/${salaId}`);
          if (!response.ok) {
            console.error('Erro ao buscar sala:', response.statusText);
            return;
          }
  
          const sala = await response.json();
          if (sala.jogadores.includes(currentUser.id)) {
            sala.jogadores = sala.jogadores.filter(jogador => jogador !== currentUser.id);
            const updateResponse = await fetch(`http://localhost:3000/salas/${salaId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ jogadores: sala.jogadores })
            });
  
            if (updateResponse.ok) {
              console.log('Saiu da sala:', salaId);
              window.location.href = 'salas.html';  // Redireciona de volta para a lista de salas
            } else {
              console.error('Erro ao atualizar a sala:', updateResponse.statusText);
            }
          } else {
            console.log('Usuário não está na sala:', salaId);
          }
        } catch (error) {
          console.error('Erro ao sair da sala:', error);
        }
      }
  
      // Initial load
      document.addEventListener('DOMContentLoaded', () => {
        displaySalaDetails();
      });