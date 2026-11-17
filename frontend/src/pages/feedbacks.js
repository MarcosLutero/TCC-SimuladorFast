import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { listarFeedbacksReq } from "../api/feedback";
import CustomFeedbackModal from "../components/customFeedbackModal";
import MenuAreas from "../components/menuAreas";

function formatarSegundos(segundos) {
  const total = Math.round(Number(segundos) || 0);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${seg < 10 ? "0" : ""}${seg}`;
}

function parseFeedbackData(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const carregarFeedbacks = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const data = await listarFeedbacksReq();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err?.msg || "Não foi possível carregar os feedbacks.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarFeedbacks();
  }, [carregarFeedbacks]);

  const feedbacksFiltrados = useMemo(() => {
    const termo = buscaUsuario.trim().toLowerCase();
    const inicioMs = inicio ? new Date(`${inicio}:00.000`).getTime() : null;
    const fimMs = fim ? new Date(`${fim}:59.999`).getTime() : null;

    return feedbacks.filter((feed) => {
      if (termo && !String(feed.usuario || "").toLowerCase().includes(termo)) {
        return false;
      }
      const createdMs = feed.createdAt ? new Date(feed.createdAt).getTime() : NaN;
      if (inicioMs !== null && (!Number.isFinite(createdMs) || createdMs < inicioMs)) {
        return false;
      }
      if (fimMs !== null && (!Number.isFinite(createdMs) || createdMs > fimMs)) {
        return false;
      }
      return true;
    });
  }, [feedbacks, buscaUsuario, inicio, fim]);

  const resumo = useMemo(() => {
    const totalSessoes = feedbacksFiltrados.length;
    const usuariosUnicos = new Set(feedbacksFiltrados.map((f) => f.usuario).filter(Boolean)).size;
    const temposValidos = feedbacksFiltrados
      .map((f) => Number(f.tempoTotal))
      .filter((t) => Number.isFinite(t) && t >= 0);
    const tempoMedio = temposValidos.length
      ? temposValidos.reduce((acc, t) => acc + t, 0) / temposValidos.length
      : 0;
    const totalAnimais = feedbacksFiltrados.reduce((acc, f) => acc + parseFeedbackData(f.data).length, 0);
    return { totalSessoes, usuariosUnicos, tempoMedio, totalAnimais };
  }, [feedbacksFiltrados]);

  const limparFiltros = () => {
    setBuscaUsuario("");
    setInicio("");
    setFim("");
  };

  return (
    <Container fluid className="p-0 m-0 col-12 pb-5">
      <MenuAreas />

      <Container className="mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h3 className="mb-0">Feedbacks das Sessões</h3>
            <small className="text-muted">
              Histórico completo de tentativas realizadas no quiz com detalhamento por animal e janela
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              style={{ fontFamily: "inherit" }}
              onClick={carregarFeedbacks}
            >
              <i className="bi bi-arrow-clockwise me-1" /> Atualizar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Sessões</div>
                <h3 className="mb-0">{resumo.totalSessoes}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Participantes</div>
                <h3 className="mb-0">{resumo.usuariosUnicos}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Animais Avaliados</div>
                <h3 className="mb-0">{resumo.totalAnimais}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Tempo Médio</div>
                <h3 className="mb-0">{formatarSegundos(resumo.tempoMedio)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col xs={12} md={4}>
                <Form.Label className="mb-1 small">Buscar por usuário</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Nome do usuário..."
                  value={buscaUsuario}
                  onChange={(e) => setBuscaUsuario(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Label className="mb-1 small">Data e hora início</Form.Label>
                <Form.Control
                  type="datetime-local"
                  size="sm"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Label className="mb-1 small">Data e hora fim</Form.Label>
                <Form.Control
                  type="datetime-local"
                  size="sm"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <Button
                  type="button"
                  size="sm"
                  variant="outline-secondary"
                  className="w-100"
                  style={{ fontFamily: "inherit" }}
                  onClick={limparFiltros}
                >
                  Limpar
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {erro && <Alert variant="danger">{erro}</Alert>}

        {carregando ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2 text-muted">Carregando feedbacks...</p>
          </div>
        ) : (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <strong>Histórico de Feedbacks</strong>
              <Badge bg="secondary">{feedbacksFiltrados.length} sessão(ões)</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {feedbacksFiltrados.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">Nenhum feedback encontrado para este filtro.</p>
              ) : (
                <Table responsive striped hover className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Data de Criação</th>
                      <th>Usuário</th>
                      <th className="text-center">Animais</th>
                      <th className="text-center">Tempo Total</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacksFiltrados.map((feed, index) => {
                      const itens = parseFeedbackData(feed.data);
                      return (
                        <tr key={feed.id || index}>
                          <td>{index + 1}</td>
                          <td>
                            {feed.createdAt
                              ? new Date(feed.createdAt).toLocaleString("pt-BR")
                              : "Sem data"}
                          </td>
                          <td className="fw-semibold">{feed.usuario}</td>
                          <td className="text-center">
                            <Badge bg="info">{itens.length}</Badge>
                          </td>
                          <td className="text-center">{formatarSegundos(feed.tempoTotal)}</td>
                          <td className="text-center">
                            <CustomFeedbackModal feeds={itens} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </Container>
  );
}
