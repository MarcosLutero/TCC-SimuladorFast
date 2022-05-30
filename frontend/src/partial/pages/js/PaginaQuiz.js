import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import foto1 from "../../img/foto1.jpg";
import foto2 from "../../img/foto2.jpeg";
import foto3 from "../../img/foto3.jpg";
import foto4 from "../../img/foto4.jpeg";
import foto5 from "../../img/foto5.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
class PaginaQuiz extends React.Component {
  state = {
    selected: 0,
    imgs: [foto1, foto2, foto3, foto4, foto5],
    id: 1,
    cadastro: "25/05/2022",
    Tempo: 120,
    pergunta: "pergunta 1",
  };
  
  startTime(){
    setTimeout(() => {
    if(this.state.Tempo> 0){
        this.setState(this.state.Tempo -=1)}
    },1000)
  }
 
  formatarTempo(time){

    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

 

  render() {
    return (
      <>
        <div className="row mt-5 div_principal">
          <div
            className="col-6 pt-4 text-center"
            style={{ border: "1px solid black" }}
          >
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
              style={{
                width: 200,
                heigth: 200,
                position: "absolute",
                left: 200,
                top: 200,
                opacity: 0.3,
              }}
              className="bg-danger norte"
              onClick={() => {
                this.setState({ selected: 1 });
              }}
            >
              .
            </div>
            <div
              style={{
                width: 200,
                heigth: 200,
                position: "absolute",
                left: 550,
                top: 200,
                opacity: 0.3,
              }}
              className="bg-success nordeste"
              onClick={() => {
                this.setState({ selected: 2 });
              }}
            >
              .
            </div>
            <div
              style={{
                width: 200,
                heigth: 200,
                position: "absolute",
                left: 200,
                top: 400,
                opacity: 0.3,
              }}
              className="bg-info sul"
              onClick={() => {
                this.setState({ selected: 3 });
              }}
            >
              .
            </div>
            <div
              style={{
                width: 200,
                heigth: 200,
                position: "absolute",
                left: 550,
                top: 400,
                opacity: 0.3,
              }}
              className="bg-warning suldeste"
              onClick={() => {
                this.setState({ selected: 4 });
              }}
            >
              .
            </div>
            <img src={foto1} alt="" />
            <div className="informacoes_img">
              <p> id: {this.state.id}</p>
              <p>cadastro: {this.state.cadastro}</p>
            </div>
          </div>
          <div
            className="col-6 pt-4 text-center"
            style={{ border: "1px solid black" }}
          >
            <div className="img-return" style={{ border: "1px solid black" }}>
              <img src={this.state.imgs[this.state.selected]} />
            </div>
            <div>
              <p>
                Tempo:{this.formatarTempo(this.state.Tempo)}
                
              </p>
            </div>
            <div className="pergunta">
              <h4>{this.state.pergunta}</h4>
            </div>
            <div className="resposta">
              <Container>
                <Row className="mb-5">
                  <Col xs={6}>
                    <Button>resposta 1</Button>
                  </Col>
                  <Col xs={6}>
                    <Button>resposta 2</Button>
                  </Col>
                </Row>

                <Row>
                  <Col xs={6}>
                    <Button>resposta 3</Button>
                  </Col>
                  <Col xs={6}>
                    <Button>resposta 4</Button>
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
