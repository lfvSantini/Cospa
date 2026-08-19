const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://localhost:8080/api'
    : 'https://cospa-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorMsg = document.getElementById('errorMessage');

            if (errorMsg) errorMsg.classList.remove('ativo');

            const payload = {
                username: usernameInput.value.trim(),
                senha: passwordInput.value
            };

            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    window.location.href = './pages/dashboard.html';
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = 'Usuário ou senha incorretos.';
                        errorMsg.classList.add('ativo');
                    }
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'Erro ao conectar ao servidor.';
                    errorMsg.classList.add('ativo');
                }
            }
        });
    }
});