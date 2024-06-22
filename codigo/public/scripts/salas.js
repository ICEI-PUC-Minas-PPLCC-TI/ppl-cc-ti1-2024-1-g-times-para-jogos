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
            <a href="sala.html?id=${sala.id}">Entrar na Sala</a>
          `;
          container.appendChild(salaDiv);
        });
      }
  
      // Initial load
      fetchSalas().then(displaySalas);