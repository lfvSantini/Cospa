const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://localhost:8080/api'
    : 'https://cospa-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
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
            const btnLogin = document.getElementById('btnLogin');

            if (errorMsg) {
                errorMsg.classList.remove('ativo');
                errorMsg.textContent = '';
            }

            const loginValue = usernameInput.value.trim();
            const senhaValue = passwordInput.value;

            const payload = {
                username: loginValue,
                login: loginValue,
                senha: senhaValue,
                password: senhaValue
            };

            try {
                if (btnLogin) {
                    btnLogin.disabled = true;
                    btnLogin.textContent = 'Entrando...';
                }

                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token || data.tokenJWT || data.accessToken;
                    if (token) {
                        localStorage.setItem('token', token);
                    }
                    window.location.href = './pages/dashboard.html';
                } else if (response.status === 403 || response.status === 401) {
                    if (errorMsg) {
                        errorMsg.textContent = 'Usuário ou senha incorretos.';
                        errorMsg.classList.add('ativo');
                    }
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = 'Erro ao autenticar. Verifique seus dados.';
                        errorMsg.classList.add('ativo');
                    }
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'Erro ao conectar ao servidor.';
                    errorMsg.classList.add('ativo');
                }
            } finally {
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.textContent = 'Entrar';
                }
            }
        });
    }
});