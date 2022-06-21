import React from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import gatinho from "../img/gatinho.jpeg";
import doguinio from "../img/doguineo.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import axios from "axios";

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

const JANELAS = [
  {
    title: "HD",
    className: "nordeste",
    classNameDog: "nordesteDog",
    janela: 0
  },
  {
    title: "ER",
    className: "sul",
    classNameDog: "sulDog",
    janela: 1
  },
  {
    title: "CC",
    className: "norte",
    classNameDog: "norteDog",
    janela: 2
  },
  {
    title: "HR",
    className: "sudeste",
    classNameDog: "sudesteDog",
    janela: 3
  }
]

const API_URL = "http://localhost:8080"
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;

class paginaQuiz extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedAnimal: 0,
      selectedArea: -1,
      perfil: gatinho,
      tempo: 120,
      timer: null,
      animais: [],
      score: 0,
      
    };

  }

  flag = false;

  getAnimais() {
    let qtdAnimais = window.location.href.split("qtd=")[1] || 1
    axios
      .get(`${API_URL}/sortear-animais/${qtdAnimais}`)
      .then(({ data }) => {
        this.setState({ animais: data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidMount() {
    if (!this.flag)
      this.setState({
        timer: setInterval(() => {
          if (this.state.tempo > 0) {
            this.setState((state) => ({ tempo: state.tempo - 1 }));
          }
        }, 1000),
      });
    this.flag = true;
  }

  componentWillUnmount() {
    this.getAnimais();
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
    const { selectedAnimal, selectedArea } = this.state;
    const animal = this.state.animais[selectedAnimal];
    return (
      <Container fluid className="p-0 m-0">
        <div className='titulo col-12 my-2'>
          <h2>
            Simulador de Exame A-FAST
          </h2>
        </div>
        <Row className="m-5 mt-0">
          <Col
            lg={6}
            className="align-items-center justify-content-center text-center"
          >
            <div className="row col-12"> 
                <Link to={"/"} className='btn btn-primary col-lg-3 mx-auto'>Voltar ao Lobby</Link> 
                <button className="col-lg-3 btn btn-outline-primary btn-sm mx-auto">Tempo:{this.formatarTempo()}</button>
                <button className="col-lg-3 btn btn-outline-primary btn-sm mx-auto" >score: {this.state.score}</button>
            </div>
          
            <Image
              alt="imagem"
              className="  m-0 p-0 imagem-direita"
              style={{
                maxWidth: "440px",
                width: "auto",
                minHeight: "390px"
              }}
              src={animal && this.state.selectedArea !== -1 ? `${CAMINHO_ARQUIVOS}${animal.imgs[selectedArea].caminho}` : ""}
            /> 
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" id="customSwitch1" />
              <label class="custom-control-label" for="customSwitch1">Tem liquido?</label>
            </div>
          </Col>
       
          <Col
            lg={6}
            md={12}
            sm={12}
            className="align-items-center justify-content-center text-center"
          >
            <Row className="mb-2">
              <Col className="d-flex justify-content-around">
                <small className="mt-2">
                  {this.state.selectedAnimal + 1}/{this.state.animais.length}
                </small>
                <Button
                  disabled={selectedAnimal === this.state.animais.length - 1}
                  onClick={() => {
                    this.setState({ selectedAnimal: selectedAnimal + 1 })
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                  &nbsp;&nbsp; PROXIMA
                </Button>
              </Col>
            </Row>
            <div className="div-geral">
              <div style={{ position: "absolute", maxWidth: "200px", width: "auto" }}>
                {JANELAS.map((item, _) =>
                  <div
                    title={item.title}
                    className={animal && animal.tipo === "gato" ? item.className : item.classNameDog}
                    onMouseOver={() => this.setState({ selectedArea: item.janela })}
                    onMouseLeave={() => this.setState({ selectedArea: -1 })}
                  >
                    .
                  </div>
                )}
              </div>
              <Image
                src={animal && animal.tipo === "gato" ? gatinho : doguinio}
                className="mb-2"
                alt="imagem"
                style={{
                  maxWidth: 805,
                  maxHeight: 452
                }}
              />
            </div>
            <Card>
              <Card.Header className="bg-success text-white" >
                <h6>INFORMAÇÕES</h6>
              </Card.Header>
              <Card.Body className="bg-secondary text-white">
                <p> 
                  Id: {this.state.animais.length && animal ? animal.id : 0}
                  <br />
                  Cadastro:{" "}
                  {this.state.animais.length && animal ? new Date(animal.cadastro).toLocaleString("pt-BR", options) : "N/A"}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default paginaQuiz;
