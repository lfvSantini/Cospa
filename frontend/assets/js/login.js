document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Função para exibir erros de forma limpa na tela
    function mostrarErro(mensagem) {
        if (errorMessage) {
            errorMessage.textContent = mensagem;
            errorMessage.classList.add('ativo');
        } else {
            alert(mensagem);
        }
    }

    if (!loginForm) return;

    // Envio do formulário de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username')?.value.trim() || '';
        const senha = document.getElementById('senha')?.value.trim() || '';

        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('ativo');
        }

        try {
            // Faz a requisição de autenticação para o Spring Boot
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, senha })
            });

            if (response.ok) {
                const data = await response.json();

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario', username);
                    window.location.href = 'dashboard.html'; // Entra no painel
                } else {
                    mostrarErro('Token não retornado pelo servidor.');
                }
            } else if (response.status === 401 || response.status === 403) {
                mostrarErro('Usuário ou senha inválidos.');
            } else {
                mostrarErro('Erro ao realizar login. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            mostrarErro('Não foi possível conectar ao servidor.');
        }
    });
});