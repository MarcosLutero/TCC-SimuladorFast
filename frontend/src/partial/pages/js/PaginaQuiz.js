import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import gatinho from "../../img/gatinho.jpeg";
import foto1 from "../../img/animal-001-j1.jpg";
import foto2 from "../../img/animal-001-j2.jpg";
import foto3 from "../../img/animal-001-j3.jpg";
import foto4 from "../../img/animal-001-j4.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import PaginaInicial from "./PaginaInicial";
class PaginaQuiz extends React.Component {
  
  state = {
    selected: 0,
    imgs: [gatinho, foto1, foto2, foto3, foto4],
    id: 1,
    cadastro: "25/05/2022",
    tempo: 120,
    pergunta: "Tem liquido?",
    timer: null
  };

  flag = false;
  componentDidMount(){
    if (!this.flag) this.setState({timer: setInterval(() => {
      if (this.state.tempo > 0) {
       this.setState(state => ({tempo: state.tempo - 1}))
      }
    }, 1000) });
    this.flag = true;
  }

  componentWillUnmount(){
    if (this.state.timer)
    clearInterval(this.state.timer);
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
    return (
      <>
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
              className="norte"
              onClick={() => {
                this.setState({ selected: 1 });
              }}
            >
              .
            </div>
            <div
              className="nordeste"
              onClick={() => {
                this.setState({ selected: 2 });
              }}
            >
              .
            </div>
            <div
              className="sul"
              onClick={() => {
                this.setState({ selected: 3 });
              }}
            >
              .
            </div>
            <div
              className="sudeste"
              onClick={() => {
                this.setState({ selected: 4 });
              }}
            >
              .
            </div>
            <img src={gatinho} alt="" />
            <div className="informacoes_img">
              <p> id: {this.state.id}</p>
              <p>cadastro: {this.state.cadastro}</p>
            </div>
          </div>
          <div className="col-6 pt-4 text-center">
            <div className="botao_voltar">
              <Button
              onClick={() => this.props.setPagina(PaginaInicial)}
              >Voltar</Button>
            </div>
            <div className="img-return">
              <img
              alt=""
                src={this.state.imgs[this.state.selected]}
              />
            </div>
            <div>
              <p>Tempo:{this.formatarTempo()}</p>
            </div>
            <div className="pergunta">
              <h4>{this.state.pergunta}</h4>
            </div>
            <div className="resposta">
              <Container className="mt-3">
                <Row className="mb-5">
                  <Col xs={6}>
                    <Button>Não</Button>
                  </Col>
                  <Col xs={6}>
                    <Button>Sim</Button>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default PaginaQuiz;
