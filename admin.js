// Função para carregar dados da tabela
async function loadTableData() {
    try {
        const response = await fetch('/api/formulario');
        if (!response.ok) {
            throw new Error('Erro ao carregar dados da API.');
        }

        const data = await response.json();
        const tbody = document.querySelector('#data-table tbody');
        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.dataset.id = row.id;

            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.user}</td>
                <td>${row.email}</td>
                <td>${row.telefone}</td>
                <td>${row.jogo}</td>
                <td>${row.plataforma}</td>
                <td><a href="${row.link}" target="_blank">Ver Link</a></td>
                <td>
                    <button class="edit-btn" data-id="${row.id}">Editar</button>
                    <button class="delete-btn" data-id="${row.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachEventListeners();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para adicionar os event listeners aos botões de editar e excluir
function attachEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const id = event.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este registro?')) {
                await fetch(`/api/formulario/${id}`, { method: 'DELETE' });
                loadTableData();
            }
        });
    });

    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            const row = event.target.closest('tr');
            const nome = row.children[1].textContent;
            const email = row.children[2].textContent;
            const telefone = row.children[3].textContent;
            const jogo = row.children[4].textContent;
            const plataforma = row.children[5].textContent;
            const link = row.children[6].querySelector('a').href;

            document.getElementById('editId').value = id;
            document.getElementById('nomeInput').value = nome;
            document.getElementById('emailInput').value = email;
            document.getElementById('telefoneInput').value = telefone;
            document.getElementById('jogoInput').value = jogo;
            document.getElementById('plataformaInput').value = plataforma;
            document.getElementById('linkInput').value = link;

            document.getElementById('edit-section').style.display = 'block';
        });
    });
}

// Função para atualizar um registro
async function updateRecord(id, data) {
    try {
        console.log("Atualizando registro:", id, data); // Debug

        const response = await fetch(`/api/formulario/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Registro atualizado com sucesso!');
            loadTableData(); // Recarrega os dados da tabela
            document.getElementById('edit-section').style.display = 'none'; // Oculta o formulário de edição
        } else {
            const error = await response.json();
            alert(`Erro ao atualizar registro: ${error.erro}`);
        }
    } catch (error) {
        console.error('Erro ao editar registro:', error);
    }
}

// Função para excluir um registro
async function deleteRecord(id) {
    try {
        const response = await fetch(`/api/formulario/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Registro excluído com sucesso!');
            removeRowFromTable(id);  // Remove a linha da tabela imediatamente após exclusão
        } else {
            alert('Erro ao excluir registro.');
        }
    } catch (error) {
        console.error('Erro ao excluir registro:', error);
    }
}

// Função para remover a linha da tabela
function removeRowFromTable(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.remove(); 
    }
}

// Função para abrir o formulário de edição e preencher os campos com os dados existentes
function openEditForm(id) {
    const inscricao = inscricoes.find(item => item.id === id);
    
    // Preenchendo os campos do formulário com os dados da inscrição
    document.getElementById('editId').value = inscricao.id;
    document.getElementById('nomeInput').value = inscricao.nome;
    document.getElementById('emailInput').value = inscricao.email;
    document.getElementById('telefoneInput').value = inscricao.telefone;
    document.getElementById('jogoInput').value = inscricao.jogo;
    document.getElementById('plataformaInput').value = inscricao.plataforma;
    document.getElementById('linkInput').value = inscricao.link;

    // Exibir o formulário de edição
    document.getElementById('edit-section').style.display = 'block';
}

// Função para renderizar a tabela com os dados das inscrições
function renderTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = ''; // Limpar tabela antes de adicionar novos registros

    inscricoes.forEach(inscricao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inscricao.id}</td>
            <td>${inscricao.nome}</td>
            <td>${inscricao.email}</td>
            <td>${inscricao.telefone}</td>
            <td>${inscricao.jogo}</td>
            <td>${inscricao.plataforma}</td>
            <td><a href="${inscricao.link}">Link</a></td>
            <td><button class="edit-btn" data-id="${inscricao.id}">Editar</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Adicionar o evento de clique no botão de editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = button.dataset.id;
            openEditForm(Number(id)); // Passa o ID da inscrição
        });
    });
}

// Inicialize a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadTableData();
});
