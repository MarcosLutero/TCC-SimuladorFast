import React from "react"
import { Button, Modal } from "react-bootstrap"

const JANELAS = [
	{
		title: "HD",
		className: "hd",
		janela: 0
	},
	{
		title: "ER",
		className: "er",
		janela: 1
	},
	{
		title: "CC",
		className: "cc",
		janela: 2
	},
	{
		title: "HR",
		className: "hr",
		janela: 3
	},
]

export default function ModalFeedback(props) {
    const {animais} = props
    return <Modal show={props.show}>
    <Modal.Header><h3>Feedback</h3></Modal.Header>
    <Modal.Body>
        {animais.map((a, _) => {
            return (
                <div className="mb-2">
                    <table className="table table-striped">
                        <thead>
                            <th>Animal {_ + 1}</th>
                            <th>Usuário</th>
                            <th>Resposta</th>
                        </thead>
                        <tbody>
                            {[0, 1, 2, 3].map(i => {
                                let resposta = ''
                                let check = false
                                let {clicked, temLiquido} = a.imgs[i]
                                let {title} = JANELAS[i]

                                if (clicked === undefined) {
                                    resposta = <h6 className='text-secondary'>{title}: Sem resposta</h6>
                                } else {
                                    resposta = <h6>{title}: {clicked? "": "Não"} Tem líquido</h6>
                                    console.log("tem liquido",title, clicked, temLiquido, typeof(temLiquido))
                                    check = Boolean(clicked) === temLiquido
                                }

                                return <tr>
                                    <td>{resposta}</td>
                                    <td>
                                        {check ?
                                            <i className="bi bi-check-circle-fill text-success" /> :
                                            <i className="bi bi-x-circle-fill text-danger" />
                                        }
                                    </td>
                                    <td>
                                        {temLiquido ? "Tem Líquido" : "Não tem Líquido"}
                                    </td>
                                </tr>
                            }
                            )}
                            <tr>
                                <td>Escore</td>
                                <td>{a.pontuacaoSugerida || 0}</td>
                                <td>{a ? a.pontuacao : 0}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                </div>
            )
        })}

    </Modal.Body>
    <Modal.Footer>
        <Button variant="danger" size='sm' onClick={() => window.location.href = '/'} >Voltar a Página Inicial</Button>
        <Button onClick={() => window.location.reload()} size='sm' >Tentar novamente</Button>
    </Modal.Footer>
</Modal>
}