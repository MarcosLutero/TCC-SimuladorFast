import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import ModalAnimal from "../components/modalAnimal";
import { listarAnimaisReq, deletarAnimalReq } from "../api/animal";
import MenuAreas from "../components/menuAreas";

const DATE_OPTIONS = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };

export default function AdminAnimais() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const carregarAnimais = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const data = await listarAnimaisReq();
      setAnimais(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err?.msg || "Não foi possível carregar os animais cadastrados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarAnimais();
  }, [carregarAnimais]);

  const deletarAnimal = async (animal) => {
    setErro("");
    try {
      await deletarAnimalReq(animal.id);
      await carregarAnimais();
    } catch (err) {
      setErro(err?.msg || "Não foi possível excluir o animal.");
    }
  };

  const resumo = useMemo(() => {
    const total = animais.length;
    const ativos = animais.filter((a) => a.isActive).length;
    const inativos = total - ativos;
    const especies = new Set(animais.map((a) => (a.tipo || "").trim().toLowerCase()).filter(Boolean)).size;
    return { total, ativos, inativos, especies };
  }, [animais]);

  const animaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return animais
      .filter((a) => {
        if (statusFiltro === "ativos" && !a.isActive) return false;
        if (statusFiltro === "inativos" && a.isActive) return false;
        if (termo) {
          const matchId = String(a.id || "").includes(termo);
          const matchTipo = String(a.tipo || "").toLowerCase().includes(termo);
          if (!matchId && !matchTipo) return false;
        }
        return true;
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [animais, busca, statusFiltro]);

  const limparFiltros = () => {
    setBusca("");
    setStatusFiltro("todos");
  };

  return (
    <Container fluid className="p-0 m-0 col-12 pb-5">
      <MenuAreas />

      <Container className="mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h3 className="mb-0">Animais Cadastrados</h3>
            <small className="text-muted">
              Gerenciamento de casos clínicos, status no quiz, escore e imagens por janela A-FAST
            </small>
          </div>
          <div className="d-flex gap-2">
            <ModalAnimal
              onCreateEdit={carregarAnimais}
              buttonLabel="Cadastrar Animal"
            />
          </div>
        </div>

        {/* KPIs */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Total de Casos</div>
                <h3 className="mb-0">{resumo.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Casos Ativos</div>
                <h3 className="mb-0 text-success">{resumo.ativos}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Casos Inativos</div>
                <h3 className="mb-0 text-secondary">{resumo.inativos}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Espécies</div>
                <h3 className="mb-0">{resumo.especies}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col xs={12} md={6}>
                <Form.Label className="mb-1 small">Buscar por ID ou espécie</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Ex: cachorro, gato, 24..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Form.Label className="mb-1 small">Status</Form.Label>
                <Form.Select size="sm" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                  <option value="todos">Todos os status</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={2}>
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
            <p className="mt-2 text-muted">Carregando animais...</p>
          </div>
        ) : (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <strong>Lista de Animais</strong>
              <Badge bg="secondary">{animaisFiltrados.length} registro(s)</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {animaisFiltrados.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">Nenhum animal encontrado para este filtro.</p>
              ) : (
                <Table responsive striped hover className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Espécie</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Escore</th>
                      <th>Cadastro</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animaisFiltrados.map((animal) => (
                      <tr key={animal.id}>
                        <td><strong>#{animal.id}</strong></td>
                        <td className="fw-semibold text-capitalize">{animal.tipo}</td>
                        <td className="text-center">
                          <Badge bg={animal.isActive ? "success" : "secondary"}>
                            {animal.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="dark">{animal.pontuacao ?? 0}</Badge>
                        </td>
                        <td>
                          {animal.cadastro
                            ? new Date(animal.cadastro).toLocaleString("pt-BR", DATE_OPTIONS)
                            : "Sem data"}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-3">
                            <ModalAnimal
                              iconButton
                              edit
                              animal={animal}
                              onCreateEdit={carregarAnimais}
                            />
                            <i
                              className="bi-trash text-danger"
                              title="Excluir animal"
                              style={{ cursor: "pointer" }}
                              onClick={() => deletarAnimal(animal)}
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
      </Container>
    </Container>
  );
}
