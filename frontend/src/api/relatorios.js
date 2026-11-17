import { Api } from ".";
import { listarAnimaisReq } from "./animal";
import { listarFeedbacksReq } from "./feedback";

const JANELAS_META = [
    { janela: 0, sigla: "HD", nome: "Hepato-Diafragmática" },
    { janela: 1, sigla: "HR", nome: "Hepato-Renal" },
    { janela: 2, sigla: "ER", nome: "Espleno-Renal" },
    { janela: 3, sigla: "CC", nome: "Cisto-Cólica" },
];

function normalizar(txt) {
    if (!txt) return "";
    return String(txt).trim().toLowerCase().replace(/í/g, "i").replace(/ã/g, "a");
}

function resolverJanela(janelaObj) {
    const title = String(janelaObj?.title || "").trim().toUpperCase();
    if (title === "HD") return 0;
    if (title === "HR") return 1;
    if (title === "ER") return 2;
    if (title === "CC") return 3;
    const idx = Number(janelaObj?.janela);
    return Number.isInteger(idx) && idx >= 0 && idx <= 3 ? idx : -1;
}

function pct(num, den) {
    if (!den) return 0;
    return Math.round((num * 1000) / den) / 10;
}

function avg(sum, count) {
    if (!count) return 0;
    return Math.round((sum * 10) / count) / 10;
}

