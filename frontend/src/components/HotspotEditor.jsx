import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import {
  atualizarHotspotsAnimalReq,
  copiarLayoutAnimalReq,
  removerImagemBaseAnimalReq,
  uploadImagemBaseAnimalReq,
} from "../api/animal";
import {
  clonarHotspotsPadrao,
  parseHotspotsConfig,
  resolverImagemBaseUrl,
  serializeHotspotsConfig,
} from "../constants/hotspots";

export default function HotspotEditor({ animal, outrosAnimais = [], onUpdated }) {
  const containerRef = useRef(null);
  const draggingJanelaRef = useRef(null);

  const [hotspots, setHotspots] = useState(() => parseHotspotsConfig(animal?.hotspotsConfig));
  const [ativo, setAtivo] = useState(0);
  const [imagemBaseAtual, setImagemBaseAtual] = useState(animal?.imagemBase || null);
  const [cacheBust, setCacheBust] = useState(() => Date.now());
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [origemCopiaId, setOrigemCopiaId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    setHotspots(parseHotspotsConfig(animal?.hotspotsConfig));
    setImagemBaseAtual(animal?.imagemBase || null);
    setCacheBust(Date.now());
    setArquivoSelecionado(null);
    setStatusMsg(null);
  }, [animal?.id, animal?.hotspotsConfig, animal?.imagemBase]);

  const hotspotAtivo = hotspots.find((h) => h.janela === ativo) || hotspots[0];

  const atualizarPosicaoPorPonteiro = (clientX, clientY, janelaAlvo) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const left = Math.round(Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)) * 10) / 10;
    const top = Math.round(Math.min(95, Math.max(5, ((clientY - rect.top) / rect.height) * 100)) * 10) / 10;

    setHotspots((prev) =>
      prev.map((h) => (h.janela === janelaAlvo ? { ...h, left, top } : h))
    );
  };

  const handleContainerPointerDown = (e) => {
    atualizarPosicaoPorPonteiro(e.clientX, e.clientY, ativo);
  };

  const handleHotspotPointerDown = (e, janela) => {
    e.stopPropagation();
    setAtivo(janela);
    draggingJanelaRef.current = janela;
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignora se pointer capture não estiver disponível
      }
    }
  };

  const handleHotspotPointerMove = (e, janela) => {
    if (draggingJanelaRef.current !== janela) return;
    e.stopPropagation();
    atualizarPosicaoPorPonteiro(e.clientX, e.clientY, janela);
  };

  const handleHotspotPointerUp = (e) => {
    draggingJanelaRef.current = null;
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignora
      }
    }
  };

  const enviarImagemBase = async () => {
    if (!arquivoSelecionado || !animal?.id) return;
    setSalvando(true);
    setStatusMsg(null);
    try {
      const resp = await uploadImagemBaseAnimalReq(animal.id, arquivoSelecionado);
      setImagemBaseAtual(resp?.imagemBase || `animal_${animal.id}_base.png`);
      setCacheBust(Date.now());
      setArquivoSelecionado(null);
      setStatusMsg({ type: "success", text: "Imagem base personalizada enviada com sucesso." });
      if (onUpdated) onUpdated(resp);
    } catch (err) {
      setStatusMsg({ type: "danger", text: err?.msg || "Não foi possível enviar a imagem base." });
    } finally {
      setSalvando(false);
    }
  };

  const usarImagemPadrao = async () => {
    if (!animal?.id) return;
    setSalvando(true);
    setStatusMsg(null);
    try {
      const resp = await removerImagemBaseAnimalReq(animal.id);
      setImagemBaseAtual(null);
      setCacheBust(Date.now());
      setStatusMsg({ type: "success", text: "Imagem base restaurada para o padrão." });
      if (onUpdated) onUpdated(resp);
    } catch (err) {
      setStatusMsg({ type: "danger", text: err?.msg || "Não foi possível restaurar a imagem padrão." });
    } finally {
      setSalvando(false);
    }
  };

  const salvarHotspots = async () => {
    if (!animal?.id) return;
    setSalvando(true);
    setStatusMsg(null);
    try {
      const json = serializeHotspotsConfig(hotspots);
      const resp = await atualizarHotspotsAnimalReq(animal.id, json);
      setStatusMsg({ type: "success", text: "Posição dos hotspots salva para este animal." });
      if (onUpdated) onUpdated(resp);
    } catch (err) {
      setStatusMsg({ type: "danger", text: err?.msg || "Não foi possível salvar os hotspots." });
    } finally {
      setSalvando(false);
    }
  };

  const restaurarHotspotsPadrao = async () => {
    if (!animal?.id) return;
    setSalvando(true);
    setStatusMsg(null);
    try {
      const resp = await atualizarHotspotsAnimalReq(animal.id, null);
      setHotspots(clonarHotspotsPadrao());
      setStatusMsg({ type: "success", text: "Hotspots restaurados para as posições padrão." });
      if (onUpdated) onUpdated(resp);
    } catch (err) {
      setStatusMsg({ type: "danger", text: err?.msg || "Não foi possível restaurar os hotspots padrão." });
    } finally {
      setSalvando(false);
    }
  };

  const aplicarCopiaDeAnimal = async () => {
    if (!animal?.id || !origemCopiaId) return;
    setSalvando(true);
    setStatusMsg(null);
    try {
      const resp = await copiarLayoutAnimalReq(animal.id, origemCopiaId);
      setImagemBaseAtual(resp?.imagemBase || null);
      setHotspots(parseHotspotsConfig(resp?.hotspotsConfig));
      setCacheBust(Date.now());
      setStatusMsg({ type: "success", text: "Imagem base e hotspots copiados com sucesso." });
      if (onUpdated) onUpdated(resp);
    } catch (err) {
      setStatusMsg({ type: "danger", text: err?.msg || "Não foi possível copiar o layout do animal selecionado." });
    } finally {
      setSalvando(false);
    }
  };

  const opcoesCopia = (outrosAnimais || []).filter((a) => a.id !== animal?.id);

  return (
    <div>
      {statusMsg && (
        <Alert variant={statusMsg.type} className="py-2 small">
          {statusMsg.text}
        </Alert>
      )}

      <Row className="g-3">
        {/* Pré-visualização interativa */}
        <Col xs={12} md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-2 d-flex justify-content-between align-items-center">
              <strong className="small">Calibrar Hotspots sobre a Imagem</strong>
              <Badge bg={imagemBaseAtual ? "info" : "secondary"}>
                {imagemBaseAtual ? "Imagem customizada" : "Imagem padrão"}
              </Badge>
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center bg-dark p-2">
              <div
                ref={containerRef}
                onPointerDown={handleContainerPointerDown}
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  cursor: "crosshair",
                  touchAction: "none",
                }}
              >
                <img
                  src={resolverImagemBaseUrl(imagemBaseAtual, cacheBust)}
                  alt="Base do animal"
                  draggable={false}
                  style={{
                    display: "block",
                    maxHeight: "340px",
                    maxWidth: "100%",
                    width: "auto",
                    userSelect: "none",
                  }}
                />
                {hotspots.map((item) => {
                  const selecionado = item.janela === ativo;
                  return (
                    <div
                      key={item.janela}
                      onPointerDown={(e) => handleHotspotPointerDown(e, item.janela)}
                      onPointerMove={(e) => handleHotspotPointerMove(e, item.janela)}
                      onPointerUp={handleHotspotPointerUp}
                      title={`${item.title} — ${item.nome} (${item.left}%, ${item.top}%)`}
                      style={{
                        position: "absolute",
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        width: `${item.size}%`,
                        aspectRatio: "1 / 1",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: item.color,
                        opacity: selecionado ? 0.65 : 0.35,
                        border: selecionado ? "2px solid #ffffff" : "1px dashed #ffffff",
                        boxShadow: selecionado ? "0 0 0 2px #0d6efd" : "none",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        userSelect: "none",
                      }}
                    >
                      {item.title}
                    </div>
                  );
                })}
              </div>
              <small className="text-light mt-2 text-center">
                Clique na imagem ou arraste os círculos para reposicionar (no quiz continuam invisíveis).
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* Controles */}
        <Col xs={12} md={6} className="d-flex flex-column gap-3">
          {/* Imagem Base */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-2">
              <strong className="small">1. Imagem Base do Animal</strong>
            </Card.Header>
            <Card.Body className="py-2">
              <Form.Group className="mb-2">
                <Form.Control
                  type="file"
                  size="sm"
                  accept="image/*"
                  onChange={(e) => setArquivoSelecionado(e.target.files?.[0] || null)}
                />
              </Form.Group>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  style={{ fontFamily: "inherit" }}
                  disabled={!arquivoSelecionado || salvando}
                  onClick={enviarImagemBase}
                >
                  Enviar Imagem
                </Button>
                {imagemBaseAtual && (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    style={{ fontFamily: "inherit" }}
                    disabled={salvando}
                    onClick={usarImagemPadrao}
                  >
                    Usar Imagem Padrão
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Copiar de outro animal */}
          {opcoesCopia.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white py-2">
                <strong className="small">2. Copiar Imagem e Hotspots de Outro Animal</strong>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="d-flex gap-2">
                  <Form.Select
                    size="sm"
                    value={origemCopiaId}
                    onChange={(e) => setOrigemCopiaId(e.target.value)}
                  >
                    <option value="">Selecionar animal de origem...</option>
                    {opcoesCopia.map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.id} - {a.tipo}
                        {a.imagemBase || a.hotspotsConfig ? " (Personalizado)" : " (Padrão)"}
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    style={{ fontFamily: "inherit", whiteSpace: "nowrap" }}
                    disabled={!origemCopiaId || salvando}
                    onClick={aplicarCopiaDeAnimal}
                  >
                    Copiar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Ajuste dos 4 hotspots */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-2">
              <strong className="small">3. Ajuste da Janela Selecionada</strong>
            </Card.Header>
            <Card.Body className="py-2">
              <div className="d-flex flex-wrap gap-1 mb-2">
                {hotspots.map((h) => (
                  <Button
                    key={h.janela}
                    size="sm"
                    variant={h.janela === ativo ? "dark" : "outline-secondary"}
                    style={{ fontFamily: "inherit" }}
                    onClick={() => setAtivo(h.janela)}
                  >
                    {h.title}
                  </Button>
                ))}
              </div>

              <div className="small text-muted mb-2">
                <strong>{hotspotAtivo.title}</strong> ({hotspotAtivo.nome}) — Posição:{" "}
                <code>{hotspotAtivo.left}%</code> × <code>{hotspotAtivo.top}%</code>
              </div>

              <Form.Group className="mb-2">
                <Form.Label className="mb-0 small">
                  Tamanho da área ({hotspotAtivo.size}%)
                </Form.Label>
                <Form.Range
                  min={8}
                  max={45}
                  step={1}
                  value={hotspotAtivo.size}
                  onChange={(e) => {
                    const novoTam = Number(e.target.value);
                    setHotspots((prev) =>
                      prev.map((h) => (h.janela === ativo ? { ...h, size: novoTam } : h))
                    );
                  }}
                />
              </Form.Group>

              <div className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="success"
                  style={{ fontFamily: "inherit" }}
                  disabled={salvando}
                  onClick={salvarHotspots}
                >
                  Salvar Hotspots
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  style={{ fontFamily: "inherit" }}
                  disabled={salvando}
                  onClick={restaurarHotspotsPadrao}
                >
                  Restaurar Padrão
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
