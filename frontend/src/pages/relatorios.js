import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Nav, ProgressBar, Row, Spinner, Table } from "react-bootstrap";
import MenuAreas from "../components/menuAreas";
import { obterRelatoriosReq } from "../api/relatorios";

function formatarSegundos(segundos) {
  const total = Math.round(Number(segundos) || 0);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${seg < 10 ? "0" : ""}${seg}`;
}

function corBarra(taxa) {
  if (taxa >= 75) return "success";
  if (taxa >= 50) return "warning";
  return "danger";
}

function baixarCsv(nomeArquivo, cabecalhos, linhas) {
  const escapar = (val) => {
    const str = val === null || val === undefined ? "" : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const conteudo = [
    cabecalhos.map(escapar).join(";"),
    ...linhas.map((linha) => linha.map(escapar).join(";")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RelatoriosPage() {
  const [aba, setAba] = useState("todos");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [animalId, setAnimalId] = useState("");

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (filtrosAtuais) => {
    setCarregando(true);
    setErro("");
    try {
      const resp = await obterRelatoriosReq(filtrosAtuais);
      setDados(resp);
    } catch (e) {
      setErro(e?.msg || "Não foi possível carregar os relatórios.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar({});
  }, [carregar]);

  const aplicarFiltros = (e) => {
    e.preventDefault();
    if (inicio && fim && inicio > fim) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }
    carregar({ inicio, fim, usuarioId, animalId });
  };

  const limparFiltros = () => {
    setInicio("");
    setFim("");
    setUsuarioId("");
    setAnimalId("");
    carregar({});
  };

  const exportarPorJanela = () => {
    if (!dados) return;
    baixarCsv(
      "relatorio-por-janela.csv",
      ["Sigla", "Região", "Avaliações", "Acertos", "Taxa Acerto (%)", "Falsos Positivos", "Falsos Negativos", "Sem Resposta", "Taxa Omissão (%)"],
      dados.porJanela.map((j) => [
        j.sigla,
        j.nome,
        j.totalAvaliacoes,
        j.acertos,
        j.taxaAcertoPercent,
        j.falsosPositivos,
        j.falsosNegativos,
        j.semResposta,
        j.taxaOmissaoPercent,
      ])
    );
  };

  const exportarPorUsuario = () => {
    if (!dados) return;
    baixarCsv(
      "relatorio-por-usuario.csv",
      ["Usuário", "Email", "Sessões", "Animais Avaliados", "Janelas", "Acertos", "Taxa Acerto (%)", "Sem Resposta", "Tempo Médio Sessão (s)", "Última Atividade"],
      dados.porUsuario.map((u) => [
        u.nome,
        u.email || "",
        u.totalSessoes,
        u.animaisAvaliados,
        u.janelasAvaliadas,
        u.acertos,
        u.taxaAcertoPercent,
        u.semResposta,
        u.tempoMedioSessaoSegundos,
        u.ultimaAtividade ? new Date(u.ultimaAtividade).toLocaleString("pt-BR") : "",
      ])
    );
  };

  const exportarPorAnimal = () => {
    if (!dados) return;
    baixarCsv(
      "relatorio-por-animal.csv",
      ["ID Animal", "Espécie", "Ativo", "Escore Cadastrado", "Vezes Avaliado", "Janelas", "Acertos", "Taxa Acerto (%)", "Tempo Médio (s)", "Janela Mais Difícil"],
      dados.porAnimal.map((a) => [
        a.animalId,
        a.especie,
        a.ativo ? "Sim" : "Não",
        a.pontuacaoCadastrada,
        a.vezesAvaliado,
        a.janelasAvaliadas,
        a.acertos,
        a.taxaAcertoPercent,
        a.tempoMedioSegundos,
        a.janelaMaisDificil || "",
      ])
    );
  };

  const exportarEvolucao = () => {
    if (!dados) return;
    baixarCsv(
      "relatorio-evolucao-diaria.csv",
      ["Data", "Sessões", "Usuários Únicos", "Animais Avaliados", "Janelas", "Acertos", "Taxa Acerto (%)", "Tempo Médio Sessão (s)"],
      dados.evolucaoDiaria.map((d) => [
        d.data,
        d.sessoes,
        d.usuariosUnicos,
        d.animaisAvaliados,
        d.janelasAvaliadas,
        d.acertos,
        d.taxaAcertoPercent,
        d.tempoMedioSessaoSegundos,
      ])
    );
  };

  const exportarPorAnimalUnico = () => {
    if (!dados) return;
    baixarCsv(
      "relatorio-animal-unico-primeira-tentativa.csv",
      [
        "Aluno",
        "ID Animal",
        "Espécie",
        "Tentativas",
        "1ª Tentativa Acertos",
        "1ª Tentativa Janelas",
        "1ª Tentativa (%)",
        "Tempo 1ª (s)",
        "Data 1ª Tentativa",
        "Última Tentativa (%)",
        "Tempo Última (s)",
        "Melhor Taxa (%)",
        "Evolução (p.p.)",
      ],
      (dados.porAnimalUnico || []).map((p) => [
        p.usuarioNome,
        p.animalId,
        p.especie,
        p.tentativas,
        p.acertosPrimeira,
        p.janelasPrimeira,
        p.taxaPrimeiraPercent,
        p.tempoPrimeiraSegundos,
        p.dataPrimeira ? new Date(p.dataPrimeira).toLocaleString("pt-BR") : "",
        p.taxaUltimaPercent,
        p.tempoUltimaSegundos,
        p.melhorTaxaPercent,
        p.ganhoPercent,
      ])
    );
  };

  const resumo = dados?.resumo;
  const mostrarTodos = aba === "todos";

  return (
    <Container fluid className="p-0 m-0 col-12 pb-5">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { break-inside: avoid; }
        }
      `}</style>
      <div className="no-print">
        <MenuAreas />
      </div>

      <Container className="mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h3 className="mb-0">Relatórios do Simulador A-FAST</h3>
            <small className="text-muted">
              Desempenho exclusivo de alunos (médicos e administradores ignorados), acurácia por janela, casos clínicos e evolução diária
            </small>
          </div>
          <div className="d-flex gap-2 no-print">
            <Button variant="outline-secondary" size="sm" style={{ fontFamily: "inherit" }} onClick={() => window.print()}>
              <i className="bi bi-printer me-1" /> Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form onSubmit={aplicarFiltros}>
              <Row className="g-2 align-items-end">
                <Col xs={12} sm={6} md={2}>
                  <Form.Label className="mb-1 small">Data início</Form.Label>
                  <Form.Control type="date" size="sm" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <Form.Label className="mb-1 small">Data fim</Form.Label>
                  <Form.Control type="date" size="sm" value={fim} onChange={(e) => setFim(e.target.value)} />
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Form.Label className="mb-1 small">Aluno</Form.Label>
                  <Form.Select size="sm" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                    <option value="">Todos os alunos</option>
                    {(dados?.filtros?.usuarios || []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}{u.email ? ` (${u.email})` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Form.Label className="mb-1 small">Animal / Caso</Form.Label>
                  <Form.Select size="sm" value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
                    <option value="">Todos os animais</option>
                    {(dados?.filtros?.animais || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.id} - {a.especie} {a.ativo ? "" : "(Inativo)"}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} md={2} className="d-flex gap-2">
                  <Button type="submit" size="sm" variant="primary" className="w-100" style={{ fontFamily: "inherit" }}>
                    Filtrar
                  </Button>
                  <Button type="button" size="sm" variant="outline-secondary" style={{ fontFamily: "inherit" }} onClick={limparFiltros}>
                    Limpar
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {erro && <Alert variant="danger">{erro}</Alert>}

        {carregando ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2 text-muted">Calculando relatórios...</p>
          </div>
        ) : resumo ? (
          <>
            {/* KPIs */}
            <Row className="g-3 mb-4">
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Sessões</div>
                    <h3 className="mb-0">{resumo.totalSessoes}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Alunos</div>
                    <h3 className="mb-0">{resumo.totalUsuariosAtivosNoPeriodo}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Acerto / Janela</div>
                    <h3 className={`mb-0 text-${corBarra(resumo.taxaAcertoPercent)}`}>
                      {resumo.taxaAcertoPercent}%
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Gabarito (4/4)</div>
                    <h3 className="mb-0">{resumo.taxaAcertoCompletoPercent}%</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Tempo Médio</div>
                    <h3 className="mb-0">{formatarSegundos(resumo.tempoMedioSessaoSegundos)}</h3>
                    <small className="text-muted">{formatarSegundos(resumo.tempoMedioPorAnimalSegundos)} / animal</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body className="py-3">
                    <div className="text-muted small">Casos Ativos</div>
                    <h3 className="mb-0">
                      {resumo.totalAnimaisAtivos}/{resumo.totalAnimaisCadastrados}
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Destaque 1ª Tentativa (sem repetição) */}
            <Row className="g-3 mb-4">
              <Col xs={12} md={4}>
                <Card className="h-100 shadow-sm border-primary">
                  <Card.Body className="py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Pares Únicos (Aluno × Animal)</div>
                      <h4 className="mb-0">{resumo.totalParesUnicos ?? 0}</h4>
                    </div>
                    <Badge bg="primary">1ª vez por caso</Badge>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={4}>
                <Card className="h-100 shadow-sm border-info">
                  <Card.Body className="py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Acerto na 1ª Tentativa (Sem Repetição)</div>
                      <h4 className={`mb-0 text-${corBarra(resumo.taxaAcertoPrimeiraTentativaPercent ?? 0)}`}>
                        {resumo.taxaAcertoPrimeiraTentativaPercent ?? 0}%
                      </h4>
                    </div>
                    <small className="text-muted">Tempo: {formatarSegundos(resumo.tempoMedioPrimeiraTentativaSegundos ?? 0)}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={4}>
                <Card className="h-100 shadow-sm border-success">
                  <Card.Body className="py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Acerto na Última Tentativa</div>
                      <h4 className={`mb-0 text-${corBarra(resumo.taxaAcertoUltimaTentativaPercent ?? 0)}`}>
                        {resumo.taxaAcertoUltimaTentativaPercent ?? 0}%
                      </h4>
                    </div>
                    <Badge bg={(resumo.taxaAcertoUltimaTentativaPercent ?? 0) >= (resumo.taxaAcertoPrimeiraTentativaPercent ?? 0) ? "success" : "danger"}>
                      {((resumo.taxaAcertoUltimaTentativaPercent ?? 0) - (resumo.taxaAcertoPrimeiraTentativaPercent ?? 0)) >= 0 ? "+" : ""}
                      {Math.round(((resumo.taxaAcertoUltimaTentativaPercent ?? 0) - (resumo.taxaAcertoPrimeiraTentativaPercent ?? 0)) * 10) / 10} p.p.
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Navegação entre relatórios */}
            <Nav variant="tabs" activeKey={aba} onSelect={(k) => setAba(k || "todos")} className="mb-3 no-print">
              <Nav.Item>
                <Nav.Link eventKey="todos">Todos os Relatórios</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="janelas">Por Janela (HD/HR/ER/CC)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="usuarios">Por Aluno</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="animais">Por Animal</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="unicos">Por Animal Único (1ª vs Última)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="evolucao">Evolução Diária</Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Relatório 1: Por Janela Anatômica */}
            {(mostrarTodos || aba === "janelas") && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <strong>1. Acurácia por Janela Anatômica (A-FAST)</strong>
                  <Button variant="outline-success" size="sm" className="no-print" style={{ fontFamily: "inherit" }} onClick={exportarPorJanela}>
                    <i className="bi bi-download me-1" /> CSV
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover className="mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Janela</th>
                        <th>Região</th>
                        <th className="text-center">Avaliações</th>
                        <th className="text-center">Acertos</th>
                        <th style={{ minWidth: "160px" }}>Taxa de Acerto</th>
                        <th className="text-center">Falso Positivo</th>
                        <th className="text-center">Falso Negativo</th>
                        <th className="text-center">Sem Resposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.porJanela.map((j) => (
                        <tr key={j.janela}>
                          <td><Badge bg="dark">{j.sigla}</Badge></td>
                          <td>{j.nome}</td>
                          <td className="text-center">{j.totalAvaliacoes}</td>
                          <td className="text-center">{j.acertos}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <ProgressBar now={j.taxaAcertoPercent} variant={corBarra(j.taxaAcertoPercent)} style={{ flex: 1, height: "10px" }} />
                              <small className="fw-bold">{j.taxaAcertoPercent}%</small>
                            </div>
                          </td>
                          <td className="text-center text-warning fw-semibold">{j.falsosPositivos}</td>
                          <td className="text-center text-danger fw-semibold">{j.falsosNegativos}</td>
                          <td className="text-center text-muted">{j.semResposta} ({j.taxaOmissaoPercent}%)</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Relatório 2: Por Usuário / Aluno */}
            {(mostrarTodos || aba === "usuarios") && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <strong>2. Desempenho por Aluno / Usuário</strong>
                  <Button variant="outline-success" size="sm" className="no-print" style={{ fontFamily: "inherit" }} onClick={exportarPorUsuario}>
                    <i className="bi bi-download me-1" /> CSV
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {dados.porUsuario.length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Nenhum exame encontrado para os filtros selecionados.</p>
                  ) : (
                    <Table responsive striped hover className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Usuário</th>
                          <th className="text-center">Sessões</th>
                          <th className="text-center">Animais</th>
                          <th className="text-center">Acertos / Janelas</th>
                          <th style={{ minWidth: "160px" }}>Taxa de Acerto</th>
                          <th className="text-center">Sem Resposta</th>
                          <th className="text-center">Tempo Médio</th>
                          <th>Última Atividade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.porUsuario.map((u) => (
                          <tr key={u.usuarioId}>
                            <td>
                              <div className="fw-semibold">{u.nome}</div>
                              {u.email && <small className="text-muted">{u.email}</small>}
                            </td>
                            <td className="text-center">{u.totalSessoes}</td>
                            <td className="text-center">{u.animaisAvaliados}</td>
                            <td className="text-center">{u.acertos} / {u.janelasAvaliadas}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={u.taxaAcertoPercent} variant={corBarra(u.taxaAcertoPercent)} style={{ flex: 1, height: "10px" }} />
                                <small className="fw-bold">{u.taxaAcertoPercent}%</small>
                              </div>
                            </td>
                            <td className="text-center text-muted">{u.semResposta} ({u.taxaOmissaoPercent}%)</td>
                            <td className="text-center">{formatarSegundos(u.tempoMedioSessaoSegundos)}</td>
                            <td>
                              <small>{u.ultimaAtividade ? new Date(u.ultimaAtividade).toLocaleString("pt-BR") : "—"}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Relatório 3: Por Animal / Caso Clínico */}
            {(mostrarTodos || aba === "animais") && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <strong>3. Dificuldade por Animal / Caso Clínico</strong>
                  <Button variant="outline-success" size="sm" className="no-print" style={{ fontFamily: "inherit" }} onClick={exportarPorAnimal}>
                    <i className="bi bi-download me-1" /> CSV
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {dados.porAnimal.length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Nenhuma avaliação de animal encontrada neste filtro.</p>
                  ) : (
                    <Table responsive striped hover className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Animal</th>
                          <th>Status</th>
                          <th className="text-center">Escore</th>
                          <th className="text-center">Avaliações</th>
                          <th style={{ minWidth: "160px" }}>Taxa de Acerto</th>
                          <th className="text-center">Tempo Médio</th>
                          <th>Janela com Mais Erros</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.porAnimal.map((a) => (
                          <tr key={a.animalId}>
                            <td><strong>#{a.animalId}</strong> — {a.especie}</td>
                            <td>
                              <Badge bg={a.ativo ? "success" : "secondary"}>
                                {a.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </td>
                            <td className="text-center">{a.pontuacaoCadastrada}</td>
                            <td className="text-center">{a.vezesAvaliado}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={a.taxaAcertoPercent} variant={corBarra(a.taxaAcertoPercent)} style={{ flex: 1, height: "10px" }} />
                                <small className="fw-bold">{a.taxaAcertoPercent}%</small>
                              </div>
                            </td>
                            <td className="text-center">{formatarSegundos(a.tempoMedioSegundos)}</td>
                            <td><small>{a.janelaMaisDificil || "—"}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Relatório 4: Por Animal Único (1ª vs Última tentativa por Aluno × Animal) */}
            {(mostrarTodos || aba === "unicos") && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <div>
                    <strong>4. Desempenho por Animal Único (1ª Tentativa vs Última por Aluno)</strong>
                    <div className="small text-muted">
                      Mede a acurácia inicial antes da repetição e a evolução do aluno ao rever o mesmo animal
                    </div>
                  </div>
                  <Button variant="outline-success" size="sm" className="no-print" style={{ fontFamily: "inherit" }} onClick={exportarPorAnimalUnico}>
                    <i className="bi bi-download me-1" /> CSV
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {(dados.porAnimalUnico || []).length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Nenhum par aluno × animal encontrado para este filtro.</p>
                  ) : (
                    <Table responsive striped hover className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>Animal</th>
                          <th className="text-center">Tentativas</th>
                          <th style={{ minWidth: "170px" }}>1ª Tentativa</th>
                          <th className="text-center">Tempo 1ª</th>
                          <th style={{ minWidth: "150px" }}>Última Tentativa</th>
                          <th className="text-center">Melhor</th>
                          <th className="text-center">Evolução</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dados.porAnimalUnico || []).map((p) => (
                          <tr key={`${p.usuarioId}-${p.animalId}`}>
                            <td className="fw-semibold">{p.usuarioNome}</td>
                            <td><strong>#{p.animalId}</strong> — {p.especie}</td>
                            <td className="text-center">
                              <Badge bg={p.tentativas > 1 ? "info" : "secondary"}>{p.tentativas}x</Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={p.taxaPrimeiraPercent} variant={corBarra(p.taxaPrimeiraPercent)} style={{ flex: 1, height: "10px" }} />
                                <small className="fw-bold">{p.acertosPrimeira}/{p.janelasPrimeira} ({p.taxaPrimeiraPercent}%)</small>
                              </div>
                              {p.dataPrimeira && (
                                <small className="text-muted">{new Date(p.dataPrimeira).toLocaleString("pt-BR")}</small>
                              )}
                            </td>
                            <td className="text-center">{formatarSegundos(p.tempoPrimeiraSegundos)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={p.taxaUltimaPercent} variant={corBarra(p.taxaUltimaPercent)} style={{ flex: 1, height: "10px" }} />
                                <small className="fw-bold">{p.taxaUltimaPercent}%</small>
                              </div>
                              <small className="text-muted">Tempo: {formatarSegundos(p.tempoUltimaSegundos)}</small>
                            </td>
                            <td className="text-center fw-bold">{p.melhorTaxaPercent}%</td>
                            <td className="text-center">
                              <Badge bg={p.ganhoPercent > 0 ? "success" : p.ganhoPercent < 0 ? "danger" : "secondary"}>
                                {p.ganhoPercent > 0 ? "+" : ""}{p.ganhoPercent} p.p.
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Relatório 5: Evolução Diária */}
            {(mostrarTodos || aba === "evolucao") && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <strong>5. Evolução Diária de Uso e Acertos</strong>
                  <Button variant="outline-success" size="sm" className="no-print" style={{ fontFamily: "inherit" }} onClick={exportarEvolucao}>
                    <i className="bi bi-download me-1" /> CSV
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {dados.evolucaoDiaria.length === 0 ? (
                    <p className="text-center text-muted py-4 mb-0">Nenhum dado diário disponível.</p>
                  ) : (
                    <Table responsive striped hover className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th className="text-center">Sessões</th>
                          <th className="text-center">Alunos Únicos</th>
                          <th className="text-center">Animais Avaliados</th>
                          <th className="text-center">Acertos / Janelas</th>
                          <th style={{ minWidth: "160px" }}>Taxa de Acerto</th>
                          <th className="text-center">Tempo Médio Sessão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.evolucaoDiaria.map((d) => (
                          <tr key={d.data}>
                            <td>{d.data.split("-").reverse().join("/")}</td>
                            <td className="text-center">{d.sessoes}</td>
                            <td className="text-center">{d.usuariosUnicos}</td>
                            <td className="text-center">{d.animaisAvaliados}</td>
                            <td className="text-center">{d.acertos} / {d.janelasAvaliadas}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={d.taxaAcertoPercent} variant={corBarra(d.taxaAcertoPercent)} style={{ flex: 1, height: "10px" }} />
                                <small className="fw-bold">{d.taxaAcertoPercent}%</small>
                              </div>
                            </td>
                            <td className="text-center">{formatarSegundos(d.tempoMedioSessaoSegundos)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}
          </>
        ) : null}
      </Container>
    </Container>
  );
}
