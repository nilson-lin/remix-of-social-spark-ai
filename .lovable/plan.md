
# Plano: Remover Geração de Vídeo Veo3

## Contexto

O Lovable AI suporta apenas **geração de imagens** (google/gemini-2.5-flash-image), não vídeos. A API Veo3/Pollo.ai está sem créditos e não há alternativa disponível para geração de vídeo via Lovable AI.

## O que será removido

1. **Página de criação de vídeo** (`/create-video`)
2. **Edge function de geração de vídeo** (`generate-video`)
3. **Links e referências a vídeo no Dashboard**
4. **Secret** `POLLO_API_KEY` (não mais necessário)

## O que será mantido

- Tabela `videos` no banco (para preservar histórico)
- Geração de criativos (imagens) funcionando com Lovable AI

---

## Etapas de Implementação

### 1. Remover Edge Function
- Deletar `supabase/functions/generate-video/index.ts`
- Atualizar `supabase/config.toml` para remover a configuração da função

### 2. Remover Página CreateVideo
- Deletar `src/pages/CreateVideo.tsx`

### 3. Atualizar Rotas (App.tsx)
- Remover rota `/create-video`
- Remover import de `CreateVideo`

### 4. Atualizar Dashboard
- Remover card de "Criar novo vídeo"
- Remover seção de "Vídeos recentes"
- Remover imports relacionados a vídeo (Video, Play, Pause, etc.)
- Simplificar o dashboard para focar apenas em criativos

---

## Detalhes Técnicos

```text
Arquivos a DELETAR:
├── supabase/functions/generate-video/index.ts
├── src/pages/CreateVideo.tsx

Arquivos a EDITAR:
├── supabase/config.toml (remover [functions.generate-video])
├── src/App.tsx (remover rota e import)
├── src/pages/Dashboard.tsx (remover seção de vídeos)
```

---

## Alternativa Futura

Se você quiser adicionar vídeo novamente no futuro:
- Integrar com **Runway ML**, **Pika Labs**, ou **Luma AI**
- Criar sua própria API externa que chama Veo3
- Aguardar Lovable AI suportar geração de vídeo

---

## Impacto

| Item | Antes | Depois |
|------|-------|--------|
| Geração de imagens | ✅ Funciona | ✅ Funciona |
| Geração de vídeos | ❌ Sem créditos | ❌ Removido |
| Dashboard | 2 seções | 1 seção (criativos) |
| Edge functions | 4 funções | 3 funções |

