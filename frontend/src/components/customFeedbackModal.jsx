import React from "react"
import { Button, Modal } from "react-bootstrap"

export default function CustomFeedbackModal(props) {
    const [show, setShow] = React.useState(false)
    const feeds = Array.isArray(props.feeds) ? props.feeds : []
    return <div>
        <Button size="sm" variant="outline-primary" style={{ fontFamily: "inherit" }} onClick={() => {
            setShow(true)
        }}>Ver Feedback</Button>
        <Modal show={show} size="lg" onHide={() => {
            if (props.onClose) props.onClose()
            setShow(false)
        }}>
            <Modal.Header closeButton><h4 className="mb-0">Detalhes do Feedback</h4></Modal.Header>
            <Modal.Body>
                {feeds.length === 0 ? (
                    <p className="text-center text-muted mb-0">Nenhum detalhe disponível para este feedback.</p>
                ) : feeds.map((feed, _) => {
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
                <Button variant="secondary" size='sm' style={{ fontFamily: "inherit" }} onClick={() => {
                    if (props.onClose) props.onClose()
                    setShow(false)
                }} >
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}