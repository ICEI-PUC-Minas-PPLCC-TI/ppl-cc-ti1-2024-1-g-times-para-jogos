var usuarioLogado = true;
if (localStorage.getItem('usuarioCorrente') == "{}" || localStorage.getItem('usuarioCorrente') == null) {
    usuarioLogado = false;
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

var acc = document.getElementsByClassName("accordion");
for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null; 
        } else {
            panel.style.display = "block";
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
}