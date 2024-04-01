import React from "react"
import { Button, Modal } from "react-bootstrap"

export default function CustomFeedbackModal(props) {
    const [show, setShow] = React.useState(false)
    return <div>
        <Button size="sm" onClick={() => {
            setShow(true)
        }}>Ver Feedbacks</Button>
        <Modal show={show} size="lg">
            <Modal.Header><h3>Feedback</h3></Modal.Header>
            <Modal.Body>
                {props.feeds.map((feed, _) => {
                    return (
                        <div className="mb-2" key={`feed_itens_${_}`}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Animal {_ + 1}</th>
                                        <th>Usuário</th>
                                        <th>Resposta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feed.janelas.map((i, __) => {
                                        let resposta = ''
                                        let check = i.resposta === i.respostaCorreta

                                        resposta = <h6 className='text-secondary'>{i.janela.title}: {i.resposta}</h6>

                                        return <tr key={`feeds_${__}`}>
                                            <td>{resposta}</td>
                                            <td>
                                                {check ?
                                                    <i className="bi bi-check-circle-fill text-success" /> :
                                                    <i className="bi bi-x-circle-fill text-danger" />
                                                }
                                            </td>
                                            <td>
                                                {i.respostaCorreta}
                                            </td>
                                        </tr>
                                    }
                                    )}
                                    <tr>
                                        <td>Escore</td>
                                        <td>{feed.escore}</td>
                                        <td>{feed.escoreCorreto}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <hr />
                        </div>
                    )
                })}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" size='sm' onClick={() => {
                    if (props.onClose) props.onClose()
                    setShow(false)
                }} >
                    Voltar
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}