import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import axios from 'axios';

const API_URL = "http://localhost:8080"
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;
const DEFAULT_DATA = { janela: "", temLiquido: null }

export default function ModalImagem(props) {

    const [openModalAnimal, setOpenModalAnimal] = React.useState(false)
    const [data, setData] = React.useState(DEFAULT_DATA)  
    
    function onOpenModalImagem() {
        if (props.onOpen) props.onOpen()
        
        let temp = DEFAULT_DATA
        if (props.edit) {
            temp = {
                janela: props.img.janela,
                temLiquido: props.img.temLiquido
            } 
        }
        setData(temp)
        setOpenModalAnimal(true)
    }

    function createUpdateAnimal() {
        let url = `${API_URL}/animal/${props.img.animal_id}/imagens/`
        if (props.edit) {
            url += props.img.id
            axios.put(url, data)
                .then((resp) => {
                    setOpenModalAnimal(false)
                    if (props.onCreateEdit) props.onCreateEdit()
                })
                .catch((err) => {
                    console.log(err);
                });


            return
        }

        axios.post(url, data)
            .then((resp) => {
                if (props.onCreateEdit) props.onCreateEdit()
                setOpenModalAnimal(false)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const action = props.edit ? "Editar" : "Cadastrar"

    return <div>
        {props.iconButton ?
            <i
                class="bi-info-circle text-primary"
                onClick={onOpenModalImagem}
                style={{ cursor: "pointer" }}
            /> :
            <Button
                onClick={onOpenModalImagem}
                size='sm'
            >
                {action}
            </Button>
        }
        <Modal show={openModalAnimal} onHide={() => setOpenModalAnimal(false)}>
            <Modal.Header closeButton>
                <h3>{action} Imagem {props.edit ? `#${props.img.id}` : ""}</h3>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div class="form-group col-lg-6 col-sm-12">
                        <label>Janela</label>
                        <input
                            className="form-control"
                            type="number"
                            onChange={(e) => {
                                let janela = e.target.value
                                if (janela < 0 || janela > 4) return
                                setData({ janela, temliquido: data.temliquido })
                            }}
                            value={data["tipo"]}
                        />
                    </div>
                    <div class="form-group col-lg-6 col-sm-12">
                        <label>Tem Liquido?</label>
                        <input
                            className="form-control"
                            type='checkbox'
                            onChange={(e) => { 
                                setData({ temLiquido: !data.temliquido, janela: data.janela })
                            }}
                            value={data.temLiquido}
                        />
                    </div>
                    <div class="form-group col-lg-12">
                        <label>Imagem</label>
                        <input
                            className="form-control"
                            type='file'
                            onChange={(e) => { 
                                console.log(e.target.value)
                                setData({ 
                                    file: e.target.value,
                                    janela: data.janela,
                                    temLiquido: data.temLiquido
                                 })
                            }}
                            value={data.temLiquido}
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

            </Modal.Body>
        </Modal>
    </div>
} 