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

    async function fetchSalas() {
        const response = await fetch('http://localhost:3000/salas');
        return await response.json();
      }
  
      function applyFilters() {
        const jogo = document.getElementById('jogo').value;
        const modo = document.getElementById('modo').value;
        const sala = document.getElementById('sala').value;
  
        fetchSalas().then(salas => {
          const filteredSalas = salas.filter(sala => {
            return (!jogo || sala.jogo === jogo) &&
                   (!modo || sala.modo === modo) &&
                   (!sala || sala.sala === sala);
          });
          displaySalas(filteredSalas);
        });
      }
  
      function displaySalas(salas) {
        const container = document.getElementById('browser');
        container.innerHTML = '';
  
        salas.forEach(sala => {
          const salaDiv = document.createElement('div');
          salaDiv.className = 'sala';
          salaDiv.innerHTML = `
            <h3>${sala.jogo} - ${sala.modo}</h3>
            <p>Dono: ${sala.dono}</p>
            <p>Jogadores: ${sala.jogadores.join(', ')}</p>
            <p>Sala: ${sala.sala}</p>
            <button onclick="enterSala('${sala.id}')">Entrar na Sala</button>
          `;
          container.appendChild(salaDiv);
        });
      }
  
      async function enterSala(salaId) {
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
        if (!sala.jogadores.includes(currentUser.id)) {
          sala.jogadores.push(currentUser.id);
          const updateResponse = await fetch(`http://localhost:3000/salas/${salaId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jogadores: sala.jogadores })
          });

          if (updateResponse.ok) {
            console.log('Entrou na sala:', salaId);
            window.location.href = `sala.html?salaId=${salaId}`;  // Redireciona para a nova página
          } else {
            console.error('Erro ao atualizar a sala:', updateResponse.statusText);
          }
        } else {
          console.log('Usuário já está na sala:', salaId);
          window.location.href = `sala.html?salaId=${salaId}`;  // Redireciona para a nova página
        }
      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
      }
    }
  
    document.addEventListener('DOMContentLoaded', () => {
        fetchSalas().then(displaySalas);
      });