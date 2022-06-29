import React from "react";
import { Button, Card, Col, Container, Image, Modal, Row } from "react-bootstrap";
import doguinio from "../img/doguineo.jpg";
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
    className: "norte",
    classNameDog: "norte",
    janela: 0
  },
  {
    title: "HR",
    className: "oeste",
    classNameDog: "oeste",
    janela: 1
  },
  {
    title: "ER",
    className: "leste",
    classNameDog: "leste",
    janela: 2
  },
  {
    title: "CC",
    className: "sul",
    classNameDog: "sul",
    janela: 3
  }
]

const API_URL = "http://localhost:8080"
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;

class PaginaQuiz extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedAnimal: 0,
      selectedArea: -1,
      perfil: doguinio,
      tempo: 180,
      timer: null,
      score: 0,
      animais: [],
      modalFeedback: false
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
    this.getAnimais();
    if (!this.flag)
      this.setState({
        timer: setInterval(() => {
          if (this.state.tempo > 0) {
            this.setState((state) => ({ tempo: state.tempo - 1 }));
          } else {
            this.darFeedback()
          }
        }, 1000),
      });
    this.flag = true;
  }

  componentWillUnmount() {
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

  darFeedback() {
    this.setState({ modalFeedback: true })
  }

  render() {
    const { selectedAnimal, selectedArea } = this.state;
    let animal = this.state.animais[selectedAnimal];
    return (
      <Container fluid className="p-0 m-0 bg-dark text-light pb-5">
        <div className='titulo col-12 my-2'>
          <h2>
            Simulador de Exame A-FAST
          </h2>
        </div>
        <Row className="mb-5 mx-1 mt-0">
          <Col
            lg={6}
            className="align-items-center justify-content-center text-center"
          >
            <div className="row col-12 col-12">
              <Link to={"/"} className='btn btn-primary col-lg-3 mx-auto btn-sm mb-2'>Voltar</Link>
              <div className="col-lg-6 mt-1">
                Tempo:{this.formatarTempo()} /
                Score: {this.state.score}
              </div>
            </div>
            {this.state.selectedArea !== -1 ?
              <div class="custom-control custom-switch my-3">
                <label ><strong>{!animal.imgs[selectedArea].clicked ? "Não" : ""} Tem liquido</strong></label>
              </div> :
              <div />
            }
            {animal && this.state.selectedArea !== -1 ?
              <Image
                alt="imagem"
                className="m-0 p-0 imagem-direita"
                style={{
                  maxWidth: "440px",
                  width: "auto",
                  minHeight: "390px"
                }}
                src={`${CAMINHO_ARQUIVOS}${animal.imgs[selectedArea].caminho}`}
              /> : "Procure as areas"}
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
                  onClick={() => {
                    this.setState({ modalFeedback: true })
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                  &nbsp;&nbsp; Enviar
                </Button>
              </Col>
            </Row>
            <div
              style={{
                background: `url(${doguinio}) no-repeat center /cover`,
                height: 500,
                width: 700
              }}
              className="image-box img-fluid">

              <div className="img-exam-controls" style={{
              }}>
                <div className="view-area-HD" style={{
                  display: "flex",
                  paddingTop: 10,
                  width: '100%',
                  flexDirection: "row",
                  justifyContent: "center",
                }}>
                  <button style={{
                    marginTop: 30
                  }}>
                    HD
                  </button>
                </div>
                <div className="view-area-ER" style={{
                  display: "flex",
                  padding: 60,
                  width: '100%',
                  flexDirection: "row",
                  justifyContent: "start"
                }}>
                  <button>
                    ER
                  </button>
                </div>
                <div className="view-area-HR" style={{
                  display: "flex",
                  width: '100%',
                  flexDirection: "row",
                  justifyContent: "end"
                }}>
                  <button>
                    HR
                  </button>
                </div>
                <div className="view-area-CC">
                  <button>
                    CC
                  </button>
                </div>
              </div>
            </div>
            <div className="div-geral bg-info">
              <div style={{ position: "absolute", maxWidth: "200px", width: "auto" }}>
                {JANELAS.map((item, _) =>
                  <div
                    title={item.title}
                    className={item.className}
                    onMouseOver={() => this.setState({ selectedArea: item.janela })}
                    onMouseLeave={() => this.setState({ selectedArea: -1 })}
                    onClick={() => {
                      let animaisTemp = this.state.animais;
                      let temp = animal
                      temp.imgs[selectedArea].clicked = !temp.imgs[selectedArea].clicked

                      animaisTemp[this.state.selectedAnimal] = temp

                      let score = this.state.score
                      if (temp.imgs[selectedArea].clicked) {
                        score += 1
                      } else {
                        score -= 1
                      }
                      this.setState({ animais: animaisTemp, score })
                    }}
                  >
                    {item.title}
                  </div>
                )}
              </div>
              <Image
                src={doguinio}
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
        <Modal show={this.state.modalFeedback}>
          <Modal.Header>Feedback</Modal.Header>
          <Modal.Body>

            {[0, 1, 2, 3].map(i => {
              let resposta = ''
              let check = false
              if (animal && animal.imgs[i].clicked == true) {
                resposta = <h6>{JANELAS[i].title}: Tem líquido</h6>
                check = Boolean(animal.imgs[i].clicked) == animal.imgs[i].temLiquido
              } else if (animal && animal.imgs[i].clicked == false) {
                resposta = <h6>{JANELAS[i].title}: Não tem líquido</h6>
                check = Boolean(animal.imgs[i].clicked) == animal.imgs[i].temLiquido
              } else if (animal && animal.imgs[i].clicked == null) {
                resposta = <h6 className='text-secondary'>{JANELAS[i].title}: Sem resposta</h6>
              }
              return <div className="d-flex justify-content-between" key={i}>
                {resposta}
                <h6>{check ?
                  <i className="bi bi-check-circle-fill text-success" /> :
                  <i className="bi bi-x-circle-fill text-danger" />
                }
                </h6>
              </div>
            }
            )}

            <h4 className='pt-3'>Score: {this.state.score}</h4>
            <h4>Score Esperado: {animal ? animal.pontuacao : 0}</h4>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" size='sm' onClick={() => window.location.href = '/'} >Voltar a Página Inicial</Button>
            <Button onClick={() => window.location.reload()} size='sm' >Tentar novamente</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default PaginaQuiz;
