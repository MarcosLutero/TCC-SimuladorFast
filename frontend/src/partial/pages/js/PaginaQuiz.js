import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import gatinho from "../../img/gatinho.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import axios from "axios";

const CAMINHO_ARQUIVOS = '/home/jr/tcc/arquivos';
class PaginaQuiz extends React.Component {

  state = {
    selectedAnimal: 0,
    selectedArea: 0,
    perfil: gatinho,
    tempo: 120,
    timer: null,
    animais: []
  };

  flag = false;

  getAnimais() {
    axios.get('http://localhost:8080/sortear-animais/2')
      .then(({ data }) => {
        this.setState({ animais: data })
      })
      .catch(err => {
        console.log(err)
      })
  }

  componentDidMount() {
    if (!this.flag) this.setState({
      timer: setInterval(() => {
        if (this.state.tempo > 0) {
          this.setState(state => ({ tempo: state.tempo - 1 }))
        }
      }, 1000)
    });
    this.flag = true;
  }

  componentWillUnmount() {
    this.getAnimais()
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }

  }


  formatarTempo() {
    const minutes = Math.floor(this.state.tempo / 60);
    let seconds = this.state.tempo % 60;
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  render() {
    const selectedAnimal = this.state.animais[this.state.selectedAnimal];
    return (
      <div className="row mt-5 div_principal">
        <div className="col-6 pt-4 text-center">
          <div className="">
            <div className="botoes">
              <Button>
                <FontAwesomeIcon icon={faChevronLeft} />
              </Button>
            </div>
            <div className="botoes">
              <Button>
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </div>
          </div>
          <div
            title='HD'
            className="norte"
            onClick={() => {
              this.setState({ selectedArea: 0 });
            }}
          >
            .
          </div>
          <div
            title='ER'
            className="nordeste"
            onClick={() => {
              this.setState({ selectedArea: 1 });
            }}
          >
            .
          </div>
          <div
            title='CC'
            className="sul"
            onClick={() => {
              this.setState({ selectedArea: 2 });
            }}
          >
            .
          </div>
          <div
            title='HR'
            className="sudeste"
            onClick={() => {
              this.setState({ selectedArea: 3 });
            }}
          >
            .
          </div>
          <img src={gatinho} className='img-fluid' alt="" />
          <div className="informacoes_img">
            <p> id: {this.state.animais.length ? selectedAnimal.id : 0}</p>
            <p>cadastro: {this.state.animais.length ? selectedAnimal.cadastro : "N/A"}</p>
          </div>
        </div>
        <div className="col-6 pt-4 text-center">
          <div className="botao_voltar">
            <Link to={'/'}>Voltar</Link>
          </div>
          <div className="img-return">
            <img
              alt="a"
              className="img-fluid"
              src={selectedAnimal ? selectedAnimal.imgs[this.state.selectedArea].caminho : ""}
            />
          </div>
          <div>
            <p>Tempo:{this.formatarTempo()}</p>
          </div>
          <div className="pergunta">
            <h4>Tem liquido?</h4>
          </div>
          <div className="resposta">
            <Container className="mt-3">
              <Row className="mb-5">
                <Col xs={6}>
                  <Button>Sim</Button>
                </Col>
                <Col xs={6}>
                  <Button>Não</Button>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}

export default PaginaQuiz;
