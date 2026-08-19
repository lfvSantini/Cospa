const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://localhost:8080/api'
    : 'https://cospa-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', () => {
    // Gerenciamento de Tema
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

    // Formulário de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorMsg = document.getElementById('errorMessage');
            const btnLogin = document.getElementById('btnLogin');

            const showError = (message) => {
                if (errorMsg) {
                    errorMsg.textContent = message;
                    errorMsg.classList.add('ativo');
                }
            };

            if (errorMsg) {
                errorMsg.classList.remove('ativo');
                errorMsg.textContent = '';
            }

            const loginValue = usernameInput ? usernameInput.value.trim() : '';
            const senhaValue = passwordInput ? passwordInput.value : '';

            if (!loginValue || !senhaValue) {
                showError('Preencha todos os campos.');
                return;
            }

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
                        window.location.href = './pages/dashboard.html';
                    } else {
                        showError('Resposta inválida do servidor: token ausente.');
                    }
                } else if (response.status === 401 || response.status === 403) {
                    showError('Usuário ou senha incorretos.');
                } else {
                    showError('Erro ao autenticar. Verifique seus dados.');
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                showError('Erro ao conectar ao servidor.');
            } finally {
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.textContent = 'Entrar';
                }
            }
        });
    }
});