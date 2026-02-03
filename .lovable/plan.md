# Plano: Remover Geração de Vídeo Veo3

## Status: ✅ CONCLUÍDO

## Contexto

O Lovable AI suporta apenas **geração de imagens** (google/gemini-2.5-flash-image), não vídeos. A API Veo3/Pollo.ai estava sem créditos e não havia alternativa disponível.

## O que foi removido

1. ✅ **Página de criação de vídeo** (`/create-video`) - DELETADO
2. ✅ **Edge function de geração de vídeo** (`generate-video`) - DELETADO
3. ✅ **Links e referências a vídeo no Dashboard** - REMOVIDOS
4. ⚠️ **Secret** `POLLO_API_KEY` - Pode ser removido manualmente no Cloud

## O que foi mantido

- Tabela `videos` no banco (histórico preservado)
- Geração de criativos (imagens) funcionando com Lovable AI

## Impacto Final

| Item | Antes | Depois |
|------|-------|--------|
| Geração de imagens | ✅ Funciona | ✅ Funciona |
| Geração de vídeos | ❌ Sem créditos | ❌ Removido |
| Dashboard | 2 seções | 1 seção (criativos) |
| Edge functions | 4 funções | 3 funções |
