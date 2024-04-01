import React from "react";
import { Button, Image } from "react-bootstrap";
import doguinio from "../img/doggo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import { sortearAnimaisReq } from "../api/animal";
import ModalFeedback from "../components/modalFeedback";
import { cadastrarFeedbackReq } from "../api/feedback";

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

const API_URL = process.env.REACT_APP_API_URL
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;

class PaginaQuiz extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedAnimal: 0,
			selectedArea: -1,
			perfil: doguinio,
			tempo: 180,
			timer: null,
			score: 0,
			animais: [],
			modalFeedback: false
		};

	}

	flag = false;

	getAnimais() {
		let config = window.sessionStorage.getItem("config")
		if (!config) {
			config = {
				tempo: 180,
				qtd: 1
			}
		} else {
			config = JSON.parse(config)
			config.tempo = config.tempo * 60
		}

		this.setState({ tempo: config.tempo })

		sortearAnimaisReq(config.qtd)
		.then((animais) => {
			this.setState({ animais });
		})
		.catch((err) => {
			console.log(err);
		});
	}

	componentDidMount() {
		this.getAnimais();
		if (!this.flag)
			this.setState({
				tempoOriginal: this.state.tempo,
				timer: setInterval(() => {
					if (this.state.tempo > 0) {
						this.setState((state) => ({ tempo: state.tempo - 1 }));
					} else {
						this.abrirModalFeedback()
					}
				}, 1000),
			});
		this.flag = true;
	}

	componentWillUnmount() {
		if (this.state.timer) {
			clearInterval(this.state.timer);
		}
	}

	formatarTempo() {
		const minutes = Math.floor(this.state.tempo / 60);
		let seconds = this.state.tempo % 60;
		if (seconds < 10) {
			seconds = `0${seconds}`;
		}
		return `${minutes}:${seconds}`;
	}

	abrirModalFeedback() {
		this.setState({ modalFeedback: true })
		this.enviarFeedback()
	}

	enviarFeedback() {
		let usuario = sessionStorage.getItem("usuario")
		usuario = JSON.parse(usuario)
		let tempoTotal = 0
		let data = this.state.animais.map(animal => {
			tempoTotal += animal.tempo
			
			let escore = 0
			let escoreCorreto = animal.pontuacao
			const janelasData = [0,1,2,3].map(_ => {
				let {temLiquido, clicked} = animal.imgs[_]
				let janela = JANELAS[_]

				let resposta = ""
				const respostaCorreta = temLiquido? "Tem líquido": "Não tem líquido" 
				if (clicked === undefined) {
					resposta = "Sem resposta"
				} else {
					resposta = clicked? "Tem líquido": "Não tem líquido" 
					escore = clicked? escore + 1: escore
				}

				return ({
					janela, resposta, respostaCorreta
				})
			})

			return ({
				idAnimal: animal.id,
				tempo: animal.tempo,
				escore,
				escoreCorreto,
				janelas: janelasData
			})
		})

		let body = {usuario, tempoTotal, data:JSON.stringify(data)}

		cadastrarFeedbackReq(body)
		.then(resp => {
			console.log(resp)
		})
		.catch(e => {
			console.log("erro ao criar feedback")
		})
	}

	render() {
		const { selectedAnimal, selectedArea } = this.state;
		let animal = this.state.animais[selectedAnimal];
		if (animal && !animal.pontuacaoSugerida) {
			animal.pontuacaoSugerida = 0
		}
		return (
			<div className="text-light" style={{ backgroundColor: "black", height: "100vh" }} >
				<div className='col-12 pt-3 d-flex justify-content-between'>
					<div>
						<Link to={"/"} className='btn btn-primary btn-sm'>Voltar</Link>
					</div>
					<div className="">
						<h1 className="titulo">
							Simulador de Exame A-FAST
						</h1>
					</div>
					<div />
				</div>
				<div className="row col-12">
					<div className="col-lg-6 mt-1 text-center">
						Tempo:{this.formatarTempo()} /
						Escore: {animal && animal.pontuacaoSugerida ? animal.pontuacaoSugerida : 0}
					</div>
					<div className="col-lg-6 my-1 d-flex justify-content-around">
						<div className="d-flex justify-content-center" >
							<small className="mt-2">
								{selectedAnimal + 1}/{this.state.animais.length}
							</small>
							{selectedAnimal < this.state.animais.length - 1 ? <Button
								onClick={() => {
									let { selectedAnimal, animais:tempAnimais, tempo } = this.state
									tempAnimais[selectedAnimal].tempo = this.state.tempoOriginal - tempo
									selectedAnimal += 1
									
									this.setState({ selectedAnimal, animais: tempAnimais, tempo: this.state.tempoOriginal })
								}}
							>
								Proximo
							</Button> : <div />}
						</div>
						{selectedAnimal + 1 === this.state.animais.length ? <Button
							onClick={() => {
								let { animais:tempAnimais, tempo } = this.state
								tempAnimais[selectedAnimal].tempo = this.state.tempoOriginal - tempo
								this.setState({ modalFeedback: true, animais: tempAnimais })
								this.abrirModalFeedback()
							}}
						>
							Enviar
							<FontAwesomeIcon icon={faChevronRight} />
						</Button> : <div />}
					</div>

				</div>
				<div className="div-geral">
					<div className="col-6 d-flex justify-content-around lado-esquerdo">
						{
							animal && this.state.selectedArea !== -1 ?
								<div class="text-light d-column text-center" style={{ top: 10 }}>
									<label >
										<strong>
											Tem liquido? {animal.imgs[selectedArea].clicked === undefined ? "(Clique na area para responder)" : !animal.imgs[selectedArea].clicked ? "Não" : "Sim"}
										</strong>
									</label>
									<br />
									<Image
										alt="imagem"
										className="m-0 p-0 imagem-direita"
										style={{
											maxWidth: "440px",
											width: "auto",
											minHeight: "390px"
										}}
										src={`${CAMINHO_ARQUIVOS}${animal.imgs[selectedArea].caminho}`}
									/>
								</div>
								: <h4><strong>Procure as areas</strong></h4>}
					</div>
					<div className="col-6 lado-direito">

						<div class="imagem-container">
							<img src={doguinio} alt="Imagem" style={{height: '85vh'}} />
							{JANELAS.map((item, _) =>
								<div
									className={item.className}
									onMouseLeave={() => this.setState({ selectedArea: -1, janelaAberta: false })}
									onClick={() => {
										if(!this.state.janelaAberta) {
											this.setState({ selectedArea: item.janela, janelaAberta: true })
											return
										}
										let animaisTemp = this.state.animais;
										let temp = animal
										temp.imgs[selectedArea].clicked = !temp.imgs[selectedArea].clicked

										let score = temp.pontuacaoSugerida
										if (temp.imgs[selectedArea].clicked) {
											score += 1
										} else {
											score -= 1
										}
										animaisTemp[this.state.selectedAnimal].pontuacaoSugerida = score
										animaisTemp[this.state.selectedAnimal] = temp
										this.setState({ animais: animaisTemp })
									}}
								>
									{item.title}
								</div>
							)}
						</div>
					</div>
				</div>
				<ModalFeedback show={this.state.modalFeedback} animais={this.state.animais}/> 
			</div >
		);
	}
}

export default PaginaQuiz;
