import React from "react";
import { Container } from "react-bootstrap";
import axios, { Axios } from "axios";
import ModalAnimal from "../components/modalAnimal";

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

const API_URL = "http://localhost:8080"
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;

export default class AdminAnimais extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      animais: [],
    };

  }
  deletarAnimal(animal) {
    let url = `${API_URL}/animais/${animal.id}/`
    axios.delete(url)
      .then(resp => this.getAnimais())
      .catch(err => console.log(err))
  }

  getAnimais() {
    axios
      .get(`${API_URL}/animais`)
      .then(({ data }) => {
        this.setState({ animais: data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  UNSAFE_componentWillMount() {
    this.getAnimais();
  }

  render() {
    return (
      <Container fluid className="p-0 m-0 col-12">
        <div className='titulo col-12 my-2'>
          <h2>
            Simulador de Exame A-FAST
          </h2>
        </div>
        <h4 className="text-center">Animais Cadastrados</h4>
        <div className="text-center">
          <ModalAnimal onCreateEdit={() => this.getAnimais()} />
        </div>
        <table className="mx-2 table table-striped table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Cadastro</th>
              <th>Pontuação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {this.state.animais.map(animal => <tr key={animal.id} >
              <td>{animal.id}</td>
              <td>{animal.tipo}</td>
              <td>{new Date(animal.cadastro).toLocaleString("pt-BR", options)}</td>
              <td>{animal.pontuacao}</td>
              <td>
                <div className="d-flex justify-content-around">
                  <ModalAnimal
                    iconButton
                    edit
                    animal={animal}
                    onCreateEdit={() => this.getAnimais()}
                  />
                  <i
                    class="bi-trash text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => this.deletarAnimal(animal)}
                  />
                </div >
              </td>
            </tr>)}
          </tbody>
        </table>
      </Container>
    );
  }
}
