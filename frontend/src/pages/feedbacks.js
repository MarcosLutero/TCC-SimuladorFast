import React from "react";
import { Container } from "react-bootstrap";
import { listarFeedbacksReq } from "../api/feedback";
import CustomFeedbackModal from "../components/customFeedbackModal";
import MenuAreas from "../components/menuAreas";

export default class AdminUsuarios extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      feedbacks: [],
    };

  }

  getFeedbacks() {
    listarFeedbacksReq()
      .then((feedbacks) => {
        this.setState({ feedbacks });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getFeedbacks();
  }

  render() {
    return (
      <Container fluid className="p-0 m-0 col-12">
        <MenuAreas />
        <h4 className="text-center">Feedbacks</h4>
        <div style={{ overflowY: 'scroll', height: 'calc(100vh - 100px)' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Data de Criação</th>
                <th>Usuario</th>
                <th>Tempo Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {this.state.feedbacks.map((feed, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{feed.createdAt ? new Date((feed.createdAt)).toLocaleString() : "Sem data"}</td>
                  <td>{feed.usuario}</td>
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
      </Container>
    );
  }
}
