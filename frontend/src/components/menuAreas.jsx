import React from 'react'
import Logout from './logout'

const TELAS = [
    { name: "Inicio", path: "/", nivel: 1 },
    { name: "Animais", path: "/animais", nivel: 2 },
    { name: "Feedbacks", path: "/feedbacks", nivel: 2 },
    { name: "Usuarios", path: "/admin/usuarios", nivel: 3 },
]

export default function MenuAreas(props) {
    const nivelAcesso = parseInt(sessionStorage.getItem('nivelAcesso'))
    const usuario = JSON.parse(sessionStorage.getItem('usuario'))

    const telaInicial = window.location.pathname === "/"
    return <nav className={`navbar navbar-expand-lg ${telaInicial? "navbar-dark": 'navbar-light'}`}>
        { telaInicial? <div /> : <a class="navbar-brand" href="/">
            <div className='titulo my-2 text-dark'>
                <h1 className='ml-3'>
                    .  Simulador de Exame A-FAST
                </h1>
            </div>
        </a>}
        <div className="collapse navbar-collapse d-lg-flex justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
                {TELAS.map((tela, i) => {
                    const telaAtual = tela.path === window.location.pathname
                    if (tela.nivel > nivelAcesso || telaAtual) {
                        return <li></li>
                    }
                    return <li key={`nav_${i}`} className={`nav-item ${telaAtual ? "active" : ''}`}>
                        <a className="nav-link" key={"buttoens_" + i} href={tela.path} >{tela.name}</a>
                    </li>
                })}
                <Logout />
            </ul>
        </div>
    </nav>
}