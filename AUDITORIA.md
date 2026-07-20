# Registro de Auditoria: Sistema de Análise e Fechamento Matemático para Loterias Caixa

Este documento detalha todas as implementações, decisões de design e configurações técnicas realizadas para a construção do sistema de análise e fechamento para loterias da Caixa.

## 1. Visão Geral
O projeto foi desenvolvido como uma aplicação web full-stack utilizando React no frontend e Express no backend, visando permitir a análise de dados históricos e a geração de fechamentos matemáticos ("covering designs") para Mega-Sena, Quina, Lotofácil e +Milionária.

## 2. Arquitetura Técnica
- **Frontend**: React 19, Vite, Tailwind CSS para estilização, Recharts para visualizações de dados e Lucide-React para ícones.
- **Backend**: Express para servir a aplicação e atuar como proxy para a API de dados históricos.
- **Build System**: Configurado para full-stack (Vite + esbuild), compilando o servidor para CommonJS (`dist/server.cjs`) para garantir compatibilidade em produção.

## 3. Implementações Funcionais

### A. Análise Histórica
- **Proxy de API**: Criado `server.ts` para buscar dados históricos de forma segura a partir do repositório público `guilhermeasn/loteria.json`, evitando problemas de CORS e mantendo a lógica de rede no servidor.
- **Visualização**: Implementado `src/components/AnalysisTab.tsx` utilizando `recharts` para exibir a frequência de sorteio das dezenas. Foi adicionada uma nota de rodapé explícita esclarecendo que os dados são descritivos e não preditivos.

### B. Gerador de Fechamentos
- **Lógica Combinatória**: Criado `src/lib/lottery.ts` com implementação de:
    - `getCombinations`: Função recursiva para gerar subconjuntos (k) de um grupo de dezenas.
    - `gerarFechamento`: Algoritmo *greedy set cover* baseado em bitmasks, otimizado para encontrar o menor conjunto de cartões que garante a cobertura mínima necessária (garantia de acertos).
- **Interface**: Criado `src/components/GeradorFechamento.tsx` permitindo ao usuário definir o grupo de dezenas, o tamanho da aposta e a garantia desejada, com exibição dinâmica dos resultados.

## 4. Configurações de Infraestrutura e Build
- **package.json**: Scripts de `dev`, `build` e `start` foram atualizados para suportar o servidor Express com `tsx` e `esbuild`.
- **tsconfig.json / vite.config.ts**: Configurados aliases de caminho (`@/`) para facilitar a estruturação de componentes e bibliotecas.
- **utils.ts**: Implementada a função utilitária `cn` utilizando `clsx` e `tailwind-merge` para gerenciamento de classes CSS.

## 5. Conformidade Matemática e Princípios
- Em conformidade com o princípio inegociável, o sistema foi estruturado para **não oferecer funcionalidades de previsão**.
- Todo componente de análise histórica foi acompanhado de aviso explícito sobre a independência dos eventos aleatórios.
- A ferramenta foca estritamente na eficiência combinatória (redução de custo) e não na melhoria da probabilidade teórica de acerto do grupo de dezenas.
