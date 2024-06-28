var usuarioLogado = true;
if (localStorage.getItem('usuarioCorrente') == "{}" || localStorage.getItem('usuarioCorrente') == null) {
  window.location.href = 'login.html';
} 
async function fetchSalaMessages(salaId) {
  try{
    const response = await fetch(`/salas/${salaId}`);
    if(!response.ok){
      throw new Error('Erro ao buscar as mensagens');
    }
    const sala = await response.json();
    return sala.mensagens;
  } catch (error) {
    console.error('Erro ao buscar as mensagens da sala ', error);
    return [];
  }
} //Vou usar isso para pegar as mensagens do usuario no report

async function getUserMessages(salaId, userId) {
  const mensagens = await fetchSalaMessages(salaId);
  console.log('Mensagens da sala:', mensagens); 
  const userMensagens = mensagens
    .filter(mensagem => {
      return mensagem.autorId === userId;
    })
    .map(mensagem => mensagem.mensagem);
  return userMensagens;
}

function openModal() {
  document.getElementById('reportModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('reportModal').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('reportModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

document.querySelector('.close').onclick = closeModal;

let currentReportUserId = null;
let currentReportUserName = null;
let currentReportUserProfilePhoto = null;
let currentSalaId = null;

function reportPlayer(userId, userName, userProfilePhoto, salaId) {
  currentReportUserId = userId;
  currentReportUserName = userName;
  currentReportUserProfilePhoto = userProfilePhoto;
  currentSalaId = salaId;
  document.querySelector('.reportingPlayerName').textContent = `${userName}`;
  openModal();
}

async function submitReport(reportType) {
  const reportDetails = {
    userId: currentReportUserId,
    reportType: reportType,
    timestamp: new Date().toISOString(),
    salaId: currentSalaId
  };

  switch(reportType) {
    case 1:
      reportDetails.offensiveNick = currentReportUserName;
      break;
    case 2:
      reportDetails.verbalAbuseMessages = await getUserMessages(currentSalaId, currentReportUserId);
      break;
    case 3:
      reportDetails.offensivePhotoURL = currentReportUserProfilePhoto;
      break;
    case 4:
      reportDetails.hackReport = true;
      break;
    case 5:
      reportDetails.smurfingReport = true;
      break;
    default:
      alert('Tipo de reporte inválido.');
      return;
  }
  sendReport(reportDetails);
  closeModal();
}

function sendReport(reportDetails) {
  fetch(`/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportDetails)
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      alert('Report enviado com sucesso!');
    } else {
      alert('Falha ao enviar reporte. Tente novamente mais tarde.');
    }
  })
  .catch(error => {
    console.error('Erro ao enviar report:', error);
    alert('Ocorreu um erro. Tente novamente mais tarde.');
  });
}

  const urlParams = new URLSearchParams(window.location.search);
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
              listItem.innerHTML = `<img src="${user.profilePhoto}" alt="Foto de ${user.nome}" style="width: 30px; height: 30px;"><span class="user-name-text">${user.login}</span>
              ${(currentUserObj.login === sala.dono && user.login !== sala.dono) ? `<span class="kick-icon" onclick="kickPlayer('${salaId}', '${userId}')">✖</span>` : ''}
              ${(currentUserObj.login !== user.login) ? `<span class="report-icon" onclick="reportPlayer('${userId}', '${user.login}', '${user.profilePhoto}', '${salaId}')">!</span>` : ''}`;
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
              displaySalaDetails();
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
              window.location.href = 'salas.html'; 
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
                window.location.href = 'salas.html';
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
    
        document.addEventListener('DOMContentLoaded', () => {
          displaySalaDetails();
        });

        document.addEventListener("DOMContentLoaded", () => {
          const salaId = urlParams.get('salaId');
          const messagesChat = document.getElementById("messages_chat");
          const messageInput = document.getElementById("messagesInput");
          const sendMessageButton = document.getElementById("sendMessageButton");
      
          function formatarHorario(data) {
            const date = new Date(data);
            const dia = date.getDate();
            const mes = date.getMonth() + 1;
            const ano = date.getFullYear();
            const horas = date.getHours();
            const minutos = ('0' + date.getMinutes()).slice(-2);
            return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
        }

            function sendMessage() {
              const messageText = messageInput.value;
              if (messageText.trim() === "") return;
      
              const message = {
                  autor: currentUserObj.login,
                  autorId: currentUserObj.id,
                  horario: new Date().toISOString(),
                  mensagem: messageText
              };
      
              fetch(`http://localhost:3000/salas/${salaId}`)
              .then(response => response.json())
              .then(sala => {
                  const updatedMessages = sala.mensagens || [];
                  updatedMessages.push(message);
      
                  return fetch(`http://localhost:3000/salas/${salaId}`, {
                      method: 'PATCH',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          mensagens: updatedMessages
                      })
                  });
              })
              .then(response => response.json())
              .then(updatedSala => {
                  displayMessages(updatedSala.mensagens);
                  messageInput.value = "";
              })
              .catch(error => console.error('Erro ao enviar a mensagem:', error));
      }
      
          function displayMessages(messages) {
            const messageDiv = document.getElementById('messages_chat');
            messageDiv.innerHTML = "";
              messages.forEach(msg => {
                fetch(`http://localhost:3000/usuarios/${msg.autorId}`)
                  .then(response => response.json())
                  .then(user => {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');
                    const timeSpan = document.createElement('span');
                    timeSpan.classList.add('time');
                    timeSpan.textContent = formatarHorario(msg.horario);
                    const messageHeader = document.createElement('div');
                    messageHeader.classList.add('message-header');
                    messageHeader.appendChild(timeSpan);
                    const messageContent = document.createElement('div');
                    messageContent.classList.add('message-content');
                    const profileImg = document.createElement('img');
                    profileImg.classList.add('profile-img');
                    profileImg.src = user.profilePhoto;
                    profileImg.alt = `${msg.autor} profile picture`;
                    const authorSpan = document.createElement('span');
                    authorSpan.classList.add('author');
                    authorSpan.textContent = `${msg.autor}: `;
                    const contentSpan = document.createElement('span');
                    contentSpan.classList.add('content');
                    contentSpan.textContent = msg.mensagem;
                    messageContent.appendChild(profileImg);
                    messageContent.appendChild(authorSpan);
                    messageContent.appendChild(contentSpan);
                    messageDiv.appendChild(messageHeader);
                    messageDiv.appendChild(messageContent);
                    messagesChat.appendChild(messageDiv);
                    messagesChat.scrollTop = messagesChat.scrollHeight;
                  })
                  .catch(error => console.error('Erro ao buscar usuário:', error));
              });
            }
      
          sendMessageButton.addEventListener("click", sendMessage);
      
          messageInput.addEventListener("keypress", (event) => {
              if (event.key === "Enter") {
                  sendMessage();
              }
          });
      
          function loadMessages() {
              fetch(`http://localhost:3000/salas/${salaId}`)
                  .then(response => response.json())
                  .then(sala => {
                      displayMessages(sala.mensagens || []);
                  })
                  .catch(error => console.error('Erro ao carregar as mensagens:', error));
          }
          loadMessages();
      });
if (currentUserObj.login && currentUserObj.userRole === 'admin') {
  const adminPanelLink = document.getElementById('admin-panel-link');
  adminPanelLink.removeAttribute('hidden');
}