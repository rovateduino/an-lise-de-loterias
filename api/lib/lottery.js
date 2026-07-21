
export function getCombinations(array, k) {
  const result = [];
  function backtrack(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

export function gerarFechamento(grupo, k, garantia) {
  const todas = getCombinations(grupo, k);
  const idx = new Map(grupo.map((d, i) => [d, i]));
  
  const masks = todas.map(c => {
    let mask = 0n;
    for (const d of c) {
      mask |= (1n << BigInt(idx.get(d)));
    }
    return mask;
  });

  const naoCobertos = new Set(Array.from({ length: masks.length }, (_, i) => i));
  const escolhidos = [];

  while (naoCobertos.size > 0) {
    let melhorI = -1;
    let melhorCobre = new Set();
    let melhorQtd = -1;

    for (let i = 0; i < masks.length; i++) {
      const m = masks[i];
      const cobre = new Set();
      for (const j of naoCobertos) {
        let intersection = m & masks[j];
        let count = 0;
        while (intersection > 0n) {
          if (intersection & 1n) count++;
          intersection >>= 1n;
        }
        if (count >= garantia) cobre.add(j);
      }
      if (cobre.size > melhorQtd) {
        melhorI = i;
        melhorCobre = cobre;
        melhorQtd = cobre.size;
      }
    }
    
    escolhidos.push(todas[melhorI]);
    for (const j of melhorCobre) {
      naoCobertos.delete(j);
    }
  }
  return escolhidos;
}

export function verificarCobertura(grupo, k, garantia, tickets) {
    const alvos = getCombinations(grupo, k);
    let falhas = 0;
    
    for (const alvo of alvos) {
        const alvoSet = new Set(alvo);
        const coberto = tickets.some(t => {
            const ticketSet = new Set(t);
            let inter = 0;
            for (const d of alvoSet) if (ticketSet.has(d)) inter++;
            return inter >= garantia;
        });
        if (!coberto) falhas++;
    }
    return {total: alvos.length, falhas};
}

export function combinacaoETipica(nums) {
    const sorted = [...nums].sort((a,b) => a - b);
    let sequencia = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i+1] === sorted[i] + 1) {
            sequencia++;
            if (sequencia > 3) return false;
        } else {
            sequencia = 1;
        }
    }
    const soma = sorted.reduce((a,b) => a + b, 0);
    return soma > 50 && soma < 400;
}

export function selecionarGrupoTipico(jogo) {
    const configs = {
        'mega_sena': {universo: 60, qtd: 12},
        'quina': {universo: 80, qtd: 10},
        'lotofacil': {universo: 25, qtd: 18},
        'mais_milionaria': {universo: 50, qtd: 10}
    };
    const cfg = configs[jogo] || {universo: 60, qtd: 6};
    
    let tentativas = 0;
    while(tentativas < 10000) {
        const grupo = [];
        while(grupo.length < cfg.qtd) {
            const n = Math.floor(Math.random() * cfg.universo) + 1;
            if (!grupo.includes(n)) grupo.push(n);
        }
        if (combinacaoETipica(grupo)) return grupo.sort((a,b) => a - b);
        tentativas++;
    }
    return Array.from({length: cfg.qtd}, (_, i) => i + 1).sort((a,b) => a - b);
}

export function obterEstatisticasJogo(jogo) {
    return {
        jogo,
        media: 30.5,
        desvio: 5.2,
        frequencia: {}
    };
}
