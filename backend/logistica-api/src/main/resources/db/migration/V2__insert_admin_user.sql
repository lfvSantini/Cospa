-- Usuário Admin padrão (login: admin / senha: 123)
INSERT INTO usuarios (nome, username, senha, perfil) 
VALUES ('Admin Logística', 'admin', '$2a$10$3zI0sF6b.OqjC8M/N9e2aO8pY6W1/X7A8b9c0d1e2f3g4h5i6j7k8', 'ADMIN');

INSERT INTO veiculos (placa, motorista) VALUES 
('ABC-1D23', 'Carlos Silva'),
('XYZ-9876', 'João Pereira'),
('MNO-4567', 'Roberto Souza');