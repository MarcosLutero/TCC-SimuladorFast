import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { listarUsuariosReq, promoverUsuarioReq } from "../api/usuarios";
import MenuAreas from "../components/menuAreas";

function getRoleMeta(role) {
  switch (role) {
    case "ROLE_ADMIN":
      return { label: "Administrador", bg: "dark" };
    case "ROLE_TECNICO":
      return { label: "Médico", bg: "info" };
    default:
      return { label: "Aluno", bg: "secondary" };
  }
}

export default function AdminUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizandoId, setAtualizandoId] = useState(null);

  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState("todos");

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const data = await listarUsuariosReq();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err?.msg || "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const promoverUsuario = async (id) => {
    setAtualizandoId(id);
    setErro("");
    try {
      await promoverUsuarioReq(id);
      await carregarUsuarios();
    } catch (err) {
      setErro(err?.msg || "Não foi possível alterar o nível de acesso do usuário.");
    } finally {
      setAtualizandoId(null);
    }
  };

  const resumo = useMemo(() => {
    const total = usuarios.length;
    const alunos = usuarios.filter((u) => u.role === "ROLE_USER").length;
    const medicos = usuarios.filter((u) => u.role === "ROLE_TECNICO").length;
    const admins = usuarios.filter((u) => u.role === "ROLE_ADMIN").length;
    return { total, alunos, medicos, admins };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (roleFiltro !== "todos" && u.role !== roleFiltro) return false;
      if (termo) {
        const matchNome = String(u.nome || "").toLowerCase().includes(termo);
        const matchEmail = String(u.email || "").toLowerCase().includes(termo);
        if (!matchNome && !matchEmail) return false;
      }
      return true;
    });
  }, [usuarios, busca, roleFiltro]);

  const limparFiltros = () => {
    setBusca("");
    setRoleFiltro("todos");
  };

  return (
    <Container fluid className="p-0 m-0 col-12 pb-5">
      <MenuAreas />

      <Container className="mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h3 className="mb-0">Gerenciamento de Usuários</h3>
            <small className="text-muted">
              Controle de contas cadastradas e promoção de nível de acesso (Aluno ↔ Médico)
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              style={{ fontFamily: "inherit" }}
              onClick={carregarUsuarios}
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
                <div className="text-muted small">Total de Usuários</div>
                <h3 className="mb-0">{resumo.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Alunos</div>
                <h3 className="mb-0 text-primary">{resumo.alunos}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Médicos</div>
                <h3 className="mb-0 text-info">{resumo.medicos}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="h-100 shadow-sm text-center">
              <Card.Body className="py-3">
                <div className="text-muted small">Administradores</div>
                <h3 className="mb-0 text-dark">{resumo.admins}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col xs={12} md={6}>
                <Form.Label className="mb-1 small">Buscar por nome ou e-mail</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Nome ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Form.Label className="mb-1 small">Nível de Acesso</Form.Label>
                <Form.Select size="sm" value={roleFiltro} onChange={(e) => setRoleFiltro(e.target.value)}>
                  <option value="todos">Todos os níveis</option>
                  <option value="ROLE_USER">Aluno</option>
                  <option value="ROLE_TECNICO">Médico</option>
                  <option value="ROLE_ADMIN">Administrador</option>
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
            <p className="mt-2 text-muted">Carregando usuários...</p>
          </div>
        ) : (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <strong>Lista de Usuários</strong>
              <Badge bg="secondary">{usuariosFiltrados.length} usuário(s)</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {usuariosFiltrados.length === 0 ? (
                <p className="text-center text-muted py-4 mb-0">Nenhum usuário encontrado para este filtro.</p>
              ) : (
                <Table responsive striped hover className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th className="text-center">Nível de Acesso</th>
                      <th>Data Criação</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario, index) => {
                      const roleMeta = getRoleMeta(usuario.role);
                      return (
                        <tr key={usuario.id}>
                          <td>{index + 1}</td>
                          <td className="fw-semibold">{usuario.nome}</td>
                          <td>{usuario.email}</td>
                          <td className="text-center">
                            <Badge bg={roleMeta.bg}>{roleMeta.label}</Badge>
                          </td>
                          <td>
                            {usuario.created
                              ? new Date(usuario.created).toLocaleString("pt-BR")
                              : "Sem data"}
                          </td>
                          <td className="text-center">
                            {usuario.role !== "ROLE_ADMIN" ? (
                              <Button
                                size="sm"
                                variant={usuario.role === "ROLE_USER" ? "outline-primary" : "outline-warning"}
                                style={{ fontFamily: "inherit" }}
                                disabled={atualizandoId === usuario.id}
                                onClick={() => promoverUsuario(usuario.id)}
                              >
                                {atualizandoId === usuario.id
                                  ? "Atualizando..."
                                  : usuario.role === "ROLE_USER"
                                    ? "Promover para Médico"
                                    : "Rebaixar para Aluno"}
                              </Button>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
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
