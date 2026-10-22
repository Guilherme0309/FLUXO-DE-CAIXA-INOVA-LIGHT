
const inputValor = document.getElementById("valor");
const valorDecimal = document.getElementById("valorDecimal");
const formulario = document.getElementById("formLancamento");

if (inputValor && valorDecimal && formulario) {

    inputValor.addEventListener("input", function () {
        const numeros = this.value.replace(/\D/g, "");
        const valor = Number(numeros) / 100;

        this.value = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        valorDecimal.value = valor.toFixed(2);
    });

    formulario.addEventListener("submit", function (event) {

        const valor = Number(valorDecimal.value);

        if (!Number.isFinite(valor) || valor <= 0) {
            alert("Não é possível salvar uma movimentação com valor zerado!");
            event.preventDefault();
            return;
        }

        // Verifica se é cadastro ou edição
        const editando = formulario.action.includes("/editMovimentacao");

        const mensagem = editando
            ? "Deseja realmente salvar as alterações desta movimentação?"
            : "Deseja realmente cadastrar esta movimentação?";

        const confirmado = confirm(mensagem);

        if (!confirmado) {
            event.preventDefault();
            return;
        }
    });
}
