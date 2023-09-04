import React from 'react'
import "../css/index.css"
import { Link } from 'react-router-dom'


class PaginaInicial extends React.Component {
  render() {
    return (
      <div className='paginaInicial'>
        <div className='titulo'>
          <h2>
            Simulador de Exame A-FAST
          </h2>
        </div>
        <div className='botao'>
          <Link 
            className="btn btn-primary btn-sm" 
            to={'/quiz'}
          >
            Começar
          </Link>
        </div>
        <div className='configuracoes mt-2'>
          <small style={{cursor: "pointer"}} onClick={() => window.location.href = "admin/animais"} >Configurações</small>
        </div>
      </div>
    )
  }
}

export default PaginaInicial