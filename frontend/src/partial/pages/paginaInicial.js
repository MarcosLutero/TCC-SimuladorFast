import React from 'react'
import "../css/index.css"
import { Link } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'


class PaginaInicial extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      configModal: false,
      config: {},
      newTempo: 3,
      newQtd: 1
    }
  }

  loadFromStorage() {
    let config = window.sessionStorage.getItem("config")
    if (!config) {
      config = {
        tempo: 3,
        qtd: 1
      }
    } else {
      config = JSON.parse(config)
    }


    this.setState({ config })
  }

  saveConfig() {
    const config = {
      tempo: this.state.newTempo,
      qtd: this.state.newQtd
    }
    window.sessionStorage.setItem("config", JSON.stringify(config))
    this.setState({config})
  }

  componentDidMount() {
    this.loadFromStorage()
  }

  render() {
    return (
      <div className='col-12' style={{ backgroundColor: "black", height: "100vh" }}>
        <small style={{ cursor: "pointer" }} onClick={() => window.location.href = "admin/animais"} >Admin</small>
        <div className='titulo' style={{ paddingTop: "20%" }}>
          <h1>
            Simulador de Exame A-FAST
          </h1>
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
          <small style={{ cursor: "pointer" }} onClick={() => this.setState({ configModal: true })} >Configurações</small>
        </div>
        <Modal show={this.state.configModal}>
          <Modal.Header>Configurações</Modal.Header>
          <Modal.Body>
            <div class="form-group">
              <label for="qtdControl"><strong>Quantidade de Animais</strong></label>
              <select
                class="form-control"
                id="qtdControl"
                onChange={e => this.setState({ newQtd: Number(e.target.value) })}
              >
                {[1,2,3].map(i => {
                  return <option selected={i==this.state.config.qtd}>{i}</option>
                })}
              </select>
            </div>
            <div class="form-group mt-2">
              <label for="timeControl"><strong>Temporizador</strong></label>
              <select
                class="form-control"
                id="timeControl"
                onChange={e => this.setState({ newTempo: Number(e.target.value) })}
              >
                {[1,2,3,4,5].map(i => {
                  return <option selected={i==this.state.config.tempo} value={i}>{i} minuto(s)</option>
                })}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" size='sm' onClick={() => this.setState({ configModal: false })} >Voltar</Button>
            <Button 
              size='sm' 
              onClick={() => {
                this.saveConfig()
                this.setState({ configModal: false })
              }} 
              >
                Salvar
                </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default PaginaInicial