function toLocalDateStr(dateInput) {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function agregarRelatoriosLocal(feedbacks, animais, filtros) {
    const animaisMap = new Map();
    (animais || []).forEach((a) => animaisMap.set(a.id, a));

    const usuariosFiltroMap = new Map();
    (feedbacks || []).forEach((f) => {
        if (f.usuario && !usuariosFiltroMap.has(f.usuario)) {
            usuariosFiltroMap.set(f.usuario, { id: f.usuario, nome: f.usuario, email: "" });
        }
    });

    const inicio = filtros?.inicio || null;
    const fim = filtros?.fim || null;
    const usuarioFiltro = filtros?.usuarioId || null;
    const animalFiltro = filtros?.animalId ? Number(filtros.animalId) : null;

    let totalSessoes = 0;
    const usuariosSet = new Set();
    let totalAnimaisAvaliados = 0;
    let animaisPerfeitos = 0;
    let totalJanelasAvaliadas = 0;
    let totalAcertosJanelas = 0;
    let totalSemResposta = 0;
    let somaTempoSessao = 0;
    let countTempoSessao = 0;
    let somaTempoAnimal = 0;
    let countTempoAnimal = 0;

    const porUsuarioMap = new Map();
    const porJanelaArr = JANELAS_META.map((m) => ({
        ...m,
        totalAvaliacoes: 0,
        acertos: 0,
        falsosPositivos: 0,
        falsosNegativos: 0,
        semResposta: 0,
    }));
    const porAnimalMap = new Map();
    const diariaMap = new Map();
    const uniquePairMap = new Map();

    const ordenados = (feedbacks || []).slice().sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (ta !== tb) return ta - tb;
        return Number(a?.id || 0) - Number(b?.id || 0);
    });

    ordenados.forEach((f) => {
        const nomeUsuario = f.usuario || "Desconhecido";
        if (usuarioFiltro && String(usuarioFiltro) !== String(nomeUsuario)) return;

        const dataStr = toLocalDateStr(f.createdAt);
        if (inicio && (!dataStr || dataStr < inicio)) return;
        if (fim && (!dataStr || dataStr > fim)) return;

        let parsed;
        try {
            parsed = JSON.parse(f.data);
        } catch {
            return;
        }
        if (!Array.isArray(parsed)) return;

        const itens = parsed.filter((item) => !animalFiltro || Number(item?.idAnimal) === animalFiltro);
        if (itens.length === 0) return;

        totalSessoes += 1;
        usuariosSet.add(nomeUsuario);

        const tempoSessao = Number(f.tempoTotal);
        if (Number.isFinite(tempoSessao) && tempoSessao >= 0) {
            somaTempoSessao += tempoSessao;
            countTempoSessao += 1;
        }

        if (!porUsuarioMap.has(nomeUsuario)) {
            porUsuarioMap.set(nomeUsuario, {
                usuarioId: nomeUsuario,
                nome: nomeUsuario,
                email: "",
                role: "",
                totalSessoes: 0,
                animaisAvaliados: 0,
                janelasAvaliadas: 0,
                acertos: 0,
                semResposta: 0,
                somaTempoSessao: 0,
                countTempoSessao: 0,
                somaTempoAnimal: 0,
                countTempoAnimal: 0,
                ultimaAtividade: null,
            });
        }
        const uStat = porUsuarioMap.get(nomeUsuario);
        uStat.totalSessoes += 1;
        if (Number.isFinite(tempoSessao) && tempoSessao >= 0) {
            uStat.somaTempoSessao += tempoSessao;
            uStat.countTempoSessao += 1;
        }
        if (f.createdAt && (!uStat.ultimaAtividade || new Date(f.createdAt) > new Date(uStat.ultimaAtividade))) {
            uStat.ultimaAtividade = f.createdAt;
        }

        if (dataStr && !diariaMap.has(dataStr)) {
            diariaMap.set(dataStr, {
                data: dataStr,
                sessoes: 0,
                usuarios: new Set(),
                animaisAvaliados: 0,
                acertos: 0,
                janelasAvaliadas: 0,
                somaTempoSessao: 0,
                countTempoSessao: 0,
            });
        }
        const dStat = dataStr ? diariaMap.get(dataStr) : null;
        if (dStat) {
            dStat.sessoes += 1;
            dStat.usuarios.add(nomeUsuario);
            if (Number.isFinite(tempoSessao) && tempoSessao >= 0) {
                dStat.somaTempoSessao += tempoSessao;
                dStat.countTempoSessao += 1;
            }
        }

        itens.forEach((item) => {
            const idAnim = Number(item?.idAnimal);
            if (!Number.isFinite(idAnim) || idAnim <= 0) return;

            totalAnimaisAvaliados += 1;
            uStat.animaisAvaliados += 1;
            if (dStat) dStat.animaisAvaliados += 1;

            if (!porAnimalMap.has(idAnim)) {
                const aObj = animaisMap.get(idAnim);
                porAnimalMap.set(idAnim, {
                    animalId: idAnim,
                    especie: aObj?.tipo || `Removido #${idAnim}`,
                    ativo: aObj ? Boolean(aObj.isActive) : false,
                    pontuacaoCadastrada: aObj?.pontuacao ?? 0,
                    vezesAvaliado: 0,
                    janelasAvaliadas: 0,
                    acertos: 0,
                    somaTempo: 0,
                    countTempo: 0,
                    totalPorJanela: [0, 0, 0, 0],
                    acertosPorJanela: [0, 0, 0, 0],
                });
            }
            const aStat = porAnimalMap.get(idAnim);
            aStat.vezesAvaliado += 1;

            const tAnim = Number(item?.tempo);
            if (Number.isFinite(tAnim) && tAnim >= 0) {
                somaTempoAnimal += tAnim;
                countTempoAnimal += 1;
                uStat.somaTempoAnimal += tAnim;
                uStat.countTempoAnimal += 1;
                aStat.somaTempo += tAnim;
                aStat.countTempo += 1;
            }

            let acertosNoAnimal = 0;
            let totalNoAnimal = 0;
            if (Array.isArray(item.janelas)) {
                item.janelas.forEach((jItem) => {
                    const jIdx = resolverJanela(jItem?.janela);
                    if (jIdx < 0 || jIdx > 3) return;
                    const resp = normalizar(jItem?.resposta);
                    const correta = normalizar(jItem?.respostaCorreta);
                    const semResp = !resp || resp === "sem resposta";
                    const acertou = !semResp && resp === correta;

                    totalJanelasAvaliadas += 1;
                    totalNoAnimal += 1;
                    uStat.janelasAvaliadas += 1;
                    aStat.janelasAvaliadas += 1;
                    aStat.totalPorJanela[jIdx] += 1;
                    porJanelaArr[jIdx].totalAvaliacoes += 1;
                    if (dStat) dStat.janelasAvaliadas += 1;

                    if (semResp) {
                        totalSemResposta += 1;
                        uStat.semResposta += 1;
                        porJanelaArr[jIdx].semResposta += 1;
                    } else if (acertou) {
                        totalAcertosJanelas += 1;
                        acertosNoAnimal += 1;
                        uStat.acertos += 1;
                        aStat.acertos += 1;
                        aStat.acertosPorJanela[jIdx] += 1;
                        porJanelaArr[jIdx].acertos += 1;
                        if (dStat) dStat.acertos += 1;
                    } else if (resp.startsWith("tem liquido") && !correta.startsWith("tem liquido")) {
                        porJanelaArr[jIdx].falsosPositivos += 1;
                    } else {
                        porJanelaArr[jIdx].falsosNegativos += 1;
                    }
                });
            }
            if (totalNoAnimal > 0 && acertosNoAnimal === totalNoAnimal) {
                animaisPerfeitos += 1;
            }

            const pairKey = `${nomeUsuario}::${idAnim}`;
            if (!uniquePairMap.has(pairKey)) {
                const aObj = animaisMap.get(idAnim);
                uniquePairMap.set(pairKey, {
                    usuarioId: nomeUsuario,
                    usuarioNome: nomeUsuario,
                    animalId: idAnim,
                    especie: aObj?.tipo || `Removido #${idAnim}`,
                    tentativas: 0,
                    acertosPrimeira: 0,
                    janelasPrimeira: 0,
                    tempoPrimeiraSegundos: 0,
                    tempoPrimeiraValido: -1,
                    dataPrimeira: null,
                    acertosUltima: 0,
                    janelasUltima: 0,
                    tempoUltimaSegundos: 0,
                    dataUltima: null,
                    melhorTaxaPercent: 0,
                });
            }
            const up = uniquePairMap.get(pairKey);
            const taxaAtual = pct(acertosNoAnimal, totalNoAnimal);
            const tValido = Number.isFinite(tAnim) && tAnim >= 0 ? Math.round(tAnim * 10) / 10 : 0;
            if (up.tentativas === 0) {
                up.acertosPrimeira = acertosNoAnimal;
                up.janelasPrimeira = totalNoAnimal;
                up.tempoPrimeiraSegundos = tValido;
                up.tempoPrimeiraValido = Number.isFinite(tAnim) && tAnim >= 0 ? tAnim : -1;
                up.dataPrimeira = f.createdAt || null;
                up.melhorTaxaPercent = taxaAtual;
            } else if (taxaAtual > up.melhorTaxaPercent) {
                up.melhorTaxaPercent = taxaAtual;
            }
            up.acertosUltima = acertosNoAnimal;
            up.janelasUltima = totalNoAnimal;
            up.tempoUltimaSegundos = tValido;
            up.dataUltima = f.createdAt || null;
            up.tentativas += 1;
        });
    });

    let acertosPrimeiraTotal = 0;
    let janelasPrimeiraTotal = 0;
    let acertosUltimaTotal = 0;
    let janelasUltimaTotal = 0;
    let somaTempoPrimeira = 0;
    let countTempoPrimeira = 0;
    const porAnimalUnico = Array.from(uniquePairMap.values())
        .map((up) => {
            acertosPrimeiraTotal += up.acertosPrimeira;
            janelasPrimeiraTotal += up.janelasPrimeira;
            acertosUltimaTotal += up.acertosUltima;
            janelasUltimaTotal += up.janelasUltima;
            if (up.tempoPrimeiraValido >= 0) {
                somaTempoPrimeira += up.tempoPrimeiraValido;
                countTempoPrimeira += 1;
            }
            const taxaPrimeira = pct(up.acertosPrimeira, up.janelasPrimeira);
            const taxaUltima = pct(up.acertosUltima, up.janelasUltima);
            return {
                usuarioId: up.usuarioId,
                usuarioNome: up.usuarioNome,
                animalId: up.animalId,
                especie: up.especie,
                tentativas: up.tentativas,
                acertosPrimeira: up.acertosPrimeira,
                janelasPrimeira: up.janelasPrimeira,
                taxaPrimeiraPercent: taxaPrimeira,
                tempoPrimeiraSegundos: up.tempoPrimeiraSegundos,
                dataPrimeira: up.dataPrimeira,
                acertosUltima: up.acertosUltima,
                janelasUltima: up.janelasUltima,
                taxaUltimaPercent: taxaUltima,
                tempoUltimaSegundos: up.tempoUltimaSegundos,
                dataUltima: up.dataUltima,
                melhorTaxaPercent: up.melhorTaxaPercent,
                ganhoPercent: Math.round((taxaUltima - taxaPrimeira) * 10) / 10,
            };
        })
        .sort((a, b) => a.usuarioNome.localeCompare(b.usuarioNome) || a.animalId - b.animalId);

    const ativosCount = (animais || []).filter((a) => Boolean(a.isActive)).length;

    return {
        fonteFallback: true,
        resumo: {
            totalSessoes,
            totalUsuariosAtivosNoPeriodo: usuariosSet.size,
            totalAnimaisAvaliados,
            totalJanelasAvaliadas,
            totalAcertosJanelas,
            totalSemResposta,
            taxaAcertoPercent: pct(totalAcertosJanelas, totalJanelasAvaliadas),
            taxaAcertoCompletoPercent: pct(animaisPerfeitos, totalAnimaisAvaliados),
            tempoMedioSessaoSegundos: avg(somaTempoSessao, countTempoSessao),
            tempoMedioPorAnimalSegundos: avg(somaTempoAnimal, countTempoAnimal),
            totalAnimaisCadastrados: (animais || []).length,
            totalAnimaisAtivos: ativosCount,
            totalParesUnicos: porAnimalUnico.length,
            taxaAcertoPrimeiraTentativaPercent: pct(acertosPrimeiraTotal, janelasPrimeiraTotal),
            taxaAcertoUltimaTentativaPercent: pct(acertosUltimaTotal, janelasUltimaTotal),
            tempoMedioPrimeiraTentativaSegundos: avg(somaTempoPrimeira, countTempoPrimeira),
        },
        porUsuario: Array.from(porUsuarioMap.values())
            .map((u) => ({
                ...u,
                taxaAcertoPercent: pct(u.acertos, u.janelasAvaliadas),
                taxaOmissaoPercent: pct(u.semResposta, u.janelasAvaliadas),
                tempoMedioSessaoSegundos: avg(u.somaTempoSessao, u.countTempoSessao),
                tempoMedioPorAnimalSegundos: avg(u.somaTempoAnimal, u.countTempoAnimal),
            }))
            .sort((a, b) => b.taxaAcertoPercent - a.taxaAcertoPercent || b.totalSessoes - a.totalSessoes),
        porJanela: porJanelaArr.map((w) => ({
            ...w,
            taxaAcertoPercent: pct(w.acertos, w.totalAvaliacoes),
            taxaErroPercent: pct(w.falsosPositivos + w.falsosNegativos, w.totalAvaliacoes),
            taxaOmissaoPercent: pct(w.semResposta, w.totalAvaliacoes),
        })),
        porAnimal: Array.from(porAnimalMap.values())
            .map((a) => {
                let piorJanela = null;
                let piorTaxa = 101;
                for (let i = 0; i < 4; i++) {
                    if (a.totalPorJanela[i] > 0) {
                        const t = pct(a.acertosPorJanela[i], a.totalPorJanela[i]);
                        if (t < piorTaxa) {
                            piorTaxa = t;
                            piorJanela = `${JANELAS_META[i].sigla} (${t}%)`;
                        }
                    }
                }
                return {
                    animalId: a.animalId,
                    especie: a.especie,
                    ativo: a.ativo,
                    pontuacaoCadastrada: a.pontuacaoCadastrada,
                    vezesAvaliado: a.vezesAvaliado,
                    janelasAvaliadas: a.janelasAvaliadas,
                    acertos: a.acertos,
                    taxaAcertoPercent: pct(a.acertos, a.janelasAvaliadas),
                    tempoMedioSegundos: avg(a.somaTempo, a.countTempo),
                    janelaMaisDificil: piorJanela,
                };
            })
            .sort((a, b) => a.animalId - b.animalId),
        evolucaoDiaria: Array.from(diariaMap.values())
            .sort((a, b) => a.data.localeCompare(b.data))
            .map((d) => ({
                data: d.data,
                sessoes: d.sessoes,
                usuariosUnicos: d.usuarios.size,
                animaisAvaliados: d.animaisAvaliados,
                acertos: d.acertos,
                janelasAvaliadas: d.janelasAvaliadas,
                taxaAcertoPercent: pct(d.acertos, d.janelasAvaliadas),
                tempoMedioSessaoSegundos: avg(d.somaTempoSessao, d.countTempoSessao),
            })),
        porAnimalUnico,
        filtros: {
            usuarios: Array.from(usuariosFiltroMap.values()),
            animais: (animais || [])
                .slice()
                .sort((a, b) => a.id - b.id)
                .map((a) => ({ id: a.id, especie: a.tipo, ativo: a.isActive })),
        },
    };
}

export async function obterRelatoriosReq(filtros = {}) {
    const params = {};
    if (filtros.inicio) params.inicio = filtros.inicio;
    if (filtros.fim) params.fim = filtros.fim;
    if (filtros.usuarioId) params.usuarioId = filtros.usuarioId;
    if (filtros.animalId) params.animalId = filtros.animalId;

    try {
        return await Api.request("GET", "relatorios", { params });
    } catch (err) {
        if (err && (err.status === 404 || err.status === 403 || !err.status)) {
            const [feedbacks, animais] = await Promise.all([
                listarFeedbacksReq(),
                listarAnimaisReq(),
            ]);
            return agregarRelatoriosLocal(feedbacks, animais, filtros);
        }
        throw err;
    }
}
