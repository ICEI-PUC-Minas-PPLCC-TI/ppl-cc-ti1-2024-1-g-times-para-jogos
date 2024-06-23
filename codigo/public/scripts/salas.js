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
  const modosPorJogo = {
    'CS2': ['Competitivo', 'Braço Direito'],
    'League of Legends': ['Ranqueada Solo/Duo', 'Ranqueada Flexivel'],
    'Valorant': ['Ranqueada'],
    'Rainbow Six Siege': ['Ranqueada'],
    'Apex Legends': ['Battle Royale', 'Ranqueada'],
    'Dota 2': ['Competitivo']
  };
  const niveisPorJogo = {
      'CS2': [
        { value: 'grey', text: '0 - 4999' },
        { value: 'light_blue', text: '5000 - 9999' },
        { value: 'blue', text: '10000 - 14999' },
        { value: 'purple', text: '15000 - 19999' },
        { value: 'pink', text: '20000 - 24999' },
        { value: 'red', text: '25000 - 29999' },
        { value: 'yellow', text: '30000+' }
      ],
      'League of Legends': {
        'Ranqueada Solo/Duo': [
        { value: 'low', text: 'Ferro IV - Prata I'},
        { value: 'low-med', text: 'Ferro IV - Ouro I'},
        { value: 'med', text: 'Prata IV - Platina I'},
        { value: 'med-high', text: 'Ouro IV - Esmeralda I'},
        { value: 'high', text: 'Platina IV - Diamante III'},
        { value: 'highest', text: 'Diamante IV - Diamante I'},
        { value: 'master', text: 'Diamante I - Mestre'}
        ],
        'Ranqueada Flexivel': [
        { value: 'default', text: 'Ferro IV - Diamante I'},
        { value: 'high', text: 'Platina 4 - Challenger'}
        ]},
      'Valorant': [
        { value: 'low', text: 'Ferro 1 - Prata 3' },
        { value: 'low-med', text: 'Prata 1 - Ouro 3'},
        { value: 'med', text: 'Ouro 1 - Platina 3'},
        { value: 'med-high', text: 'Platina 1 - Diamante 1'},
        { value: 'high', text: 'Diamante 1 - Imortal 1'},
        { value: 'highest', text: 'Imortal 1 - Radiante'}
      ],
      'Rainbow Six Siege': [
        { value: 'low', text: '0 - 2200'},
        { value: 'med', text: '2200 - 3400'},
        { value: 'high', text: '3400 - 4400'},
        { value: 'highest', text: '4400+'}
        ],
      'Apex Legends': {
        'Battle Royale': [
        { value: 'default', text: 'Livre'},
        ],
        'Ranqueada': [
        { value: 'low', text: 'Rookie IV - Silver I'},
        { value: 'med', text: 'Silver IV - Platinum I'},
        { value: 'high', text: 'Platinum IV - Master'},
        { value: 'highest', text: 'Master - Apex Predator'}
        ]},
      'Dota 2': [
        { value: 'low', text: '0 - 2499' },
        { value: 'med', text: '2500 - 4999' },
        { value: 'high', text: '5000+' }
      ]
  }
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
      return false;
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

function calcularCapacidadeMaxima(jogo, modo) {
  switch (jogo) {
      case 'CS2':
          switch (modo) {
              case 'Competitivo':
                  return 5;
              case 'Braço Direito':
                  return 2;
          }
          break;
      case 'League of Legends':
          switch (modo) {
              case 'Ranqueada Solo/Duo':
                  return 2;
              case 'Ranqueada Flexivel':
                  return 5;
          }
          break;
      case 'Valorant':
          return 5;
      case 'Rainbow Six Siege':
          return 5;
      case 'Apex Legends':
          return 3;
      case 'Dota 2':
          return 5;
  }
  return 0; 
}

