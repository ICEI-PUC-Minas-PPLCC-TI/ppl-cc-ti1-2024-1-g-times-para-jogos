const usuarioLogado = localStorage.getItem('usuarioCorrente') !== null;
if (!usuarioLogado) {
  const fotoPerfil = document.getElementById('foto_de_perfil');
  fotoPerfil.src = '../assets/images/default_profile.png';
} 