# Frontend – 05 Componentes

## 1. Inventário

| Arquivo | Tipo | Linhas | Usado em | Descrição |
|---------|------|--------|----------|-----------|
| `Topo.js` | – | 0 | nunca | Vazio, legado `partial/components/Topo.js` |
| `menuAreas.jsx` | function | 38 | `paginaInicial.js:71`, `adminAnimais.js:41`, `adminUsuarios.js:56`, `feedbacks.js:35` | Navbar com `TELAS` filtradas por `nivelAcesso` |
| `logout.jsx` | function `Logout` | 18 | `menuAreas.jsx:35` | `<li><a Sair>` → `sessionStorage.clear()` |
| `drawer.jsx` | function `SideMenu` | 37 | nunca | MUI `Drawer` com Home/About/Contact – morto |
| `modalAnimal.jsx` | function `ModalAnimal` | 388 | `adminAnimais.js:44,66` | 3 modais (Animal, Imagem, Confirmar) + CRUD `api/animal.js` |
| `modalFeedback.jsx` | function `ModalFeedback` | 87 | `paginaQuiz.js:279` | Tabela acerto/erro por janela |
| `customFeedbackModal.jsx` | function `CustomFeedbackModal` | 67 | `paginaInicial.js:154`, `feedbacks.js:55` | Modal “Ver Feedbacks” que parseia `feed.data` |

## 2. menuAreas.jsx (`components/menuAreas.jsx:1`)

```js
const TELAS = [
  {name:"Inicio", path:"/", nivel:1},
  {name:"Animais", path:"/animais", nivel:2},
  {name:"Feedbacks", path:"/feedbacks", nivel:2},
  {name:"Usuarios", path:"/admin/usuarios", nivel:3},
] // menuAreas.jsx:4

export default function MenuAreas(){
  const nivelAcesso = parseInt(sessionStorage.getItem('nivelAcesso')) // 12
  const usuario = JSON.parse(sessionStorage.getItem('usuario')) // 13 não usado
  const telaInicial = window.location.pathname === "/" // 15
  return <nav className={`navbar ${telaInicial?"navbar-dark":"navbar-light"}`}>
    {!telaInicial && <a href="/"><h1>Simulador A-FAST</h1></a>}
    <ul className="navbar-nav">
      {TELAS.map(tela=>{
        if(tela.nivel > nivelAcesso || tela.path===pathname) return <li></li> // 28
        return <li className="nav-item"><a href={tela.path}>{tela.name}</a></li>
      })}
      <Logout />
    </ul>
  </nav>
}
```

- Usa `window.location.pathname` direto (não `useLocation`), quebra em SPA se `BrowserRouter` muda sem reload.
- `usuario` lido mas nunca exibido (poderia mostrar `usuario.nome`).

## 3. logout.jsx (`components/logout.jsx:3`)

```js
const Logout = () => <li className='nav-item'><a href='#' onClick={e=>{
  e.preventDefault(); sessionStorage.clear(); window.location.href='/login'
}}>Sair</a></li>
```

Simples, mas `sessionStorage.clear()` + full reload perde `config`. Alternativa `navigate('/login')`.

## 4. drawer.jsx (`components/drawer.jsx:9`) – morto

```js
import Drawer from '@mui/material/Drawer' // drawer.jsx:2
const SideMenu = () => {
  const [isOpen,setIsOpen]=useState(false)
  return <><IconButton onClick={toggleDrawer}><MenuIcon/></IconButton>
    <Drawer anchor="left" open={isOpen}><List><ListItem>Home/About/Contact</ListItem></List></Drawer></>
}
```

- Importa `@mui/material` + `@mui/icons-material/Menu` (não listado em `package.json` mas transitive), `emotion`.
- Nunca importado em `App.js` ou `menuAreas.jsx`.
- **Deletar** ou integrar no `menuAreas` para mobile.

## 5. modalAnimal.jsx (`components/modalAnimal.jsx:13`) – 388 linhas, 3 modais

**State:**
```js
const [openModalAnimal,setOpenModalAnimal]=useState(false) // 15
const [openModalImagem,setOpenModalImagem]=useState(false) // 16
const [abrirModalConfirmar,setAbrirModalConfirmar]=useState(false) // 17
const [animalData,setAnimalData]=useState(DEFAULT_ANIMAL_DATA) // 18 {pontuacao:0,tipo:"",isActive:true,lista_janelas:[]}
const [imagemData,setImagemData]=useState(DEFAULT_IMAGEM_DATA) // 19 {janela:'',temLiquido:false,file:{},caminho:""}
const [imagens,setImagens]=useState([]) // 20
const [imgSelected,setImgSelected]=useState({}) // 21
const [imgEdit,setImgEdit]=useState(false) // 22
```

**Funções:**
- `getImagens:24` `listarImagensAnimalReq(id)` → `setImagens(resp.imgs)` + deriva `lista_janelas` e `pontuacao` count `temLiquido`.
- `onOpenModalAnimal:45` se `props.edit` preenche `tipo,isActive` + `getImagens`, senão default.
- `onOpenModalImagem:58` se `img` preenche `janela,temLiquido,caminho`, senão default.
- `createUpdateAnimal:89` `cadastrarAnimalReq` ou `atualizarAnimalReq(id,animalData)` → `onCreateEdit` callback.
- `createUpdateImagem:112` `FormData` `janela,temLiquido,file` → `cadastrarImagemAnimalReq` ou `atualizarImagemAnimalReq`.
- `deletarImagem:143` `deletarImagemAnimalReq(imgSelected.animal, imgSelected.id)` → `getImagens`.

