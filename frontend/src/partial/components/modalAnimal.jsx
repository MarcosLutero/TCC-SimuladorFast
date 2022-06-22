import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import axios from 'axios';

const API_URL = "http://localhost:8080"
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;
const DEFAULT_ANIMAL_DATA = { pontuacao: 0, tipo: "" }
const DEFAULT_IMAGEM_DATA = { janela: "", temLiquido: false, file: {}, caminho: "" }

export default function ModalAnimal(props) {

    const [openModalAnimal, setOpenModalAnimal] = React.useState(false)
    const [openModalImagem, setOpenModalImagem] = React.useState(false)
    const [animalData, setAnimalData] = React.useState(DEFAULT_ANIMAL_DATA)
    const [imagemData, setImagemData] = React.useState(DEFAULT_IMAGEM_DATA)
    const [imagens, setImagens] = React.useState([])
    const [imgSelected, setImgSelected] = React.useState({})
    const [imgEdit, setImgEdit] = React.useState(false)

    function getImagens(idAnimal) {
        let url = `${API_URL}/animal/imagens/${idAnimal}`
        axios.get(url)
            .then(resp => setImagens(resp.data["imgs"]))
            .catch(err => console.log(err))
    }

    function onOpenModalAnimal() {
        let temp = DEFAULT_ANIMAL_DATA
        if (props.edit) {
            temp = {
                tipo: props.animal.tipo,
                pontuacao: props.animal.pontuacao
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

    function createUpdateAnimal() {
        let url = `${API_URL}/animais/`
        if (props.edit) {
            url += props.animal.id
            axios.put(url, animalData)
                .then((resp) => {
                    if (props.onCreateEdit) props.onCreateEdit()
                    setOpenModalAnimal(false)
                })
                .catch((err) => {
                    console.log(err);
                });


            return
        }

        axios.post(url, animalData)
            .then((resp) => {
                if (props.onCreateEdit) props.onCreateEdit()
                setOpenModalAnimal(false)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function createUpdateImagem() {
        let url = `${API_URL}/animal/${props.animal.id}/imagens/`
        let headers = {
            "content-type": "application/json"
        }

        const formData = new FormData();
        formData.append("imagem", {
            janela: imagemData.janela,
            temLiquido: imagemData.temLiquido
        }); 
        formData.append("file", imagemData.file);

        if (imgEdit) {
            url += imgSelected.id
            axios.put(url, formData, { headers })
                .then((resp) => {
                    getImagens(props.animal.id)
                    setOpenModalImagem(true)
                    setOpenModalAnimal(false)
                })
                .catch((err) => {
                    console.log(err);
                });


            return
        }
        
        

        axios.post(url, formData , { headers })
            .then((resp) => {
                getImagens(props.animal.id)
                setOpenModalImagem(false)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function deletarImagem(img) {
        let url = `${API_URL}/animal/${img.animal}/imagens/${img.id}`
        axios.delete(url)
        .then(resp => {
            getImagens(img.animal) 
        })
        .catch(err => console.log(err))
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
                            <label>Tipo de animal</label>
                            <input
                                className="form-control"
                                onChange={(e) => {
                                    setAnimalData({ tipo: e.target.value, pontuacao: animalData.pontuacao })
                                }}
                                value={animalData["tipo"]}
                            />
                        </div>
                        <div className="form-group col-6">
                            <label>Pontuação</label>
                            <input
                                className="form-control"
                                type='number'
                                onChange={(e) => {
                                    let pontuacao = e.target.value
                                    if (pontuacao < 0 || pontuacao > 4) return
                                    setAnimalData({ pontuacao, tipo: animalData.tipo })
                                }}
                                value={animalData.pontuacao}
                            />
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
                                    <td>{img.caminho.substring(0,16)} {img.caminho.length > 16? "...": ""} </td>
                                    <td>{img.janela}</td>
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
                                                onClick={() => deletarImagem(img)}
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
                        <input
                            className="form-control"
                            type="number"
                            onChange={(e) => {
                                let janela = e.target.value
                                if (janela < 0 || janela > 4) return
                                setImagemData({ janela, temliquido: imagemData.temliquido })
                            }}
                            value={imagemData.janela}
                        />
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
                        onClick={createUpdateImagem}
                    >
                        {imgEdit ? "Editar" : 'Cadastrar'}
                    </Button>
                </div>

            </Modal.Body>
        </Modal>
    </div>
} 