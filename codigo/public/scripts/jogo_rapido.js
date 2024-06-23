const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (usuarioLogado == false) {
  const filtrosDiv = document.getElementById('filtro');
  filtrosDiv.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
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


document.addEventListener('DOMContentLoaded', function() {
    var buscarPartidaBtn = document.getElementById('buscar-partida-btn');
    var loader = document.querySelector('.loader');
    buscarPartidaBtn.addEventListener('click', function() {
        loader.style.display = 'block';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const jogoSelect = document.getElementById('jogo');
    const modoSelect = document.getElementById('modo');
    const nivelSelect = document.getElementById('nivel');
    const buscarPartidaBtn = document.getElementById('buscar-partida-btn');
    modoSelect.disabled = true;
    nivelSelect.disabled = true;
    buscarPartidaBtn.disabled = true;
    function verificarSelecao() {
        if (jogoSelect.value !== "" && modoSelect.value !== "" && nivelSelect.value !== "") {
          buscarPartidaBtn.disabled = false;
          buscarPartidaBtn.style.opacity = 1;
          buscarPartidaBtn.style.pointerEvents = 'auto';
        } else {
          buscarPartidaBtn.disabled = true;
          buscarPartidaBtn.style.opacity = 0.6;
          buscarPartidaBtn.style.pointerEvents = 'none';
        }
      }
    jogoSelect.addEventListener('change', verificarSelecao);
    modoSelect.addEventListener('change', verificarSelecao);
    nivelSelect.addEventListener('change', verificarSelecao);
    buscarPartidaBtn.addEventListener('click', buscarPartida);
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
          nivelSelect.innerHTML = '<option value="" disabled selected hidden>Selecione um Nível</option>';
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

    async function buscarPartida() {
        const jogo = jogoSelect.value;
        const modo = modoSelect.value;
        const nivel = nivelSelect.value;

        try {
            const salaDisponivel = await procurarSalaDisponivel(jogo, modo, nivel);
            if (salaDisponivel) {
                console.log('Sala encontrada:', salaDisponivel.id);
                entrarNaSala(salaDisponivel.id);
            } else {
                console.log('Nenhuma sala encontrada. Continuando a busca...');
                // Aqui você pode atualizar uma mensagem na tela informando que está procurando uma partida
            }
        } catch (error) {
            console.error('Erro ao buscar partida:', error);
        }
    }

    async function procurarSalaDisponivel(jogo, modo, nivel) {
        try {
            const response = await fetch(`http://localhost:3000/salas?jogo=${jogo}&modo=${modo}&nivel=${nivel}&sala=publica&_limit=1`);
            if (!response.ok) {
                throw new Error('Não foi possível buscar as salas.');
            }
            const salas = await response.json();
            return salas.length > 0 ? salas[0] : null;
        } catch (error) {
            throw new Error('Erro ao buscar salas disponíveis:', error);
        }
    }

    async function entrarNaSala(salaId) {
        const currentUser = JSON.parse(localStorage.getItem('usuarioCorrente'));
        if (!currentUser || !currentUser.id) {
            console.error('Usuário não está logado');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/salas/${salaId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar sala:', response.statusText);
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
                    window.location.href = `sala.html?salaId=${salaId}`;  // Redireciona para a nova página da sala
                } else {
                    console.error('Erro ao atualizar a sala:', updateResponse.statusText);
                }
            } else {
                console.log('Usuário já está na sala:', salaId);
                window.location.href = `sala.html?salaId=${salaId}`;  // Redireciona para a nova página da sala
            }
        } catch (error) {
            console.error('Erro ao entrar na sala:', error);
        }
    }
});