var usuarioLogado = true;
if (localStorage.getItem('usuarioCorrente') == "{}" || localStorage.getItem('usuarioCorrente') == null) {
    const filtrosDiv = document.getElementById('filtro');
  filtrosDiv.innerHTML = 'Você não está logado. <a href="login.html">Entre ou registre-se</a>.';
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
} 
const userId = usuarioLogado === false ? '-1' : localStorage.getItem('usuarioCorrente');
const currentUserObj = JSON.parse(userId);
const id = currentUserObj.id;
if (!(currentUserObj.login && currentUserObj.userRole === 'admin')) {
    alert("Acesso negado!");
    window.location.href = 'index.html';
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

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await fetch('http://localhost:3000/usuarios');
    if (!response.ok) {
      throw new Error('Não foi possível obter os dados dos usuários.');
    }
    const usuarios = await response.json();
    const userCardsContainer = document.getElementById('user-cards');
    const filteredUsers = usuarios.filter(user => user.id !== "-1");
    filteredUsers.forEach(user => {
      const card = createUserCard(user);
      userCardsContainer.appendChild(card);
    });
    document.addEventListener('click', async function(event) {
      if (event.target.classList.contains('reports-button')) {
        const userId = event.target.dataset.userId;
        await openReportsModal(userId);
      }
    });
  } catch (error) {
    console.error('Erro ao buscar e renderizar os usuários:', error);
  }
});
async function checkIfUserIsBanned(userId) {
  try {
    const response = await fetch(`http://localhost:3000/banidos/${userId}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
async function fetchUser(userId) {
  try {
      const response = await fetch(`http://localhost:3000/usuarios/${userId}`);
      if (!response.ok) {
          throw new Error('Não foi possível obter os dados do usuário.');
      }
      const user = await response.json();
      return user;
  } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
  }
}
async function openReportsModal(userId) {
  const reportsModal = document.getElementById('reportsModal');
  const modalContent = reportsModal.querySelector('.modal-content');
  const reportsContainer = document.getElementById('reportsContainer');
  reportsContainer.innerHTML = '';
  const reports = await fetchUserReports(userId);
  reports.forEach(report => {
    const reportElement = document.createElement('div');
    reportElement.classList.add('report-item');
    switch (report.reportType) {
      case 1:
        reportElement.textContent = `Nick ofensivo: ${report.offensiveNick}`;
        break;
      case 2:
        reportElement.textContent = `Abuso verbal: ${report.verbalAbuseMessages.map(msg => `"${msg}"`).join(', ')}`;
        break;
      case 3:
        reportElement.innerHTML = `Foto ofensiva: <img src="${report.offensivePhotoURL}" alt="Foto ofensiva">`;
        break;
      case 4:
        reportElement.textContent = `Hack reportado`;
        break;
      case 5:
        reportElement.textContent = `Smurfing reportado`;
        break;
      default:
        console.log("achei nada kkkk");
        reportElement.textContent = `Report não identificado`;
    }
    reportsContainer.appendChild(reportElement);
    reportsContainer.style.display = ""
  });
  reportsModal.style.display = 'block';
  reportsModal.classList.remove("fade-out");
  reportsModal.classList.add("fade-in");
  const closeButton = modalContent.querySelector('.close');
  closeButton.addEventListener('click', () => {
    reportsModal.classList.remove("fade-in");
    reportsModal.classList.add("fade-out");
    setTimeout(function() {
        reportsContainer.style.display = "none"
        reportsModal.style.display = "none";
    }, 300);
  });
  window.addEventListener('click', (event) => {
    if (event.target === reportsModal) {
      reportsModal.classList.remove("fade-in");
      reportsModal.classList.add("fade-out");
      setTimeout(function() {
          reportsContainer.style.display = "none"
          reportsModal.style.display = "none";
      }, 300);
    }
  });
}
async function fetchUserReports(userId) {
  try {
    const response = await fetch(`http://localhost:3000/reports?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Não foi possível obter os reports.');
    }
    const reports = await response.json();
    return reports;
  } catch (error) {
    console.error('Erro ao buscar reports:', error);
    return [];
  }
}
async function fetchReportsCount(userId) {
  try {
    const response = await fetch(`http://localhost:3000/reports?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Não foi possível obter os reports.');
    }
    const reports = await response.json();
    return reports.length;
  } catch (error) {
    console.error('Erro ao buscar reports:', error);
    return 0;
  }
}
async function promoteUser(userId) {
  try {
      const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userRole: 'admin'
          })
      });
      if (!response.ok) {
          throw new Error('Não foi possível promover o usuário para admin.');
      }
      console.log(`Usuário com ID ${userId} promovido para admin.`);
  } catch (error) {
      console.error('Erro ao promover usuário:', error);
  }
}
async function demoteUser(userId) {
  try {
      const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userRole: ''
          })
      });
      if (!response.ok) {
          throw new Error('Não foi possível rebaixar o usuário.');
      }
      console.log(`Usuário com ID ${userId} rebaixado para usuário comum.`);
  } catch (error) {
      console.error('Erro ao rebaixar usuário:', error);
  }
}
async function banUser(userId, reason) {
  try {
    const user = await fetchUser(userId);
    const response = await fetch('http://localhost:3000/banidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: user.id,
        login: user.login,
        email: user.email,
        profilePhoto: user.profilePhoto,
        userRole: user.userRole,
        reason: reason
      })
    });
    if (!response.ok) {
      throw new Error('Não foi possível banir o usuário.');
    }
    console.log(`Usuário ${user.login} banido com sucesso.`);
  } catch (error) {
    console.error('Erro ao banir usuário:', error);
  }
}
async function unbanUser(userId) {
  try {
    const response = await fetch(`http://localhost:3000/banidos/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Não foi possível desbanir o usuário.');
    }
    const user = await fetchUser(userId);
    return user;
  } catch (error) {
    console.error('Erro ao desbanir usuário:', error);
    throw error;
  }
}
function updateUserCard(updatedUser) {
  const cardElement = document.getElementById(`user-card-${updatedUser.id}`);
  if (cardElement) {
    const updatedCard = createUserCard(updatedUser);
    cardElement.parentNode.replaceChild(updatedCard, cardElement);
  }
}
function createUserCard(user) {
  const card = document.createElement('div');
  card.classList.add('user-card');
  const profileImage = document.createElement('img');
  profileImage.src = user.profilePhoto;
  profileImage.alt = `Foto de ${user.nome}`;
  profileImage.classList.add('profile-image');
  card.appendChild(profileImage);
  const username = document.createElement('h3');
  username.textContent = user.login;
  card.appendChild(username);
  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('user-actions');
  const reportButton = document.createElement('button');
  reportButton.classList.add('reports-button');
  async function updateReportsButton() {
    const reportsCount = await fetchReportsCount(user.id);
    if (reportsCount === 0) {
      reportButton.textContent = 'Reports';
    } else {
      reportButton.textContent = `Reports (${reportsCount})`;
    }
  }
  updateReportsButton();
  reportButton.dataset.userId = user.id;
  actionsDiv.appendChild(reportButton);
  const promoteButton = document.createElement('button');
  if (user.userRole === 'admin' && user.login !== 'admin') {
    promoteButton.textContent = 'Rebaixar';
    promoteButton.classList.add('demote-button');
  } else if (user.login === 'admin'){
    promoteButton.textContent = 'Promover';
    promoteButton.classList.add('promote-button');
    promoteButton.setAttribute('disabled', true);
  } else {
    promoteButton.textContent = 'Promover';
    promoteButton.classList.add('promote-button');
  }
  promoteButton.addEventListener('click', async () => {
    const actionVerb = promoteButton.textContent.toLowerCase();
    if (user.login !== currentUserObj.login) {
      const confirmed = window.confirm(`Você tem certeza que deseja ${actionVerb} ${user.login}?`);
      if (confirmed) {
        if (actionVerb === 'rebaixar') {
          await demoteUser(user.id);
        } else {
          await promoteUser(user.id);
        }
        const updatedUser = await fetchUser(user.id);
        const updatedCard = createUserCard(updatedUser);
        card.parentNode.replaceChild(updatedCard, card);
      }
    }
  });
  actionsDiv.appendChild(promoteButton);
  async function updateBanButton(user) {
    const isBanned = await checkIfUserIsBanned(user.id);
    if (isBanned) {
      const unbanButton = document.createElement('button');
      unbanButton.textContent = 'Desbanir';
      unbanButton.classList.add('unban-button');
      unbanButton.addEventListener('click', async () => {
        const confirmed = window.confirm(`Você tem certeza que deseja desbanir ${user.login}?`);
        if (confirmed) {
          try {
            const updatedUser = await unbanUser(user.id);
            const updatedCard = createUserCard(updatedUser);
            card.parentNode.replaceChild(updatedCard, card);
          } catch (error) {
            console.error('Erro ao desbanir usuário:', error);
            alert('Não foi possível desbanir o usuário. Verifique o console para mais detalhes.');
          }
        }
      });
      actionsDiv.appendChild(unbanButton);
    } else {
      const banButton = document.createElement('button');
      banButton.textContent = 'Banir';
      banButton.classList.add('ban-button');
      if (user.userRole === 'admin') {
        banButton.setAttribute('disabled', true);
      } else {
        banButton.addEventListener('click', async () => {
          const reason = prompt(`Digite o motivo do banimento de ${user.login}:`);
          if (reason) {
            try {
              await banUser(user.id, reason);
              const updatedUser = await fetchUser(user.id);
              const updatedCard = createUserCard(updatedUser);
              card.parentNode.replaceChild(updatedCard, card);
            } catch (error) {
              console.error('Erro ao banir usuário:', error);
              alert('Não foi possível banir o usuário. Verifique o console para mais detalhes.');
            }
          } else {
            alert('É necessário fornecer um motivo para o banimento.');
          }
        });
      }
      actionsDiv.appendChild(banButton);
    }
  }
  updateBanButton(user);
  card.appendChild(actionsDiv);
  return card;
}
