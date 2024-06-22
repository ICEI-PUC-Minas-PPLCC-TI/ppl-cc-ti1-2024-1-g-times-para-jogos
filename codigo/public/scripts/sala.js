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

    async function fetchSalaDetails(id) {
        const response = await fetch(`http://localhost:3000/salas/${id}`);
        return await response.json();
      }
  
      async function fetchUsuario(id) {
        const response = await fetch(`http://localhost:3000/usuarios/${id}`);
        return await response.json();
      }
  
      async function displaySalaDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const salaId = urlParams.get('id');
  
        const sala = await fetchSalaDetails(salaId);
        const container = document.getElementById('sala-detalhes');
  
        container.innerHTML = `
          <h2>${sala.jogo} - ${sala.modo}</h2>
          <p>Dono: ${sala.dono}</p>
          <h3>Jogadores:</h3>
          <div id="jogadores-container"></div>
        `;
  
        const jogadoresContainer = document.getElementById('jogadores-container');
        for (const jogadorId of sala.jogadores) {
          const jogador = await fetchUsuario(jogadorId);
          const jogadorDiv = document.createElement('div');
          jogadorDiv.className = 'jogador';
          jogadorDiv.innerHTML = `
            <img src="${jogador.profilePhoto}" alt="${jogador.login}">
            <span>${jogador.login}</span>
          `;
          jogadoresContainer.appendChild(jogadorDiv);
        }
      }
  
      // Initial load
      displaySalaDetails();