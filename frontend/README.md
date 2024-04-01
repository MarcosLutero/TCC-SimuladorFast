# simulador-afast-backend

## Instalar Node.jss

### No Windows:

1. **Acesse o Site do Node.js:**
   Abra um navegador da web e acesse o site oficial do Node.js em [nodejs.org](https://nodejs.org/).

2. **Baixe o Instalador:**
   Na página inicial do Node.js, clique no botão de download que corresponde à versão LTS (Long Term Support) recomendada para a maioria dos usuários.

3. **Execute o Instalador:**
   Após o download ser concluído, execute o arquivo do instalador que você baixou. Siga as instruções na tela para completar o processo de instalação.

4. **Verificação da Instalação:**
   Após a instalação, abra um terminal (prompt de comando) e digite os seguintes comandos para verificar se o Node.js e o npm (gerenciador de pacotes do Node.js) foram instalados corretamente:

   ```
   node -v
   npm -v
   ```

### No Ubuntu:

1. **Instalação via Gerenciador de Pacotes:**
Abra um terminal e execute os seguintes comandos para instalar o Node.js e o npm através do gerenciador de pacotes apt:
    ```
    sudo apt update
    sudo apt install nodejs npm
    ```

2. **Verificação da Instalação:**
Após a instalação, você pode verificar se o Node.js e o npm foram instalados corretamente digitando os seguintes comandos em um terminal:

    ```
    node -v
    npm -v
    ```

## Uso

1. **Clone o projeto:**
   
   ```git clone <URL_REPOSITORIO>```

2. **Acesse o projeto**

    ```cd /TCC-SimuladorFast/frontend```

3. **Configure as variaveis do projeto**
    Crie o arquivo .env:

    ```REACT_APP_API_URL=http://localhost:8080```

4. **Instale as dependencias:**
   
   ```npm install```

5. **Execute a aplicação:**
   
   ```npm start```