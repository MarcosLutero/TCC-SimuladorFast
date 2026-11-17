import { Api } from "."

export function sortearAnimaisReq(qtd, excludeIds = []) {
    const params = Array.isArray(excludeIds) && excludeIds.length > 0
        ? { excludeIds: excludeIds.join(",") }
        : {};
    return Api.request("GET", `sortear-animais/${qtd}`, { params });
}


export function listarAnimaisReq() {
    return Api.request("GET", `animal/`, {})
}
export function cadastrarAnimalReq(body) {
    return Api.request("POST", `animal/`, {body})
}
export function atualizarAnimalReq(id,body) {
    return Api.request("PUT", `animal/${id}`, { body })
}
export function deletarAnimalReq(id) {
    return Api.request("DELETE", `animal/${id}`, {})
}

export function listarImagensAnimalReq(idAnimal) {
    return Api.request("GET", `animal/${idAnimal}/imagens`, {})
}
export function cadastrarImagemAnimalReq(idAnimal, body) {
    return Api.request("POST", `animal/${idAnimal}/imagens`, {body, stringfyBody: false, contentType: ""})
}
export function atualizarImagemAnimalReq(idAnimal, idImagem, body) {
    return Api.request("PUT", `animal/${idAnimal}/imagens/${idImagem}`, {body, stringfyBody: false,contentType: ""})
}

export function deletarImagemAnimalReq(idAnimal, idImagem) {
    return Api.request("DELETE", `animal/${idAnimal}/imagens/${idImagem}`, {})
}

export function uploadImagemBaseAnimalReq(idAnimal, file) {
    const formData = new FormData();
    formData.append("file", file);
    return Api.request("POST", `animal/${idAnimal}/imagem-base`, {
        body: formData,
        stringfyBody: false,
        contentType: "",
    });
}

export function removerImagemBaseAnimalReq(idAnimal) {
    return Api.request("DELETE", `animal/${idAnimal}/imagem-base`, {});
}

export function atualizarHotspotsAnimalReq(idAnimal, hotspotsConfig) {
    return Api.request("PUT", `animal/${idAnimal}/hotspots`, {
        body: { hotspotsConfig },
    });
}

export function copiarLayoutAnimalReq(idAnimal, origemId) {
    return Api.request("POST", `animal/${idAnimal}/copiar-layout/${origemId}`, {});
}