function mapearNivel(sala) {
  const { jogo, modo, nivel } = sala;
  const niveis = niveisPorJogo[jogo];
  if (niveis) {
      if (Array.isArray(niveis)) {
          const nivelObj = niveis.find(n => n.value === nivel);
          return nivelObj ? nivelObj.text : "Nível desconhecido";
      } else {
          const niveisModo = niveis[modo];
          if (niveisModo) {
              const nivelObj = niveisModo.find(n => n.value === nivel);
              return nivelObj ? nivelObj.text : "Nível desconhecido";
          }
      }
  }
  return "Nível desconhecido";
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
            var nivel = mapearNivel(sala);
            const visibilidade = sala.sala === 'publica' ? 'Pública' : 'Privada';
            const capacidadeMaxima = calcularCapacidadeMaxima(sala.jogo, sala.modo);
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
              window.location.href = `sala.html?salaId=${salaId}`;
            } else {
              console.error('Erro ao atualizar a sala:', updateResponse.statusText);
            }
          } else {
            console.log('Usuário já está na sala:', salaId);
            window.location.href = `sala.html?salaId=${salaId}`;
          }
        } catch (error) {
          console.error('Erro ao entrar na sala:', error);
        }}
      }
    
      document.addEventListener('DOMContentLoaded', () => {
          fetchSalas().then(displaySalas);
        });

      document.addEventListener('DOMContentLoaded', function() {
        const jogoSelect = document.getElementById('jogo_select');
        const modoSelect = document.getElementById('modo_select');
        const nivelSelect = document.getElementById('nivel_select');
        const jogoFilter = document.getElementById('jogo');
        const modoFilter = document.getElementById('modo');
        const nivelFilter = document.getElementById('nivel');
        modoSelect.disabled = true;
        nivelSelect.disabled = true;
        modoFilter.disabled = true;
        nivelFilter.disabled = true;
        jogoFilter.addEventListener('change', function() {
            const jogoSelecionado = jogoFilter.value;
            modoFilter.innerHTML = '<option value="">Todos</option>';
            nivelFilter.innerHTML = '<option value="">Todos</option>';
            if (jogoSelecionado !== "") {
              if (modosPorJogo.hasOwnProperty(jogoSelecionado)) {
                  modosPorJogo[jogoSelecionado].forEach(modo => {
                      const option = document.createElement('option');
                      option.value = modo;
                      option.textContent = modo;
                      modoFilter.appendChild(option);
                  });
                  modoFilter.disabled = false;
              } else {
                  modoFilter.disabled = true;
                  nivelFilter.disabled = true;
              }
          } else {
              modoFilter.disabled = true;
              nivelFilter.disabled = true;
          }
        });
        modoFilter.addEventListener('change', function(){
          const jogoSelecionado = jogoFilter.value;
          const modoSelecionado = modoFilter.value;
          nivelFilter.innerHTML = '<option value="">Todos</option>';
          if (jogoSelecionado && modoSelecionado) {
            if (niveisPorJogo.hasOwnProperty(jogoSelecionado)) {
                const niveis = niveisPorJogo[jogoSelecionado];
                if (Array.isArray(niveis)) {
                    niveis.forEach(nivel => {
                        const option = document.createElement('option');
                        option.value = nivel.value;
                        option.textContent = nivel.text;
                        nivelFilter.appendChild(option);
                    });
                } else {
                    const niveisModo = niveis[modoSelecionado];
                    if (niveisModo) {
                        niveisModo.forEach(nivel => {
                            const option = document.createElement('option');
                            option.value = nivel.value;
                            option.textContent = nivel.text;
                            nivelFilter.appendChild(option);
                        });
                    }
                }
                nivelFilter.disabled = false;
            } else {
                nivelFilter.disabled = true;
            }
              } else {
                  nivelFilter.disabled = true;
              }
        });
        jogoSelect.addEventListener('change', function() {
            const jogoSelecionado = jogoSelect.value;
            modoSelect.innerHTML = '<option value="" disabled selected hidden>Selecione um Modo</option>';
            nivelSelect.innerHTML = '<option value="" disabled selected hidden>Selecione um Nível</option>';
            if (jogoSelecionado) {
                modosPorJogo[jogoSelecionado].forEach(modo => {
                    const option = document.createElement('option');
                    option.value = modo;
                    option.textContent = modo;
                    modoSelect.appendChild(option);
                });
                modoSelect.disabled = false;
            }
          modoSelect.addEventListener('change', function() {
              const jogoSelecionado = jogoSelect.value;
              const modoSelecionado = modoSelect.value;
              nivelSelect.innerHTML = '<option value="">Selecione um Nível</option>';
              if (jogoSelecionado && modoSelecionado) {
                  const niveis = niveisPorJogo[jogoSelecionado][modoSelecionado] || niveisPorJogo[jogoSelecionado];
                  niveis.forEach(nivel => {
                      const option = document.createElement('option');
                      option.value = nivel.value;
                      option.textContent = nivel.text;
                      nivelSelect.appendChild(option);
                  });
                  nivelSelect.disabled = false;
              }
          });
        });
    });