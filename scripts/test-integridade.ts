import { gerarFechamento, verificarCobertura, selecionarGrupoTipico, combinacaoETipica } from '../src/lib/lottery';

const LOTERIAS = [
    { id: 'mega_sena', k: 6, garantia: 4 },
    { id: 'quina', k: 5, garantia: 3 },
    { id: 'lotofacil', k: 15, garantia: 14 },
    { id: 'mais_milionaria', k: 6, garantia: 3 }
];

async function runIntegrityTests() {
    console.log("=== BLOCO 0: Regressão de Filtro de Tipicidade ===");
    for (const l of LOTERIAS) {
        for (let i = 0; i < 20; i++) {
            const grupo = selecionarGrupoTipico(l.id);
            if (!combinacaoETipica(grupo)) {
                console.error(`FALHA no Bloco 0 (${l.id}): Grupo não tipico gerado!`);
                process.exit(1);
            }
        }
    }
    console.log("Bloco 0: PASSOU\n");

    console.log("=== BLOCO 1: Cobertura Matemática (Força Bruta) ===");
    let fail = false;
    for (const l of LOTERIAS) {
        const grupo = selecionarGrupoTipico(l.id);
        const tickets = gerarFechamento(grupo, l.k, l.garantia);
        const {total, falhas} = verificarCobertura(grupo, l.k, l.garantia, tickets);
        console.log(`${l.id}: ${tickets.length} cartões, ${total} cenários, falhas: ${falhas}`);
        if (falhas > 0) fail = true;
    }
    if (fail) {
        console.error("FALHA no Bloco 1: Garantia matemática violada!");
        process.exit(1);
    }
    console.log("Bloco 1: PASSOU\n");
    console.log("=== Blocos 2-5: Testes de IA (Pular manualmente ou configurar ENV) ===");
    process.exit(0);
}

runIntegrityTests();
