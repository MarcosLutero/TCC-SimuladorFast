import React from 'react'
import "../css/index.css"
import { Button } from "react-bootstrap"
import PaginaQuiz from './PaginaQuiz'


class PaginaInicial extends React.Component {
  render() {
    return (
      <>
        <div className='paginaInicial'>
          <div className='titulo'>
            <h2>
              Simulador de Exame A-FAST
            </h2>
          </div>
          <div className='botao'>
            <Button
              variant="primary"
              className="btn-primary"
              size="sm"
              onClick={() => this.props.setPagina(PaginaQuiz)}
            >
              Começar
            </Button>
          </div>
          <div className='configuracoes'>
            <p>Configurações</p>
          </div>
        </div>
      </>
    )
  }
}

export default PaginaInicial