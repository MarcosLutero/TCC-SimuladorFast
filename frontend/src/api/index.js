const baseUrl = process.env.REACT_APP_API_URL;

// Helper para limpar sessão e redirecionar para login em caso de 401
function handleUnauthorized() {
    sessionStorage.removeItem('access');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('nivelAcesso');
    // Evita loop se já estiver no login/cadastro
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/cadastro') {
        window.location.href = '/login';
    }
}

const Api = {
    request: (method, endpoint, { params = {}, body, contentType = 'application/json', hasToken = true, stringfyBody = true }) => {
        return new Promise(async (resolve, reject) => {
            try {
                let url = `${baseUrl}/${endpoint}`;

                const token = sessionStorage.getItem('access')

                const urlParams = new URLSearchParams(params);
                const uri = new URL(url);
                uri.search = urlParams.toString();

                const requestOptions = { method, headers: {} };
                if (contentType !== "") {
                    requestOptions.headers['Content-Type'] = contentType
                }
                if (hasToken && token) {
                    requestOptions.headers['Authorization'] = `Bearer ${token}`
                }
                if (body) {
                    requestOptions["body"] = stringfyBody ? JSON.stringify(body) : body
                }

                const response = await fetch(uri.toString(), requestOptions);
                if (response.ok || (response.status >= 200 && response.status < 300)) {
                    // 204 No Content não tem JSON
                    if (response.status === 204) {
                        resolve(null);
                        return;
                    }
                    const text = await response.text();
                    const responseData = text ? JSON.parse(text) : null;
                    resolve(responseData);
                } else if (response.status === 401) {
                    handleUnauthorized();
                    reject({
                        msg: 'Sessão expirada. Faça login novamente.',
                        status: 401,
                    });
                    return;
                } else {
                    let responseJson = {};
                    try {
                        const text = await response.text();
                        responseJson = text ? JSON.parse(text) : {};
                    } catch (_) {}
                    reject({
                        msg: responseJson.msg || responseJson.message || 'Erro na requisição',
                        status: response.status,
                    });
                }
            } catch (error) {
                reject(error);
            }
        })
    }
};
export { Api, baseUrl }
