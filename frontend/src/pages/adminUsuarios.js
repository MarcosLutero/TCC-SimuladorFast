import React from "react";
import { Button, Container } from "react-bootstrap";
import { listarUsuariosReq, promoverUsuarioReq } from "../api/usuarios";
import MenuAreas from "../components/menuAreas";

export default class AdminUsuario extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      usuarios: [],
    };

  }

  getUsuarios() {
    listarUsuariosReq()
      .then((usuarios) => {
        this.setState({ usuarios: usuarios });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  promoverUsuario(id) {
    promoverUsuarioReq(id)
      .then(() => {
        window.location.reload()
      })
      .catch(e => {
        console.log("error: ", e)
      })
  }

  componentDidMount() {
    this.getUsuarios();
  }

  mostrarRole(role) {
    switch (role) {
      case "ROLE_ADMIN":
        return "Administrador"
      case "ROLE_TECNICO":
        return "Medico"
      default:
        return "Usuario"
    }

  }

  render() {
    return (
      <Container fluid className="p-0 m-0 col-12">
        <MenuAreas />
        <h4 className="text-center">Usuarios</h4>
        <table className="mx-2 table table-striped table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Nivel de Acesso</th>
              <th>Data Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {this.state.usuarios.map((usuario, index) => <tr key={usuario.id} >
              <td>{index + 1}</td>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{this.mostrarRole(usuario.role)}</td>
              <td>{usuario.created ? new Date((usuario.created)).toLocaleString() : "Sem data"}</td>
              <td>
                {usuario.role !== "ROLE_ADMIN" ?
                  <Button
                    size="sm"
                    onClick={() => this.promoverUsuario(usuario.id)}
                  >
                    {usuario.role === "ROLE_USER"? "Promover": "Despromover"}
                  </Button>
                  : <div />}
              </td>
            </tr>)}
          </tbody>
        </table>
      </Container>
    );
  }
}
