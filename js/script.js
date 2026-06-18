let contatos = JSON.parse(localStorage.getItem("agenda_contatos")) || [];
let contatoEmEdicaoId = null;
let modoTabela = "visualizar";

const telaMenu = document.getElementById("tela-menu");
const telaCadastro = document.getElementById("tela-cadastro");
const telaListagem = document.getElementById("tela-listagem");
const caixaMenu = document.querySelector(".caixa-menu");
const tituloListagem = document.getElementById("titulo-listagem");
const cabecalhoTabela = document.getElementById("cabecalho-tabela");

const btnCadastro = document.getElementById("btn-cadastro");
const btnListar = document.getElementById("btn-listar");
const btnAlterar = document.getElementById("btn-alterar");

const formContato = document.getElementById("form-contato");
const inputNome = document.getElementById("inome");
const inputTelefone = document.getElementById("iTelefone");
const inputEndereco = document.getElementById("iEndereco");
const inputEmail = document.getElementById("iEmail");
const inputNascimento = document.getElementById("inascimento");
const btnEnviar = document.getElementById("btn-enviar");

const tabelaContatos = document.getElementById("tabela-contatos");
const inputBusca = document.getElementById("busca");
const btnAlfabetica = document.getElementById("btn-alfabetica");
const btnCriacao = document.getElementById("btn-criacao");
const btnNumerica = document.getElementById("btn-numerica");

const btnVoltarCadastro = document.getElementById("btn-voltar-cadastro");
const btnVoltarListagem = document.getElementById("btn-voltar-listagem");

const caixaModal = document.getElementById("caixa-modal");
const modalMensagem = document.getElementById("modal-mensagem");
const modalBotoes = document.getElementById("modal-botoes");

function determinarTelas(telaVisivel) {
    caixaMenu.style.display = "none";
    telaCadastro.style.display = "none";
    telaListagem.style.display = "none";

    if (telaVisivel === "menu") {
        caixaMenu.style.display = "block";
    } else if (telaVisivel === "cadastro") {
        telaCadastro.style.display = "block";
    } else if (telaVisivel === "listagem") {
        telaListagem.style.display = "block";
        renderizarTabela();
    }
}

function exibirModal(mensagem, tipo, acaoConfirmar = null) {
    modalMensagem.textContent = mensagem;
    modalBotoes.innerHTML = "";

    if (tipo === "confirmar") {
        const btnSim = document.createElement("button");
        btnSim.textContent = "Sim";
        btnSim.className = "btn-modal-primario";
        btnSim.addEventListener("click", () => {
            caixaModal.style.display = "none";
            if (acaoConfirmar) acaoConfirmar();
        });

        const btnNao = document.createElement("button");
        btnNao.textContent = "Não";
        btnNao.className = "btn-modal-secundario";
        btnNao.addEventListener("click", () => {
            caixaModal.style.display = "none";
        });

        modalBotoes.appendChild(btnSim);
        modalBotoes.appendChild(btnNao);
    } else if (tipo === "alerta") {
        const btnOk = document.createElement("button");
        btnOk.textContent = "OK";
        btnOk.className = "btn-modal-primario";
        btnOk.addEventListener("click", () => {
            caixaModal.style.display = "none";
            if (acaoConfirmar) acaoConfirmar();
        });
        modalBotoes.appendChild(btnOk);
    }

    caixaModal.style.display = "flex";
}

btnCadastro.addEventListener("click", () => {
    contatoEmEdicaoId = null;
    btnEnviar.value = "Enviar";
    formContato.reset();
    determinarTelas("cadastro");
});

btnListar.addEventListener("click", () => {
    modoTabela = "visualizar";
    tituloListagem.textContent = "Visualização de Contatos";
    determinarTelas("listagem");
});

btnAlterar.addEventListener("click", () => {
    modoTabela = "alterar";
    tituloListagem.textContent = "Gerenciamento de Contatos";
    determinarTelas("listagem");
});

btnVoltarCadastro.addEventListener("click", () => determinarTelas("menu"));
btnVoltarListagem.addEventListener("click", () => determinarTelas("menu"));

function salvarNoLocalStorage() {
    localStorage.setItem("agenda_contatos", JSON.stringify(contatos));
}

