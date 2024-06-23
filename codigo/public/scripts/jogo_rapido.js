const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (usuarioLogado == false) {
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
} 
const userId = usuarioLogado === false ? '-1' : localStorage.getItem('usuarioCorrente');
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

document.addEventListener('DOMContentLoaded', function() {
    const jogoSelect = document.getElementById('jogo');
    const modoSelect = document.getElementById('modo');
    const nivelSelect = document.getElementById('nivel');
    const buscarPartidaBtn = document.getElementById('buscar-partida-btn');

    buscarPartidaBtn.addEventListener('click', buscarPartida);

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
            const response = await fetch(`http://localhost:3000/salas?jogo=${jogo}&modo=${modo}&nivel=${nivel}&_limit=1`);
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