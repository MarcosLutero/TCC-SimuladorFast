import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { atualizarAnimalReq, atualizarImagemAnimalReq, cadastrarAnimalReq, cadastrarImagemAnimalReq, deletarImagemAnimalReq, listarImagensAnimalReq } from '../api/animal';

const API_URL = process.env.REACT_APP_API_URL
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;
const DEFAULT_ANIMAL_DATA = { pontuacao: 0, tipo: "", isActive: true, lista_janelas: [] }
const DEFAULT_IMAGEM_DATA = { janela: '', temLiquido: false, file: {}, caminho: "" }


let TIPO_JANELAS = ["HD", "HR", "ER", "CC"]

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
                setImagens(resp["imgs"])
                let pontuacao = 0
                let lista_janelas = []
                resp["imgs"].map(img => {
                    if (!lista_janelas.includes(img.janela)) {
                        lista_janelas.push(img.janela)
                    }
                    if (img.temLiquido) {
                        pontuacao += 1
                    }
                    return ''
                })

                setAnimalData({ ...resp.data, lista_janelas, pontuacao })
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
                temLiquido: img.temLiquido,
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
                .then((resp) => {
                    if (props.onCreateEdit) props.onCreateEdit()
                    setOpenModalAnimal(false)
                })
                .catch((err) => {
                    console.log(err);
                });
            return
        }

        cadastrarAnimalReq(animalData)
            .then((resp) => {
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
                .then((resp) => {
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
            .then((resp) => {
                getImagens(props.animal.id)
                setOpenModalImagem(false)
                setOpenModalAnimal(true)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function deletarImagem() {
        deletarImagemAnimalReq(imgSelected.animal, imgSelected.id)
            .then(resp => {
                getImagens(imgSelected.animal)
                .then(subResp => {
                    closeModalConfirmar()
                })
                .catch(e => {
                    closeModalConfirmar()
                })
            })
            .catch(err => closeModalConfirmar())
    }

    const action = props.edit ? "Editar" : "Cadastrar"

    return <div>
        {props.iconButton ?
            <i
                className="bi-info-circle text-primary"
                onClick={onOpenModalAnimal}
                style={{ cursor: "pointer" }}
            /> :
            <Button
                onClick={onOpenModalAnimal}
                size='sm'
            >
                {action}
            </Button>
        }
        <Modal show={openModalAnimal} onHide={() => setOpenModalAnimal(false)}>
            <Modal.Header closeButton>
                <h3>{action} Animal {props.edit ? `#${props.animal.id}` : ""}</h3>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <div className='row'>
                        <div className="form-group col-6">
                            <label>Espécie de animal</label>
                            <input
                                className="form-control"
                                placeholder='Ex: Gato, Cachorro e etc'
                                onChange={(e) => {
                                    setAnimalData({ ...animalData, tipo: e.target.value, pontuacao: animalData.pontuacao })
                                }}
                                value={animalData.tipo}
                            />
                        </div>
                        <div className="form-group col-6">
                            <label>Status</label>
                            <select
                                className='form-control'
                                defaultValue={animalData.isActive}
                                onChange={(e) => setAnimalData({ ...animalData, isActive: e.target.value === "true" })}
                            >
                                <option value='true'>Ativo</option>
                                <option value='false'>Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className='d-flex flex-row-reverse'>
                        <Button
                            className='mt-2 float-right'
                            size='sm'
                            onClick={createUpdateAnimal}
                        >
                            {action}
                        </Button>
                    </div>

                    {props.edit ? <div>
                        <h5 className='mt-2'>
                            Imagens {'  '}
                            <button
                                disabled={imagens.length >= 4}
                                className='btn btn-sm btn-primary ml-1'
                                onClick={() => onOpenModalImagem()}
                            >
                                Novo
                            </button>
                        </h5>
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>Arquivo</th>
                                    <th>Janela</th>
                                    <th>Tem liquído?</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imagens.map((img, _) => <tr key={_}>
                                    <td>{img.caminho.substring(0, 16)} {img.caminho.length > 16 ? "..." : ""} </td>
                                    <td>{TIPO_JANELAS[img.janela]}</td>
                                    <td>{img.temLiquido ? "Sim" : "Não"}</td>
                                    <td>
                                        <div className='d-flex justify-content-around'>
                                            <i
                                                className="bi-info-circle text-success"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => onOpenModalImagem(img)}
                                            />
                                            <i
                                                className="bi-image text-success"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    let url = `${CAMINHO_ARQUIVOS}${img.caminho}`
                                                    window.open(url, "_blank")
                                                }}
                                            />
                                            <i
                                                className="bi-trash text-danger"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => openModalConfirmar(img)}
                                            />
                                        </div>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div> : <div />}

                </div>
            </Modal.Body>
        </Modal>
        <Modal
            show={openModalImagem}
            onHide={() => {
                setOpenModalImagem(false)
                setOpenModalAnimal(true)
            }}>
            <Modal.Header closeButton>
                <h3>{imgEdit ? "Editar" : 'Cadastrar'} Imagem {imgEdit ? `#${imgSelected.id}` : ""}</h3>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className="form-group col-6">
                        <label>Janela</label>
                        <select
                            className='form-control'
                            defaultValue={imagemData.janela}
                            disabled={imgEdit}
                            onChange={(e) => {
                                setImagemData({
                                    janela: e.target.value,
                                    temliquido: imagemData.temliquido
                                })
                            }}
                        >   <option value=''>Selecionar</option>
                            {["HD", "HR", "ER", "CC"].map((i, _) => {
                                if (imgEdit) {
                                    if (_ === imagemData.janela) {
                                        return <option value={_} selected={true}>{i}</option>
                                    }
                                }
                                let disabled = animalData.lista_janelas ? animalData.lista_janelas.includes(_) : true
                                if (disabled) {
                                    return <div></div>
                                }
                                return <option key={`areas_select_${_}`} value={_} selected={_}>{i}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group col-6">
                        <label>Tem Liquido?</label>
                        <select
                            className='form-control'
                            defaultValue={imagemData.temLiquido}
                            onChange={(e) => {
                                console.log("liquido", e.target.value === "true")
                                setImagemData({
                                    temLiquido: e.target.value === "true",
                                    janela: imagemData.janela
                                })
                            }}
                        >
                            <option value='false'>Não</option>
                            <option value='true'>Sim</option>
                        </select>
                    </div>
                    <div className="form-group col-12 mt-3">
                        <label>Imagem</label><br />

                        <small className='text-secondary'>Atual: {imgSelected.caminho}</small>
                        <input
                            /* disabled={imgEdit} */
                            className="form-control"
                            type='file'
                            onChange={(e) => {
                                setImagemData({
                                    file: e.target.files[0],
                                    janela: imagemData.janela,
                                    temLiquido: imagemData.temLiquido
                                })
                            }}
                        />
                    </div>
                </div>

                <div className='d-flex flex-row-reverse'>
                    <Button
                        className='mt-2 float-right'
                        size='sm'
                        disabled={imagemData.janela === ""}
                        onClick={createUpdateImagem}
                    >
                        {imgEdit ? "Editar" : 'Cadastrar'}
                    </Button>
                </div>

            </Modal.Body>
        </Modal>
        <Modal
            show={abrirModalConfirmar}
            onHide={closeModalConfirmar}
            size='lg'
        >
            <Modal.Header closeButton>

            </Modal.Header>
            <Modal.Body>
                <h4>Tem Certeza que deseja excluir essa imagem?</h4>
            </Modal.Body>
            <Modal.Footer>
                <div className='d-flex flex-row-reverse'>
                    <Button
                        className='mt-2 mr-2'
                        size='sm'
                        variant='primary'
                        onClick={closeModalConfirmar}
                    >
                        Voltar
                    </Button>
                    <Button
                        className='mt-2  float-right'
                        size='sm'
                        variant='danger'
                        onClick={deletarImagem}
                    >
                        Deletar
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    </div>
} 