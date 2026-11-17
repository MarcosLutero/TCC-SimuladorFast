# Mecânica de Hotspots das Janelas (A-FAST)

Documentação técnica de como as 4 áreas clicáveis (`HD`, `HR`, `ER`, `CC`) são posicionadas, renderizadas e avaliadas no exame ([src/pages/paginaQuiz.js](./src/pages/paginaQuiz.js)), para facilitar personalizações visuais, troca de imagem base ou calibração futura.

---

## 1. Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `frontend/src/img/doggo.png` | Ilustração base sobre a qual os hotspots ficam (`827 × 827 px`, proporção `1:1`) |
| `frontend/src/pages/paginaQuiz.js` | Lista `JANELAS`, renderização dos hotspots, controle de clique/hover, escore e envio do feedback |
| `frontend/src/css/index.css` | Posicionamento absoluto (`top`, `left`), tamanho (`padding`), opacidade e cores das classes `.hd`, `.hr`, `.er`, `.cc` |
| `frontend/src/components/modalFeedback.jsx` | Exibe o resultado por janela ao finalizar o quiz (usa o mesmo mapeamento `0..3`) |
| `frontend/src/components/modalAnimal.jsx` | Cadastro admin das imagens (`TIPO_JANELAS = ["HD", "HR", "ER", "CC"]`) |
| Backend `CloudinaryStorageService.java` / `LocalStorageService.java` | Mapeia `0..3` para `AREAS = ["hd", "hr", "er", "cc"]` (`animal_{id}_{area}.png`) |

---

## 2. Contrato de índices (`janela: 0..3`)

**Regra obrigatória:** todos os pontos do sistema devem manter exatamente esta correspondência entre índice, nome e arquivo:

| `janela` | `title` | `className` | Arquivo no storage/banco | Região anatômica |
|---:|---|---|---|---|
| `0` | `HD` | `hd` | `animal_{id}_hd.png` | Hepato-Diafragmática |
| `1` | `HR` | `hr` | `animal_{id}_hr.png` | Hepato-Renal |
| `2` | `ER` | `er` | `animal_{id}_er.png` | Espleno-Renal |
| `3` | `CC` | `cc` | `animal_{id}_cc.png` | Cisto-Cólica |

> Nunca altere o número `janela` de um item sem manter a correspondência com `animal.imgs` retornado pelo backend (`ORDER BY janela`). Ao exibir o histórico no admin/aluno, o `CustomFeedbackModal` lê `i.janela.title` diretamente do JSON salvo.

---

## 3. Como o posicionamento CSS funciona hoje

No JSX (`src/pages/paginaQuiz.js`), a imagem e os 4 hotspots ficam dentro de `.lado-direito` (`col-6`):

```jsx
<div className="col-6 lado-direito">
  <div className="imagem-container">
    <img src={doguinio} alt="Imagem" style={{ height: '85vh' }} />
    {JANELAS.map((item) => (
      <div key={item.className} className={item.className} ...>
        {item.title}
      </div>
    ))}
  </div>
</div>
```

No CSS (`src/css/index.css`):

- **`.imagem-container`**: `position: relative; text-align: right; flex-shrink: 0; margin-right: 10; margin-top: 10;`
- **Base comum (`.hd, .er, .cc, .hr`)**:
  - `position: absolute`
  - `transform: translate(-50%, -50%)` *(o `top` e `left` posicionam o **centro** do círculo, não o canto superior esquerdo)*
  - `padding: 65px` e `border-radius: 75px` *(área clicável circular fixa em pixels)*
  - `opacity: 0.01` *(praticamente invisível em produção)*
- **Coordenadas atuais**:
  - `.hd`: `top: 12%; left: 57%;` (`background-color: blue`) — topo (cranial)
  - `.er`: `top: 36%; left: 45%;` (`background-color: black`) — esquerda da tela
  - `.hr`: `top: 43%; left: 71%;` (`background-color: red`) — direita da tela
  - `.cc`: `top: 70%; left: 55%;` (`background-color: green`) — base (caudal)

