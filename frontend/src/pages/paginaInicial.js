import React from 'react'
import "../css/index.css"
import { Link } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'
import { listarFeedbacksReq } from '../api/feedback'
import CustomFeedbackModal from '../components/customFeedbackModal'
import MenuAreas from '../components/menuAreas'


class PaginaInicial extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      configModal: false,
      config: {},
      newTempo: 3,
      newQtd: 1,
      historico: []
    }

    this.abrirHistoricoModal = this.abrirHistoricoModal.bind(this)

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

    config.config = config

    this.setState({ ...config })
  }

  saveConfig() {
    const config = {
      tempo: this.state.newTempo,
      qtd: this.state.newQtd
    }
    window.sessionStorage.setItem("config", JSON.stringify(config))
    this.setState({ config })
  }

  abrirHistoricoModal() {
    this.setState({ historicoModal: true })
    let usuario = sessionStorage.getItem("usuario")
    usuario = JSON.parse(usuario)
    listarFeedbacksReq(usuario.id)
      .then(resp => {
        this.setState({ historico: resp })
      })
      .catch(e => {
        console.log("deu ruim 23")
      })
  }

  componentDidMount() {
    this.loadFromStorage()
  }

  render() {
    return (
      <div className='col-12' style={{ backgroundColor: "black", height: "100vh" }}>
        <MenuAreas />
        <div className='titulo' style={{ paddingTop: "20%" }}>
          <h1>
            Simulador de Exame A-FAST
          </h1>
        </div>
        <div className='botao my-3'>
          <Link
            className="btn btn-primary btn-sm"
            to={'/quiz'}
          >
            Começar
          </Link>
        </div>
        <div className='d-flex d-row justify-content-center' >
          <div className='configuracoes mt-2' style={{ cursor: "pointer" }} onClick={this.abrirHistoricoModal}>
            Meu Histórico
          </div>
          <div>.   .    .     .    .    .</div>
          <div
            className='configuracoes mt-2'
            style={{ cursor: "pointer" }}
            onClick={() => this.setState({ configModal: true })}
          >
            Configurações
          </div>
        </div>

        <Modal show={this.state.configModal}>
          <Modal.Header>Configurações</Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label><strong>Quantidade de Animais</strong></label>
              <input
                className="form-control"
                id="qtdControl"
                value={this.state.newQtd}
                onChange={e => {
                  this.setState({ newQtd: Number(e.target.value) })
                }}
              />
            </div>
            <div className="form-group mt-2">
              <label><strong>Temporizador - minuto(s) por imagem</strong></label>
              <input
                className="form-control"
                id="timeControl"
                value={this.state.newTempo}
                onChange={e => this.setState({ newTempo: Number(e.target.value) })}
              >
              </input>
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
        <Modal show={this.state.historicoModal}>
          <Modal.Header>Histórico</Modal.Header>
          <Modal.Body>
            <div style={{ overflowY: 'scroll', height: '280px' }}>
              <table className='table'>
                <thead>
                  <tr>
                    <th>Data de Criação</th>
                    <th>Tempo Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.historico.map((feed, index) => (
                    <tr key={index}>
                      <td>{feed.createdAt ? new Date((feed.createdAt)).toLocaleString() : "Sem data"}</td>
                      <td>{feed.tempoTotal}</td>
                      <td><CustomFeedbackModal
                        feeds={JSON.parse(feed.data)}
                        onOpen={() => this.setState({ historicoModal: false })}
                        onClose={() => this.setState({ historicoModal: true })}
                      />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" size='sm' onClick={() => this.setState({ historicoModal: false })} >
              Voltar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default PaginaInicial