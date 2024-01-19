import React from "react";
import { Button, Card, Col, Container, Image, Modal, Row } from "react-bootstrap";
import doguinio from "../img/doguineo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import axios from "axios";

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

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
				qtd:1
			}
		} else {
			config = JSON.parse(config)
			config.tempo = config.tempo * 60
		}
		
		this.setState({tempo: config.tempo})

		axios
			.get(`${API_URL}/sortear-animais/${config.qtd}`)
			.then(({ data }) => {
				this.setState({ animais: data });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	componentDidMount() {
		this.getAnimais();
		if (!this.flag)
			this.setState({
				timer: setInterval(() => {
					if (this.state.tempo > 0) {
						this.setState((state) => ({ tempo: state.tempo - 1 }));
					} else {
						this.darFeedback()
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

	darFeedback() {
		this.setState({ modalFeedback: true })
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
						Score: {animal && animal.pontuacaoSugerida ? animal.pontuacaoSugerida : 0}
					</div>
					<div className="col-lg-6 my-1 d-flex justify-content-around">
						<div className="d-flex justify-content-center" >
							{selectedAnimal > 0 ? <Button
								onClick={() => {
									let { selectedAnimal } = this.state
									selectedAnimal -= 1
									this.setState({ selectedAnimal })
								}}
							>
								Anterior
							</Button> : <div />}
							<small className="mt-2">
								{selectedAnimal + 1}/{this.state.animais.length}
							</small>
							{selectedAnimal < this.state.animais.length - 1 ? <Button
								onClick={() => {
									let { selectedAnimal } = this.state
									selectedAnimal += 1
									this.setState({ selectedAnimal })
								}}
							>
								Proximo
							</Button> : <div />}
						</div>
						{selectedAnimal + 1 == this.state.animais.length ? <Button
							onClick={() => this.setState({ modalFeedback: true })}
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
											Tem liquido? {animal.imgs[selectedArea].clicked == undefined ? "(Pressione o botão esquerdo do mouse para responder)" : !animal.imgs[selectedArea].clicked ? "Não" : "Sim"}
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
								: "Procure as areas"}
					</div>
					<div className="col-6 lado-direito">

						<div class="imagem-container">
							<img src={doguinio} alt="Imagem" />
							{JANELAS.map((item, _) =>
								<div
									title={item.title}
									className={item.className}
									onMouseOver={() => this.setState({ selectedArea: item.janela })}
									onMouseLeave={() => this.setState({ selectedArea: -1 })}
									onClick={() => {
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
				<Modal show={this.state.modalFeedback}>
					<Modal.Header>Feedback</Modal.Header>
					<Modal.Body>
						{this.state.animais.map((a, _) => {
							return (
								<div className="mb-2">
									<h4>Animal {_ + 1}</h4>
									{[0, 1, 2, 3].map(i => {
										let resposta = ''
										let check = false
										if (a.imgs[i].clicked == true) {
											resposta = <h6>{JANELAS[i].title}: Tem líquido</h6>
											check = Boolean(a.imgs[i].clicked) == a.imgs[i].temLiquido
										} else if (a.imgs[i].clicked == false) {
											resposta = <h6>{JANELAS[i].title}: Não tem líquido</h6>
											check = Boolean(a.imgs[i].clicked) == a.imgs[i].temLiquido
										} else if (a.imgs[i].clicked == null) {
											resposta = <h6 className='text-secondary'>{JANELAS[i].title}: Sem resposta</h6>
										}
										return <div className="d-flex justify-content-between" key={i}>
											{resposta}
											<h6>{check ?
												<i className="bi bi-check-circle-fill text-success" /> :
												<i className="bi bi-x-circle-fill text-danger" />
											}
											</h6>
										</div>
									}
									)}
									<h5 className='pt-1'>Score: {a.pontuacaoSugerida || 0}</h5>
									<h5>Score Esperado: {a ? a.pontuacao : 0}</h5>
								</div>
							)
						})}

					</Modal.Body>
					<Modal.Footer>
						<Button variant="danger" size='sm' onClick={() => window.location.href = '/'} >Voltar a Página Inicial</Button>
						<Button onClick={() => window.location.reload()} size='sm' >Tentar novamente</Button>
					</Modal.Footer>
				</Modal>
			</div >
		);
	}
}

export default PaginaQuiz;
