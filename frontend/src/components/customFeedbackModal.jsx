import React from "react"
import { Badge, Button, Card, Modal, Table } from "react-bootstrap"

export default function CustomFeedbackModal(props) {
    const [show, setShow] = React.useState(false)
    const feeds = Array.isArray(props.feeds) ? props.feeds : []
    const fechar = () => {
        if (props.onClose) props.onClose()
        setShow(false)
    }

    return (
        <>
            <Button
                size="sm"
                variant="outline-primary"
                style={{ fontFamily: "inherit" }}
                onClick={() => setShow(true)}
            >
                Ver Feedback
            </Button>
            <Modal show={show} size="lg" centered onHide={fechar}>
                <Modal.Header closeButton>
                    <h5 className="mb-0 fw-semibold">Detalhes do Feedback</h5>
                </Modal.Header>
                <Modal.Body>
                    {feeds.length === 0 ? (
                        <p className="text-center text-muted mb-0">Nenhum detalhe disponível para este feedback.</p>
                    ) : feeds.map((feed, idx) => (
                        <Card className="mb-3 shadow-sm" key={`feed_itens_${idx}`}>
                            <Card.Header className="d-flex justify-content-between align-items-center bg-white py-2">
                                <strong>Animal {idx + 1}</strong>
                                <Badge bg={feed.escore === feed.escoreCorreto ? "success" : "warning"}>
                                    Escore: {feed.escore} / Gabarito: {feed.escoreCorreto}
                                </Badge>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive striped hover size="sm" className="mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th>Janela</th>
                                            <th>Resposta do Aluno</th>
                                            <th className="text-center">Resultado</th>
                                            <th>Gabarito</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(feed.janelas || []).map((item, jIdx) => {
                                            const acertou = item.resposta === item.respostaCorreta
                                            return (
                                                <tr key={`feeds_${jIdx}`}>
                                                    <td>
                                                        <Badge bg="dark">{item.janela?.title}</Badge>
                                                    </td>
                                                    <td>{item.resposta}</td>
                                                    <td className="text-center">
                                                        {acertou ? (
                                                            <i className="bi bi-check-circle-fill text-success" />
                                                        ) : (
                                                            <i className="bi bi-x-circle-fill text-danger" />
                                                        )}
                                                    </td>
                                                    <td>{item.respostaCorreta}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" style={{ fontFamily: "inherit" }} onClick={fechar}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
