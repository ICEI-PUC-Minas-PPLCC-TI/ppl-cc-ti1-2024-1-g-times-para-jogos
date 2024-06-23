const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (!usuarioLogado) {
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
} 

document.addEventListener('DOMContentLoaded', function() {
    const jogoSelect = document.getElementById('jogo');
    const modoSelect = document.getElementById('modo');
    const buscarPartidaBtn = document.getElementById('buscar-partida-btn');

    buscarPartidaBtn.addEventListener('click', buscarPartida);

    async function buscarPartida() {
        const jogo = jogoSelect.value;
        const modo = modoSelect.value;

        try {
            const salaDisponivel = await procurarSalaDisponivel(jogo, modo);
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

    async function procurarSalaDisponivel(jogo, modo) {
        try {
            const response = await fetch(`http://localhost:3000/salas?jogo=${jogo}&modo=${modo}&_limit=1`);
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