formContato.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!inputNome.value.trim() || !inputTelefone.value.trim()) {
        exibirModal("Nome e Telefone são obrigatórios!", "alerta");
        return;
    }

    if (contatoEmEdicaoId !== null) {
        contatos = contatos.map(c => {
            if (c.id === contatoEmEdicaoId) {
                return {
                    ...c,
                    nome: inputNome.value.trim(),
                    telefone: inputTelefone.value.trim(),
                    endereco: inputEndereco.value.trim(),
                    email: inputEmail.value.trim(),
                    nascimento: inputNascimento.value
                };
            }
            return c;
        });
        contatoEmEdicaoId = null;
        salvarNoLocalStorage();
        formContato.reset();
        exibirModal("contato alterado com sucesso", "alerta", () => determinarTelas("listagem"));
    } else {
        const novoContato = {
            id: Date.now(),
            nome: inputNome.value.trim(),
            telefone: inputTelefone.value.trim(),
            endereco: inputEndereco.value.trim(),
            email: inputEmail.value.trim(),
            nascimento: inputNascimento.value,
            dataCriacao: new Date().toISOString()
        };
        contatos.push(novoContato);
        salvarNoLocalStorage();
        formContato.reset();
        exibirModal("contato enviado com sucesso", "alerta", () => determinarTelas("menu"));
    }
});

function renderizarTabela(dadosParaExibir = contatos) {
    tabelaContatos.innerHTML = "";

    cabecalhoTabela.innerHTML = `
        <th>Nome</th>
        <th>Telefone</th>
        <th>Endereco</th>
        <th>Email</th>
        <th>data de nascimento</th>
    `;

    if (modoTabela === "alterar") {
        const thAcoes = document.createElement("th");
        thAcoes.textContent = "Acoes";
        cabecalhoTabela.appendChild(thAcoes);
    }

    if (dadosParaExibir.length === 0) {
        const colunasTotais = modoTabela === "alterar" ? 6 : 5;
        tabelaContatos.innerHTML = `<tr><td colspan="${colunasTotais}" style="color:#333; padding:15px;">Nenhum contato encontrado.</td></tr>`;
        return;
    }

    dadosParaExibir.forEach(contato => {
        const linha = document.createElement("tr");
        linha.style.color = "#333";

        let dataFormatada = "Não informada";
        if (contato.nascimento) {
            const partes = contato.nascimento.split("-");
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        let conteudoLinha = `
            <td>${contato.nome}</td>
            <td>${contato.telefone}</td>
            <td>${contato.endereco || "-"}</td>
            <td>${contato.email || "-"}</td>
            <td>${dataFormatada}</td>
        `;

        if (modoTabela === "alterar") {
            conteudoLinha += `
                <td>
                    <button onclick="prepararAlteracao(${contato.id})" style="background-color:#7b2cbf; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">Alterar</button>
                    <button onclick="solicitarExclusao(${contato.id})" style="background-color:#e63946; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Excluir</button>
                </td>
            `;
        }

        linha.innerHTML = conteudoLinha;
        tabelaContatos.appendChild(linha);
    });
}

window.solicitarExclusao = function(id) {
    exibirModal("Tem certeza que deseja excluir o contato?", "confirmar", () => {
        contatos = contatos.filter(c => c.id !== id);
        salvarNoLocalStorage();
        exibirModal("contato excluido com sucesso", "alerta", () => determinarTelas("listagem"));
    });
};

window.prepararAlteracao = function(id) {
    const contato = contatos.find(c => c.id === id);
    if (contato) {
        contatoEmEdicaoId = id;
        inputNome.value = contato.nome;
        inputTelefone.value = contato.telefone;
        inputEndereco.value = contato.endereco;
        inputEmail.value = contato.email || "";
        inputNascimento.value = contato.nascimento || "";
        btnEnviar.value = "Salvar Alterações";
        determinarTelas("cadastro");
    }
};

inputBusca.addEventListener("input", () => {
    const termo = inputBusca.value.toLowerCase().trim();
    const contatosFiltrados = contatos.filter(c => 
        c.nome.toLowerCase().includes(termo) || 
        c.telefone.includes(termo)
    );
    renderizarTabela(contatosFiltrados);
});

btnAlfabetica.addEventListener("click", () => {
    const listaOrdenada = [...contatos].sort((a, b) => a.nome.localeCompare(b.nome));
    renderizarTabela(listaOrdenada);
});

btnCriacao.addEventListener("click", () => {
    const listaOrdenada = [...contatos].sort((a, b) => a.id - b.id);
    renderizarTabela(listaOrdenada);
});

btnNumerica.addEventListener("click", () => {
    const listaOrdenada = [...contatos].sort((a, b) => {
        const numA = a.telefone.replace(/\D/g, "");
        const numB = b.telefone.replace(/\D/g, "");
        return numA.localeCompare(numB);
    });
    renderizarTabela(listaOrdenada);
});