import React from 'react'
import { Badge, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import { atualizarAnimalReq, atualizarImagemAnimalReq, cadastrarAnimalReq, cadastrarImagemAnimalReq, deletarImagemAnimalReq, listarImagensAnimalReq } from '../api/animal';

const API_URL = process.env.REACT_APP_API_URL
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;
const DEFAULT_ANIMAL_DATA = { pontuacao: 0, tipo: "", isActive: true, lista_janelas: [] }
const DEFAULT_IMAGEM_DATA = { janela: '', temLiquido: false, file: {}, caminho: "" }

const TIPO_JANELAS = ["HD", "HR", "ER", "CC"]

export default function ModalAnimal(props) {

    const [openModalAnimal, setOpenModalAnimal] = React.useState(false)
    const [openModalImagem, setOpenModalImagem] = React.useState(false)
    const [abrirModalConfirmar, setAbrirModalConfirmar] = React.useState(false)
    const [animalData, setAnimalData] = React.useState(DEFAULT_ANIMAL_DATA)
    const [imagemData, setImagemData] = React.useState(DEFAULT_IMAGEM_DATA)
    const [imagens, setImagens] = React.useState([])
    const [imgSelected, setImgSelected] = React.useState({})
    const [imgEdit, setImgEdit] = React.useState(false)

    function getImagens(idAnimal) {
        listarImagensAnimalReq(idAnimal)
            .then(resp => {
                setImagens(resp["imgs"] || [])
                let pontuacao = 0
                let lista_janelas = []
                ;(resp["imgs"] || []).forEach(img => {
                    if (!lista_janelas.includes(img.janela)) {
                        lista_janelas.push(img.janela)
                    }
                    if (img.temLiquido) {
                        pontuacao += 1
                    }
                })

                setAnimalData(prev => ({ ...prev, ...(resp.data || {}), lista_janelas, pontuacao }))
            })
            .catch(err => console.log(err))
    }

    function onOpenModalAnimal() {
        let temp = DEFAULT_ANIMAL_DATA
        if (props.edit) {
            temp = {
                tipo: props.animal.tipo,
                isActive: props.animal.isActive
            }
            getImagens(props.animal.id)
        }
        setAnimalData(temp)
        setOpenModalAnimal(true)
    }

    function onOpenModalImagem(img = false) {
        if (img) {
            setImgSelected(img)
            setImagemData({
                janela: img.janela,
                temLiquido: Boolean(img.temLiquido),
                caminho: img.caminho,
                file: {}
            })
            setImgEdit(true)
        } else {
            setImgSelected({})
            setImagemData(DEFAULT_IMAGEM_DATA)
            setImgEdit(false)
        }
        setOpenModalAnimal(false)
        setOpenModalImagem(true)
    }

    function openModalConfirmar(img) {
        setImgSelected(img)
        setOpenModalAnimal(false)
        setAbrirModalConfirmar(true)
    }

    function closeModalConfirmar() {
        setImgSelected({})
        setOpenModalAnimal(true)
        setAbrirModalConfirmar(false)
    }

    function createUpdateAnimal() {
        if (props.edit) {
            atualizarAnimalReq(props.animal.id, animalData)
                .then(() => {
                    if (props.onCreateEdit) props.onCreateEdit()
                    setOpenModalAnimal(false)
                })
                .catch((err) => {
                    console.log(err);
                });
            return
        }

        cadastrarAnimalReq(animalData)
            .then(() => {
                if (props.onCreateEdit) props.onCreateEdit()
                setOpenModalAnimal(false)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function createUpdateImagem() {
        const formData = new FormData();
        formData.append("janela", imagemData.janela)
        formData.append("temLiquido", imagemData.temLiquido || false)
        formData.append("file", imagemData.file);
        if (imgEdit) {
            atualizarImagemAnimalReq(props.animal.id, imgSelected.id, formData)
                .then(() => {
                    getImagens(props.animal.id)
                    setOpenModalImagem(false)
                    setOpenModalAnimal(true)
                    if (props.onCreateEdit) {
                        props.onCreateEdit()
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
            return
        }
        cadastrarImagemAnimalReq(props.animal.id, formData)
            .then(() => {
                getImagens(props.animal.id)
                setOpenModalImagem(false)
                setOpenModalAnimal(true)
                if (props.onCreateEdit) {
                    props.onCreateEdit()
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function deletarImagem() {
        deletarImagemAnimalReq(imgSelected.animal, imgSelected.id)
            .then(() => {
                getImagens(imgSelected.animal)
                if (props.onCreateEdit) {
                    props.onCreateEdit()
                }
                closeModalConfirmar()
            })
            .catch(() => closeModalConfirmar())
    }

    const action = props.edit ? "Editar" : "Cadastrar"

    return (
        <>
            {props.iconButton ? (
                <i
                    className="bi-pencil-square text-primary"
                    title="Editar animal e imagens"
                    onClick={onOpenModalAnimal}
                    style={{ cursor: "pointer" }}
                />
            ) : (
                <Button
                    onClick={onOpenModalAnimal}
                    size="sm"
                    variant={props.variant || "primary"}
                    style={{ fontFamily: "inherit" }}
                >
                    <i className="bi bi-plus-lg me-1" />
                    {props.buttonLabel || action}
                </Button>
            )}

            {/* Modal Animal */}
            <Modal show={openModalAnimal} onHide={() => setOpenModalAnimal(false)} size={props.edit ? "lg" : undefined} centered>
                <Modal.Header closeButton>
                    <h5 className="mb-0 fw-semibold">
                        {action} Animal {props.edit ? `#${props.animal.id}` : ""}
                    </h5>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3 align-items-end">
                        <Col xs={12} sm={6}>
                            <Form.Label className="mb-1 small">Espécie de animal</Form.Label>
                            <Form.Control
                                size="sm"
                                placeholder="Ex: Gato, Cachorro..."
                                onChange={(e) => {
                                    setAnimalData({ ...animalData, tipo: e.target.value, pontuacao: animalData.pontuacao })
                                }}
                                value={animalData.tipo || ""}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Label className="mb-1 small">Status</Form.Label>
                            <Form.Select
                                size="sm"
                                value={String(Boolean(animalData.isActive))}
                                onChange={(e) => setAnimalData({ ...animalData, isActive: e.target.value === "true" })}
                            >
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontFamily: "inherit" }}
                            onClick={() => setOpenModalAnimal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            style={{ fontFamily: "inherit" }}
                            onClick={createUpdateAnimal}
                        >
                            {props.edit ? "Salvar Alterações" : "Cadastrar"}
                        </Button>
                    </div>

                    {props.edit && (
                        <Card className="mt-4 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-white py-2">
                                <strong>Imagens das Janelas A-FAST ({imagens.length}/4)</strong>
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    disabled={imagens.length >= 4}
                                    style={{ fontFamily: "inherit" }}
                                    onClick={() => onOpenModalImagem()}
                                >
                                    <i className="bi bi-plus-lg me-1" /> Nova Imagem
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {imagens.length === 0 ? (
                                    <p className="text-center text-muted py-3 mb-0 small">
                                        Nenhuma imagem cadastrada para este animal.
                                    </p>
                                ) : (
                                    <Table responsive striped hover size="sm" className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Arquivo</th>
                                                <th className="text-center">Janela</th>
                                                <th className="text-center">Tem líquido?</th>
                                                <th className="text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {imagens.map((img, idx) => (
                                                <tr key={img.id || idx}>
                                                    <td className="small text-muted">
                                                        {img.caminho?.substring(0, 24)}
                                                        {img.caminho && img.caminho.length > 24 ? "..." : ""}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg="dark">{TIPO_JANELAS[img.janela] || img.janela}</Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={img.temLiquido ? "danger" : "success"}>
                                                            {img.temLiquido ? "Sim" : "Não"}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-3">
                                                            <i
                                                                className="bi-pencil-square text-primary"
                                                                title="Editar imagem"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => onOpenModalImagem(img)}
                                                            />
                                                            <i
                                                                className="bi-image text-success"
                                                                title="Visualizar imagem"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => {
                                                                    const url = img.caminho?.startsWith("http")
                                                                        ? img.caminho
                                                                        : `${CAMINHO_ARQUIVOS}${img.caminho}?t=${Date.now()}`
                                                                    window.open(url, "_blank")
                                                                }}
                                                            />
                                                            <i
                                                                className="bi-trash text-danger"
                                                                title="Excluir imagem"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => openModalConfirmar(img)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
            </Modal>

            {/* Modal Imagem */}
            <Modal
                show={openModalImagem}
                centered
                onHide={() => {
                    setOpenModalImagem(false)
                    setOpenModalAnimal(true)
                }}
            >
                <Modal.Header closeButton>
                    <h5 className="mb-0 fw-semibold">
                        {imgEdit ? "Editar" : "Cadastrar"} Imagem {imgEdit ? `#${imgSelected.id}` : ""}
                    </h5>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12} sm={6}>
                            <Form.Label className="mb-1 small">Janela</Form.Label>
                            <Form.Select
                                size="sm"
                                value={String(imagemData.janela ?? "")}
                                disabled={imgEdit}
                                onChange={(e) => {
                                    setImagemData({
                                        ...imagemData,
                                        janela: e.target.value,
                                    })
                                }}
                            >
                                <option value="">Selecionar</option>
                                {TIPO_JANELAS.map((sigla, idx) => {
                                    if (imgEdit) {
                                        if (idx === Number(imagemData.janela)) {
                                            return <option key={`areas_select_${idx}`} value={idx}>{sigla}</option>
                                        }
                                        return null
                                    }
                                    const jaCadastrada = animalData.lista_janelas ? animalData.lista_janelas.includes(idx) : false
                                    if (jaCadastrada) {
                                        return null
                                    }
                                    return <option key={`areas_select_${idx}`} value={idx}>{sigla}</option>
                                })}
                            </Form.Select>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Label className="mb-1 small">Tem líquido?</Form.Label>
                            <Form.Select
                                size="sm"
                                value={String(Boolean(imagemData.temLiquido))}
                                onChange={(e) => {
                                    setImagemData({
                                        ...imagemData,
                                        temLiquido: e.target.value === "true",
                                    })
                                }}
                            >
                                <option value="false">Não</option>
                                <option value="true">Sim</option>
                            </Form.Select>
                        </Col>
                        <Col xs={12}>
                            <Form.Label className="mb-1 small">Arquivo da imagem</Form.Label>
                            {imgSelected.caminho && (
                                <div className="mb-1">
                                    <small className="text-muted">Atual: {imgSelected.caminho}</small>
                                </div>
                            )}
                            <Form.Control
                                size="sm"
                                type="file"
                                onChange={(e) => {
                                    setImagemData({
                                        ...imagemData,
                                        file: e.target.files[0],
                                    })
                                }}
                            />
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontFamily: "inherit" }}
                            onClick={() => {
                                setOpenModalImagem(false)
                                setOpenModalAnimal(true)
                            }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            style={{ fontFamily: "inherit" }}
                            disabled={imagemData.janela === "" || imagemData.janela === null || imagemData.janela === undefined}
                            onClick={createUpdateImagem}
                        >
                            {imgEdit ? "Salvar Alterações" : "Cadastrar"}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Modal Confirmar Exclusão */}
            <Modal
                show={abrirModalConfirmar}
                onHide={closeModalConfirmar}
                centered
            >
                <Modal.Header closeButton>
                    <h5 className="mb-0 fw-semibold">Confirmar exclusão</h5>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">Tem certeza que deseja excluir esta imagem?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        style={{ fontFamily: "inherit" }}
                        onClick={closeModalConfirmar}
                    >
                        Voltar
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        style={{ fontFamily: "inherit" }}
                        onClick={deletarImagem}
                    >
                        Excluir
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