**Render:**
- Se `props.iconButton` → `i.bi-info-circle` senão `Button Cadastrar/Editar` `modalAnimal.jsx:160`.
- **Modal Animal** `173`: header `Cadastrar/Editar Animal #id`, body inputs `Espécie` `animalData.tipo`, `Status` select `isActive`, button `Cadastrar/Editar` + se `edit` tabela `Arquivo, Janela, Tem liquído?, Ações` com 3 ícones (`bi-info-circle` edit, `bi-image` open `CAMINHO_ARQUIVOS+img.caminho`, `bi-trash` confirm).
- **Modal Imagem** `269`: select `Janela` `HD/HR/ER/CC` com `disabled` se já existe (`lista_janelas.includes`) ou `imgEdit` disable, select `Tem Liquido?` Sim/Não, input `file` type file, button `Cadastrar/Editar` disabled se `janela===""`.
- **Modal Confirmar** `356`: `Tem Certeza excluir?` + Voltar/Deletar.

**Bugs:**
- `modalAnimal.jsx:289` `setImagemData({janela:e.target.value, temliquido:...})` typo `temliquido` (lowercase l) → `temLiquido` undefined em `createUpdateImagem`.
- `303` `return <div></div>` dentro de `map` quando janela já existe → React key warning + div vazio na option list.
- `getImagens:40` `setAnimalData({ ...resp.data, ...})` `resp.data` undefined (backend retorna `AnimalPOJO` com `id,tipo` etc., não `data`).
- `144` `deletarImagemAnimalReq(imgSelected.animal, ...)` `animal` é Long `id` mas `ImagemPOJO.animal` é long – ok.

## 6. modalFeedback.jsx (`components/modalFeedback.jsx:27`)

```js
const JANELAS = [{title:"HD",janela:0},{title:"ER",janela:1},{title:"CC",janela:2},{title:"HR",janela:3}] // 4
export default function ModalFeedback({animais,show}){
  return <Modal show={show}><Modal.Header>Feedback</Modal.Header><Modal.Body>
    {animais.map(a=> <table><thead><th>Animal N</th><th>Usuário</th><th>Resposta</th></thead>
      <tbody>{[0,1,2,3].map(i=>{
        let {clicked,temLiquido}=a.imgs[i]; let {title}=JANELAS[i];
        resposta = clicked===undefined? "Sem resposta" : clicked?"Tem líquido":"Não Tem líquido"
        check = Boolean(clicked)===temLiquido // 53
        return <tr><td>{resposta}</td><td>{check?checkIcon:xIcon}</td><td>{temLiquido?"Tem Líquido":"Não tem"}</td></tr>
      })} <tr><td>Escore</td><td>{pontuacaoSugerida||0}</td><td>{pontuacao}</td></tr></tbody></table>)}
    </Modal.Body><Modal.Footer><Button href='/'>Voltar</Button><Button reload>Tentar novamente</Button></Modal.Footer></Modal>
}
```

Usado em `paginaQuiz.js:279` com `animais` state. `JANELAS` ordem `HD,ER,CC,HR` diverge de backend mas mesma lógica que `paginaQuiz`.

## 7. customFeedbackModal.jsx (`components/customFeedbackModal.jsx:4`)

```js
export default function CustomFeedbackModal({feeds}){
  const [show,setShow]=useState(false)
  return <><Button onClick={()=>setShow(true)}>Ver Feedbacks</Button>
  <Modal show={show} size="lg"><Modal.Header>Feedback</Modal.Header><Modal.Body>
    {feeds.map(feed=> <table>{feed.janelas.map(i=>{
      check = i.resposta===i.respostaCorreta // 27
      return <tr><td>{i.janela.title}: {i.resposta}</td><td>{check?check:x}</td><td>{i.respostaCorreta}</td></tr>
    })}<tr><td>Escore</td><td>{feed.escore}</td><td>{feed.escoreCorreto}</td></tr></table>)}
  </Modal.Body><Modal.Footer><Button onClick={()=>{props.onClose();setShow(false)}}>Voltar</Button></Modal.Footer></Modal></>
}
```

- `feeds` vem de `JSON.parse(feed.data)` (`paginaInicial.js:155`, `feedbacks.js:56`).
- `feed.janelas` contém `{janela:{title,className,janela}, resposta, respostaCorreta}` gerado em `paginaQuiz.js:141`.

## 8. Topo.js (`components/Topo.js:1`) – 0 linhas

Arquivo vazio, legado `frontend/src/partial/components/Topo.js` movido. Pode deletar.

## 9. Estilos

- `css/index.css:1` em uso (importado `paginaInicial.js:2`, `paginaQuiz.js:8`). Define `.hd/.er/.cc/.hr` absolutos sobre `doggo.png` (`paginaQuiz.js:248`).
- `css/_index.css:1` legado com `.norte/.oeste/.leste/.sul` não usado.

---
*Fontes: `src/components/*.jsx`, `src/pages/adminAnimais.js:44`, `src/pages/paginaQuiz.js:279`*
