const userId = localStorage.getItem('usuarioCorrente');
const currentUserObj = JSON.parse(userId);
const id = currentUserObj.id;
var modal = document.getElementById("create-room-modal");
var btn = document.getElementById("create-room-btn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("visibilidade").addEventListener("change", function() {
  const senhaLabel = document.getElementById("senha-label");
  const senhaInput = document.getElementById("senha");
  if (this.value === "privada") {
    senhaLabel.style.display = "block";
    senhaInput.style.display = "block";
  } else {
    senhaLabel.style.display = "none";
    senhaInput.style.display = "none";
  }
});

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

document.getElementById("create-room-form").addEventListener("submit", async function(event) {
  event.preventDefault();
  const currentUser = JSON.parse(localStorage.getItem('usuarioCorrente'));
  const nome = document.getElementById("nome").value;
  var getJogo = document.getElementById("jogo_select");
  var jogo = getJogo.options[getJogo.selectedIndex].text;
  var getModo = document.getElementById("modo_select");
  var modo = getModo.options[getModo.selectedIndex].text;
  const visibilidade = document.getElementById("visibilidade").value;
  const senha = visibilidade === "privada" ? document.getElementById("senha").value : "";
  const capacidade = modo === "Competitivo" ? 5 : 2;
  console.log("Jogo: " + jogo + " Modo: " + modo);
  const sala = {
    id: generateId(),
    nome: nome,
    jogo: jogo,
    modo: modo,
    dono: currentUser.login,
    jogadores: [currentUser.id],
    capacidade: capacidade,
    sala: visibilidade,
    senha: senha
  };

  try {
    const response = await fetch('http://localhost:3000/salas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sala)
    });

    if (response.ok) {
      modal.style.display = "none";
      location.reload();
    } else {
      console.error('Erro ao criar a sala:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao criar a sala:', error);
  }
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

      async function fetchUser(userId) {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`);
        if (!response.ok) {
          console.error('Erro ao buscar usuário:', response.statusText);
          return null;
        }
        return await response.json();
      }

      async function displaySalas(salas) {
        const container = document.getElementById('browser');
        container.innerHTML = '';
      
        for (const sala of salas) {
          const salaDiv = document.createElement('div');
          salaDiv.className = 'sala';
          
          const jogadoresPromises = sala.jogadores.map(userId => fetchUser(userId));
          const jogadores = await Promise.all(jogadoresPromises);
      
          const jogadoresNomes = jogadores.map(user => user ? user.login : 'Usuário desconhecido');
      
          salaDiv.innerHTML = `
            <h3>${sala.nome}</h3>
            <h5>${sala.jogo} - ${sala.modo}</h5>
            <p>Dono: ${sala.dono}</p>
            <p>Jogadores: ${jogadoresNomes.join(', ')}</p>
            <p>Sala: ${sala.sala}</p>
            <button onclick="enterSala('${sala.id}')">Entrar na Sala</button>
          `;
          container.appendChild(salaDiv);
        }
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