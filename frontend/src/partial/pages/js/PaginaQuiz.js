import React from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import gatinho from "../../img/gatinho.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import axios from "axios";

const CAMINHO_ARQUIVOS = "/home/jr/tcc/arquivos";
class PaginaQuiz extends React.Component {
  state = {
    selectedAnimal: 0,
    selectedArea: 0,
    perfil: gatinho,
    tempo: 120,
    timer: null,
    animais: [],
  };

  flag = false;

  getAnimais() {
    axios
      .get("http://localhost:8080/sortear-animais/2")
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
    const selectedAnimal = this.state.animais[this.state.selectedAnimal];
    return (
      <Container fluid className="p-0 m-0">
        <Row className="m-5">
          <Col
            lg={{ offset: 1, span: 4 }}
            className="align-items-center justify-content-center text-center"
          >
            <Row className="mb-2">
              <Col className="d-flex justify-content-around">
                <Button>
                  <FontAwesomeIcon icon={faChevronLeft} />
                  &nbsp;&nbsp; ANTERIOR
                </Button>
                <Button>
                  <FontAwesomeIcon icon={faChevronRight} />
                  &nbsp;&nbsp; PROXIMA
                </Button>
              </Col>
            </Row>
            <div className="div-geral">
              <div
                title="HD"
                className="norte"
                onClick={() => {
                  this.setState({ selectedArea: 0 });
                }}
              >
                .
              </div>
              <div
                title="ER"
                className="nordeste"
                onClick={() => {
                  this.setState({ selectedArea: 1 });
                }}
              >
                .
              </div>
              <div
                title="CC"
                className="sul"
                onClick={() => {
                  this.setState({ selectedArea: 2 });
                }}
              >
                .
              </div>
              <div
                title="HR"
                className="sudeste"
                onClick={() => {
                  this.setState({ selectedArea: 3 });
                }}
              >
                .
              </div>
              <Image src={gatinho} className="mb-2 imagem imagem-esquerda" alt="imagem" />
            </div>
            <Card>
              <Card.Header className="bg-success text-white" >
                <h1>INFORMAÇÕES</h1>
              </Card.Header>
              <Card.Body className="bg-info text-white">
                <p> id: {this.state.animais.length ? selectedAnimal.id : 0}</p>
                <p>
                  cadastro:{" "}
                  {this.state.animais.length ? selectedAnimal.cadastro : "N/A"}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col
            lg={{ offset: 1, span: 4 }}
            className="align-items-center justify-content-center text-center"
          >
            <Row>
              <Link to={"/"}>Voltar</Link>
            </Row>

            <Image
              alt="imagem"
              className="img-fluid imagem imagem-direita m-0 p-0"
              src={
                selectedAnimal
                  ? selectedAnimal.imgs[this.state.selectedArea].caminho
                  : ""
              }
            />
            <p>Tempo:{this.formatarTempo()}</p>

            <div className="pergunta">
              <h4>Tem liquido?</h4>
            </div>
            <Row className="mb-5">
              <Col className="d-flex justify-content-around">
                <Button className="bnt-lg">Sim</Button>

                <Button className="bnt-lg">Não</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PaginaQuiz;
