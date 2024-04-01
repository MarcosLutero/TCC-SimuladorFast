const baseUrl = process.env.REACT_APP_API_URL;
const Api = {
    refreshToken: async () => {
        try {
            const refresh = localStorage.getItem('refresh');
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            };

            const response = await fetch(`${baseUrl}/api/token/refresh/`, requestOptions);
            const data = await response.json();

            localStorage.setItem('access', data.access);
        } catch (error) {
            console.error('Erro ao atualizar token de acesso:', error);
        }
    },

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
                    const responseData = await response.json();
                    resolve(responseData);
                } else if (response.status === 401) {
                    await Api.refreshToken();
                    const newResponse = await Api.request(method, endpoint, { params, body });
                    resolve(newResponse);
                } else {
                    let responseJson = await response.json()
                    reject({
                        msg: responseJson.msg,
                        status: response.status,
                    });
                }
            } catch (error) {
                reject(error); // Rethrow a exceção para que a chamada original também a veja
            }
        })
    }
};
export { Api, baseUrl }
