const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (usuarioLogado == false) {
  document.getElementById('jogo').disabled = true;
  document.getElementById('modo').disabled = true;
  document.getElementById('sala').disabled = true;
  document.getElementById('apply-filters-btn').disabled = true;
  document.getElementById('create-room-btn').disabled = true;
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
} 
  const userId = usuarioLogado === false ? '-1' : localStorage.getItem('usuarioCorrente');
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

  async function checkCapacidadeMaxima(salaId) {
    try {
      const response = await fetch(`http://localhost:3000/salas/${salaId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes da sala');
      }
      const sala = await response.json();
      console.log(sala.jogadores.length >= sala.capacidade)
      return sala.jogadores.length >= sala.capacidade;
    } catch (error) {
      console.error('Erro ao verificar capacidade máxima:', error);
      return false; // Retornar falso em caso de erro
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
    var nivel = document.getElementById("nivel_select").value;
    const visibilidade = document.getElementById("visibilidade").value;
    const senha = visibilidade === "privada" ? document.getElementById("senha").value : "";
    const capacidade = modo === "Competitivo" ? 5 : 2;
    console.log("Jogo: " + jogo + " Modo: " + modo);
    const sala = {
      id: generateId(),
      nome: nome,
      jogo: jogo,
      modo: modo,
      nivel: nivel,
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

  function calcularCapacidadeMaxima(modo) {
    switch (modo) {
      case 'Competitivo':
        return 5;
      case 'Braço Direito':
        return 2;
      default:
        return 0;
    }
  }

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
          const jogoFilter = document.getElementById('jogo').value;
          const modoFilter = document.getElementById('modo').value;
          const salaFilter = document.getElementById('sala').value;
          const nivelFilter = document.getElementById('nivel').value;
    
          fetchSalas().then(salas => {
            const salasFiltradas = salas.filter(sala => {
              if (jogoFilter && sala.jogo !== jogoFilter && jogoFilter !== 'Todos') {
                return false;
              }
              if (modoFilter && sala.modo !== modoFilter && modoFilter !== 'Todos') {
                return false;
              }
              if (salaFilter && sala.sala !== salaFilter && salaFilter !== 'Todas') {
                return false;
              }
              if (nivelFilter && sala.nivel !== nivelFilter && nivelFilter !== 'Todos') {
                return false;
              }
              return true;
            });
                displaySalas(salasFiltradas);
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
        
          if (salas.length === 0) {
            container.innerHTML = '<p style="font-size: 65px; text-align: center;">Nenhuma sala encontrada.</p>';
            return;
          }

          for (const sala of salas) {
            const salaDiv = document.createElement('div');
            salaDiv.className = 'sala';
            const jogadoresCount = sala.jogadores.length;
            var nivel = "";
            if(sala.jogo === 'CS2'){
              switch (sala.nivel){
                case 'grey':
                  nivel = "0 - 4999";
                  break;
                case 'light_blue':
                  nivel = "5000 - 9999";
                  break;
                case 'blue':
                  nivel = "10000 - 14999";
                  break;
                case 'purple':
                  nivel = '15000 - 19999';
                  break;
                case 'pink':
                  nivel = '20000 - 24999';
                  break;
                case 'red':
                  nivel = "25000 - 29999";
                  break;
                case 'yellow':
                  nivel = "30000+";
                  break;
              }
            }
            const visibilidade = sala.sala === 'publica' ? 'Pública' : 'Privada';
            const capacidadeMaxima = calcularCapacidadeMaxima(sala.modo);
            salaDiv.innerHTML = `
              <h1>${sala.nome}</h1>
              <h4>${sala.jogo} - ${sala.modo}</h4>
              <p>Jogadores: ${jogadoresCount}/${capacidadeMaxima}</p>
              <p>Nivel: ${nivel}</p>
              <p>Sala: ${visibilidade}</p>
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
          if (checkCapacidadeMaxima(salaId) === true) {
            alert('A sala já está cheia. Não é possível entrar.');
          } else {
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
        }}
      }
    
      document.addEventListener('DOMContentLoaded', () => {
          fetchSalas().then(displaySalas);
        });