### Limitações conhecidas do layout atual
1. **Referência de `%` é o `.imagem-container` (`col-6`), não o `<img>`:** como `.imagem-container` tem `width` fluido (metade da viewport) e `text-align: right`, enquanto a imagem tem altura `85vh` (`827×827`), em monitores muito largos ou estreitos a imagem encosta à direita enquanto `left: 45%` / `left: 71%` se move em relação ao container inteiro — podendo deslocar os hotspots horizontalmente em relação ao desenho.
2. **Tamanho fixo (`padding: 65px`):** em telas menores ou mobile, o círculo não reduz proporcionalmente e pode sobrepor áreas vizinhas.
3. **Unidades ausentes no CSS:** `.imagem-container` tem `margin-right: 10; margin-top: 10;` (sem `px`) e `.div-geral` tem `margin-top: -100` (sem `px`), ignorados pelo navegador.

---

## 4. Máquina de estados da interação (clique e hover)

Estado relevante em `PaginaQuiz`:
- `selectedArea`: `-1` (nenhuma aberta) ou `0..3`
- `janelaAberta`: `boolean`
- `animal.imgs[i].clicked`: `undefined` (sem resposta), `true` (tem líquido), `false` (não tem líquido)
- `animal.pontuacaoSugerida`: contador exibido no topo (incrementado/decrementado a cada toggle)

Fluxo atual por área:
1. **Cursor entra e clica na área (`!janelaAberta || selectedArea !== item.janela`):**
   - Define `selectedArea = item.janela` e `janelaAberta = true`.
   - O painel esquerdo passa a renderizar a imagem de ultrassom correspondente (`${CAMINHO_ARQUIVOS}${animal.imgs[selectedArea].caminho}?t=${this.cacheBust}`).
2. **Segundo clique na mesma área (`janelaAberta && selectedArea === item.janela`):**
   - Alterna `temp.imgs[selectedArea].clicked = !temp.imgs[selectedArea].clicked`.
   - Se virou `true`, soma `+1` em `pontuacaoSugerida`; se virou `false`, subtrai `-1`.
3. **Cursor sai da área (`onMouseLeave`):**
   - Reseta `selectedArea: -1, janelaAberta: false`, ocultando novamente a imagem de ultrassom da esquerda.

---

## 5. Como personalizar no futuro

### A. Calibrar posição e visibilidade no modelo atual
1. Em `src/css/index.css`, mude temporariamente `.hd, .er, .cc, .hr { opacity: 0.45; }` (ou adicione `border: 2px dashed white;`) para enxergar exatamente onde cada círculo cai sobre a imagem.
2. Ajuste `top`, `left` e `padding` de cada classe (`.hd`, `.er`, `.cc`, `.hr`).
3. Para deixar um indicador sutil para o usuário sem revelar as respostas, você pode usar `opacity: 0.15` no repouso e `opacity: 0.45` no `:hover` (com `cursor: pointer`), em vez de `0.01`.

### B. Ancorar os hotspots exatamente na imagem (recomendado ao trocar `doggo.png` ou suportar mobile)
Para que `top`/`left` nunca saiam do lugar independentemente da largura da tela:
1. Coloque o `<img>` e os hotspots dentro de um wrapper ajustado ao tamanho da imagem:
   ```css
   .imagem-container {
     position: relative;
     display: inline-block; /* wrapper fica do tamanho exato do <img> */
   }
   .imagem-container img {
     display: block;
     max-height: 85vh;
     max-width: 100%;
     width: auto;
   }
   ```
2. Troque `padding: 65px` por dimensões proporcionais à imagem:
   ```css
   .hd, .er, .cc, .hr {
     position: absolute;
     width: 22%;
     aspect-ratio: 1 / 1;
     border-radius: 50%;
     transform: translate(-50%, -50%);
     cursor: pointer;
   }
   ```
   Assim, se o desenho encolher no celular ou expandir num monitor ultrawide, os 4 hotspots escalam e ficam exatamente sobre as mesmas coordenadas do desenho.

### C. Evolução para imagens/coordenadas diferentes por espécie (ex.: `cachorro` vs `gato`)
Se no futuro quiser usar desenhos ou posições diferentes por `animal.tipo`:
1. Crie um mapa de configuração por tipo em `paginaQuiz.js` (ex.: `HOTSPOTS_CONFIG[animal.tipo] || HOTSPOTS_CONFIG.default`), mantendo `{ title, janela, top, left, size }`.
2. Aplique `style={{ top: item.top, left: item.left }}` diretamente no `div` do hotspot em vez de coordenadas fixas no CSS.
3. Preserve sempre `janela` (`0=HD, 1=HR, 2=ER, 3=CC`) para manter compatibilidade total com o backend e os feedbacks salvos.
