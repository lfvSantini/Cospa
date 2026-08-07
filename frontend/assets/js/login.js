document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!loginForm) {
        console.error('Formulário #loginForm não foi encontrado na página!');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const usuarioInput = document.getElementById('usuario');
        const senhaInput = document.getElementById('senha');

        // Alterado de 'login' para 'username' para alinhar com o DTO do backend
        const username = usuarioInput ? usuarioInput.value.trim() : '';
        const senha = senhaInput ? senhaInput.value.trim() : '';

        // Limpa mensagens anteriores
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('ativo');
        }

        try {
            // Requisição para a API Spring Boot
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, senha }) // CORRIGIDO AQUI
            });

            if (response.ok) {
                const data = await response.json();
                
                // Salva o token JWT e as informações do usuário
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario', username);
                    
                    // Redireciona para o dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    mostrarErro('Token não retornado pelo servidor.');
                }
            } else if (response.status === 403 || response.status === 401) {
                mostrarErro('Usuário ou senha inválidos.');
            } else {
                mostrarErro('Erro ao realizar login. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            mostrarErro('Não foi possível conectar ao servidor backend.');
        }
    });

    function mostrarErro(mensagem) {
        if (errorMessage) {
            errorMessage.textContent = mensagem;
            errorMessage.classList.add('ativo');
        } else {
            alert(mensagem);
        }
    }
});