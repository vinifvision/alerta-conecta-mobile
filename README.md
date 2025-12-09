# 🚨 Alerta Conecta

**Alerta Conecta** é uma solução integrada (Mobile + Backend + Banco de Dados) desenvolvida para a gestão, registro e visualização de ocorrências emergenciais. O sistema permite que agentes operacionais registrem incidentes em tempo real, utilizando geolocalização precisa (GPS) e evidências multimídia (Fotos/Vídeos).

---

## 🛠 Tecnologias Utilizadas

### 📱 Mobile (Frontend)

- **Framework:** React Native (via Expo)
- **Linguagem:** TypeScript
- **Gerenciamento de Estado:** React Context API (Auth & Theme)
- **Mapas:** `react-native-maps`
- **Geolocalização:** `expo-location` (Geocoding reverso e coordenadas)
- **Mídia:** `expo-image-picker` (Câmera e Galeria)
- **UI/UX:** Estilização responsiva com suporte a temas.

### ☕ Backend (API)

- **Linguagem:** Java 21
- **Framework:** Spring Boot 3.5.6
- **Build Tool:** Gradle
- **Arquitetura:** REST API com conexão JDBC direta.
- **Funcionalidades:** Autenticação, CRUD de Ocorrências, Upload de Arquivos (`multipart/form-data`).

### 🗄 Banco de Dados

- **SGBD:** MySQL 8.0+
- **Estrutura:** Tabelas relacionais (`Ocorrencia`, `Funcionario`, `Endereco`), Stored Procedures e Views para encapsulamento de lógica.

---

## ✨ Funcionalidades Principais

1.  **Autenticação Segura:** Login via CPF e Senha, validado diretamente no banco de dados.
2.  **Dashboard Operacional:**
    - Visualização de ocorrências agrupadas por status (Em andamento, Encerrada, Cancelada).
    - Filtros avançados por data, tipo e status.
3.  **Registro de Ocorrências:**
    - **Geolocalização Inteligente:** Captura automática de Latitude/Longitude via GPS e preenchimento automático do endereço.
    - **Anexos:** Captura de fotos ou gravação de vídeos curtos como evidência.
    - **Classificação:** Seleção de tipo, prioridade e descrição detalhada.
4.  **Visualização Detalhada:**
    - Exibição da localização exata no mapa.
    - Detalhes de vítimas e status operacional.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js & npm
- JDK 21
- MySQL Server
- Expo Go (no celular) ou Emulador Android/iOS

### Passo 1: Banco de Dados 🗄

1.  Crie um banco de dados MySQL (ex: `alertacon`).
2.  Execute os scripts SQL na seguinte ordem (presentes na pasta do banco):
    1.  `tabelas.sql` (Criação da estrutura)
    2.  `procedures.sql` (Lógica de inserção e procedures)
    3.  `inserts.sql` (Carga inicial de dados, tipos e usuários)

### Passo 2: Backend ☕

1.  Navegue até a pasta do backend.
2.  Configure o arquivo `src/main/resources/application.properties` com suas credenciais:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/alertacon
    spring.datasource.username=seu_usuario
    spring.datasource.password=sua_senha
    ```
3.  Execute o projeto:
    ```bash
    ./gradlew bootRun
    ```
4.  O servidor iniciará (padrão: porta `3308` ou `8080`).

### Passo 3: Mobile 📱

1.  Navegue até a pasta do mobile.
2.  Instale as dependências:
    ```bash
    npm install
    npx expo install expo-location expo-image-picker react-native-maps
    ```
3.  Configure o endereço da API em `src/services/authService.ts` e `occurrenceService.ts`:
    ```typescript
    // Se estiver rodando localmente (ex: Android Emulator)
    const API_URL = "http://10.0.X.X:3308/database";
    const USE_MOCK = false; // Mude para false para conectar no backend
    ```
4.  Inicie o app:
    ```bash
    npx expo start
    ```

---

## 🔌 Integração e Endpoints

O Frontend se comunica com o Backend através dos seguintes endpoints principais:

| Método | Endpoint               | Descrição                   | Payload (Resumo)                                   |
| :----- | :--------------------- | :-------------------------- | :------------------------------------------------- |
| `POST` | `/user/login`          | Autenticação do funcionário | `{ cpf, pass }`                                    |
| `GET`  | `/occurrence/getall`   | Lista todas as ocorrências  | -                                                  |
| `POST` | `/occurrence/registry` | Registra nova ocorrência    | `Multipart/Form-Data` (title, lat, lng, images...) |

---

## 📱 Estrutura do Projeto Mobile

```
src/
├── assets/         # Imagens e ícones
├── components/     # Componentes reutilizáveis (Cards, Modais)
├── contexts/       # Context API (Auth, Theme)
├── pages/          # Telas (Home, Login, Profile, Register...)
├── services/       # Comunicação com API e Mock Data
└── types/          # Definições de Tipagem TypeScript
```

---

## 🤝 Contribuição

Este projeto foi desenvolvido com foco em modularidade.

- **Frontend:** Focado na experiência do usuário e tratamento offline/mock.
- **Backend:** Focado na regra de negócio e persistência segura.
