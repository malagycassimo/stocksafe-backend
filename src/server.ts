// import express from 'express';
// import cors from 'cors';
// import routes from './routes.js';
// import { errorHandler } from './middlewares/errorHandler.js';
// import swaggerDocument from './config/swagger.json' with { type: 'json' };

// const app = express();

// app.use(cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
// }));

// app.use(express.json());

// import swaggerUi from 'swagger-ui-express';
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use(routes);

// app.use(errorHandler);
// const PORT = 3333;

// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 StockSafe rodando funcional em http://127.0.0.1:${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import swaggerDocument from './config/swagger.json' with { type: 'json' };

const app = express();

// Configuração do CORS para o Next.js
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// 📖 Rota da Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛣️ Rotas da Aplicação
app.use(routes);

// 🛡️ Middleware Global de Erros
app.use(errorHandler);

const PORT = 3333;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StockSafe rodando funcional em http://127.0.0.1:${PORT}`);
    console.log(`📖 Documentação disponível em http://127.0.0.1:${PORT}/api-docs`);
});