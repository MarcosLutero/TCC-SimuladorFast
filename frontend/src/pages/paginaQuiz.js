import React from "react";
import { Button, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/index.css";
import { Link } from "react-router-dom";
import { sortearAnimaisReq } from "../api/animal";
import ModalFeedback from "../components/modalFeedback";
import { cadastrarFeedbackReq } from "../api/feedback";
import {
	DEFAULT_HOTSPOTS,
	parseHotspotsConfig,
	resolverImagemBaseUrl,
} from "../constants/hotspots";

const JANELAS = DEFAULT_HOTSPOTS.map(({ title, className, janela }) => ({
	title,
	className,
	janela,
}));

const API_URL = process.env.REACT_APP_API_URL
const CAMINHO_ARQUIVOS = `${API_URL}/ws/images/`;

class PaginaQuiz extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedAnimal: 0,
			selectedArea: -1,
			tempo: 180,
			tempoOriginal: 180,
			timer: null,
			score: 0,
			animais: [],
			modalFeedback: false,
			feedbackEnviado: false
		};

	}

	timerId = null;
	feedbackEnviadoRef = false;
	cacheBust = Date.now();
	isMounted = false;

	pararTimer() {
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
		if (this.state.timer) {
			clearInterval(this.state.timer);
		}
	}

	lerAnimaisVistos() {
		try {
			const raw = window.sessionStorage.getItem("animaisVistos");
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

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

		this.setState({ tempo: config.tempo, tempoOriginal: config.tempo })

		const vistos = this.lerAnimaisVistos();
		sortearAnimaisReq(config.qtd, vistos)
		.then((animaisResp) => {
			if (!this.isMounted) return;
			const lista = Array.isArray(animaisResp) ? animaisResp : [];
			const animais = lista.filter((a, idx, arr) => arr.findIndex((x) => x.id === a.id) === idx);
			const novosIds = animais.map((a) => a.id).filter((id) => id != null);
			const houveReinicializacao = novosIds.some((id) => vistos.includes(id));
			const proximosVistos = houveReinicializacao
				? novosIds
				: [...new Set([...vistos, ...novosIds])];
			window.sessionStorage.setItem("animaisVistos", JSON.stringify(proximosVistos));
			this.setState({ animais });
		})
		.catch((err) => {
			console.log(err);
		});
	}

	componentDidMount() {
		this.isMounted = true;
		this.getAnimais();
		this.pararTimer();
		this.timerId = setInterval(() => {
			if (this.state.tempo > 0) {
				this.setState((state) => ({ tempo: state.tempo - 1 }));
			} else {
				this.abrirModalFeedback();
			}
		}, 1000);
		this.setState({ timer: this.timerId });
	}

	componentWillUnmount() {
		this.isMounted = false;
		this.pararTimer();
	}

	formatarTempo() {
		const minutes = Math.floor(this.state.tempo / 60);
		let seconds = this.state.tempo % 60;
		if (seconds < 10) {
			seconds = `0${seconds}`;
		}
		return `${minutes}:${seconds}`;
	}

	abrirModalFeedback(animaisOverride) {
		this.pararTimer();
		if (this.feedbackEnviadoRef) {
			return;
		}
		this.feedbackEnviadoRef = true;

		const { selectedAnimal, tempo, tempoOriginal } = this.state;
		const listaAnimais = [...(animaisOverride || this.state.animais)];
		if (listaAnimais[selectedAnimal] && listaAnimais[selectedAnimal].tempo == null) {
			const baseTempo = tempoOriginal ?? tempo;
			listaAnimais[selectedAnimal] = {
				...listaAnimais[selectedAnimal],
				tempo: Math.max(0, baseTempo - tempo),
			};
		}

		this.setState({ modalFeedback: true, feedbackEnviado: true, animais: listaAnimais });
		this.enviarFeedback(listaAnimais);
	}

	enviarFeedback(animaisLista = this.state.animais) {
		if (!animaisLista || animaisLista.length === 0) {
			return;
		}
		let usuario = sessionStorage.getItem("usuario")
		usuario = JSON.parse(usuario)
		let tempoTotal = 0
		let data = animaisLista.map(animal => {
			const tempoAnimal = animal.tempo ?? 0
			tempoTotal += tempoAnimal
			
			let escore = 0
			let escoreCorreto = animal.pontuacao
			const janelasData = JANELAS.map((janelaInfo, idx) => {
				const img = (animal.imgs || []).find((item) => item.janela === janelaInfo.janela) || (animal.imgs || [])[idx]
				let { temLiquido, clicked } = img || {}
				let janela = janelaInfo

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
				tempo: tempoAnimal,
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
									
									this.setState({ selectedAnimal, animais: tempAnimais, tempo: this.state.tempoOriginal, selectedArea: -1, janelaAberta: false })
								}}
							>
								Proximo
							</Button> : <div />}
						</div>
						{selectedAnimal + 1 === this.state.animais.length ? <Button
							disabled={this.state.feedbackEnviado}
							onClick={() => {
								let { animais: tempAnimais, tempo, tempoOriginal } = this.state
								if (tempAnimais[selectedAnimal]) {
									const baseTempo = tempoOriginal ?? tempo
									tempAnimais[selectedAnimal].tempo = Math.max(0, baseTempo - tempo)
								}
								this.abrirModalFeedback(tempAnimais)
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
							animal && this.state.selectedArea !== -1 && animal.imgs[selectedArea] ?
								<div className="text-light d-column text-center" style={{ top: 10 }}>
									<label >
										<strong>
											Tem liquido? {animal.imgs[selectedArea].clicked === undefined ? "(Clique na area para responder)" : !animal.imgs[selectedArea].clicked ? "Não" : "Sim"}
										</strong>
									</label>
									<br />
									<Image
										key={animal.imgs[selectedArea].caminho}
										alt="imagem"
										className="m-0 p-0 imagem-direita"
										style={{
											maxWidth: "440px",
											width: "auto",
											minHeight: "390px"
										}}
										src={`${CAMINHO_ARQUIVOS}${animal.imgs[selectedArea].caminho}?t=${this.cacheBust}`}
									/>
								</div>
								: <h4><strong>Procure as areas</strong></h4>}
					</div>
					<div className="col-6 lado-direito">

						<div className="imagem-container">
							<img
								src={resolverImagemBaseUrl(animal?.imagemBase, this.cacheBust)}
								alt="Imagem"
							/>
							{parseHotspotsConfig(animal?.hotspotsConfig).map((item) =>
								<div
									key={item.className}
									className={item.className}
									style={{
										top: `${item.top}%`,
										left: `${item.left}%`,
										width: `${item.size}%`,
									}}
									onMouseLeave={() => this.setState({ selectedArea: -1, janelaAberta: false })}
									onClick={() => {
										if(!this.state.janelaAberta || this.state.selectedArea !== item.janela) {
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
