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