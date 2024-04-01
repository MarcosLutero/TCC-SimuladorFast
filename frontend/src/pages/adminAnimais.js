import React from "react";
import { Container } from "react-bootstrap";
import ModalAnimal from "../components/modalAnimal";
import { listarAnimaisReq, deletarAnimalReq } from '../api/animal'
import MenuAreas from "../components/menuAreas";

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export default class AdminAnimais extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      animais: [],
    };

  }
  deletarAnimal(animal) {
    deletarAnimalReq(animal.id)
      .then(resp => this.getAnimais())
      .catch(err => console.log(err))
  }
  getAnimais() {
    listarAnimaisReq()
      .then((data) => {
        this.setState({ animais: data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getAnimais();
  }

  render() {
    return (
      <Container fluid className="p-0 m-0 col-12">
        <MenuAreas />
        <h4 className="text-center">Animais Cadastrados</h4>
        <div className="text-center">
          <ModalAnimal onCreateEdit={() => this.getAnimais()} />
        </div>
        <table className="mx-2 table table-striped table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Espécie</th>
              <th>Status</th>
              <th>Escore</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {this.state.animais.map(animal => <tr key={animal.id} >
              <td>{animal.id}</td>
              <td>{animal.tipo}</td>
              <td>{animal.isActive? "Ativo": "Inativo"}</td>
              <td>{animal.pontuacao}</td>
              <td>{new Date(animal.cadastro).toLocaleString("pt-BR", options)}</td>
              <td>
                <div className="d-flex justify-content-around">
                  <ModalAnimal
                    iconButton
                    edit
                    animal={animal}
                    onCreateEdit={() => this.getAnimais()}
                  />
                  <i
                    className="bi-trash text-danger"
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
