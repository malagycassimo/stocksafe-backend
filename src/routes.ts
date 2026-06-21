import { Router } from 'express';
import { UsuarioController } from './modules/users/UsuarioController.js';
import { ProdutoController } from './modules/products/ProdutoController.js';
import { FornecedorController } from './modules/suppliers/FornecedorController.js';
import { LocalController } from './modules/locations/LocalController.js';
import { RequisicaoController } from './modules/requests/RequisicaoController.js';
import { EstoqueController } from './modules/stock/EstoqueController.js';
import { AuthController } from './modules/auth/AuthController.js';
import { ValidadeController } from './modules/validity/ValidadeController.js';
import { PurchasingController } from './modules/purchasing/PurchasingController.js';
import { ReceivingController } from './modules/receiving/ReceivingController.js';
import { QualityController } from './modules/quality/QualityController.js';
import { InventoryController } from './modules/inventory/InventoryController.js';
import { ShippingController } from './modules/shipping/ShippingController.js';

const routes = Router();
const usuarioController = new UsuarioController();
const produtoController = new ProdutoController();
const fornecedorController = new FornecedorController();
const localController = new LocalController();
const requisicaoController = new RequisicaoController();
const estoqueController = new EstoqueController();
const authController = new AuthController();
const validadeController = new ValidadeController();
const purchasingController = new PurchasingController();
const receivingController = new ReceivingController();
const qualityController = new QualityController();
const inventoryController = new InventoryController();
const shippingController = new ShippingController();



// Define o endpoint POST /login
routes.post('/login', authController.login);


// Rotas de Utilizadores
routes.post('/usuarios', (req, res, next) => usuarioController.create(req, res, next));
routes.get('/usuarios', (req, res, next) => usuarioController.index(req, res, next));
routes.get('/usuarios/:id', (req, res, next) => usuarioController.show(req, res, next));
routes.put('/usuarios/:id', (req, res, next) => usuarioController.update(req, res, next));
routes.delete('/usuarios/:id', (req, res, next) => usuarioController.delete(req, res, next));

// Rotas de Produtos
routes.post('/produtos', (req, res, next) => produtoController.create(req, res, next));
routes.get('/produtos', (req, res, next) => produtoController.index(req, res, next));
routes.get('/produtos/:id', (req, res, next) => produtoController.show(req, res, next));
routes.put('/produtos/:id', (req, res, next) => produtoController.update(req, res, next));
routes.delete('/produtos/:id', (req, res, next) => produtoController.delete(req, res, next));

// Rotas de Fornecedores
routes.post('/fornecedores', (req, res, next) => fornecedorController.create(req, res, next));
routes.get('/fornecedores', (req, res, next) => fornecedorController.index(req, res, next));
routes.get('/fornecedores/:id', (req, res, next) => fornecedorController.show(req, res, next));
routes.put('/fornecedores/:id', (req, res, next) => fornecedorController.update(req, res, next));
routes.delete('/fornecedores/:id', (req, res, next) => fornecedorController.delete(req, res, next));


// 🏢 Rotas de Locais / Estrutura Logística
routes.post('/locais', (req, res, next) => localController.create(req, res, next));
routes.get('/locais', (req, res, next) => localController.index(req, res, next));
routes.get('/locais/:id', (req, res, next) => localController.show(req, res, next));
routes.put('/locais/:id', (req, res, next) => localController.update(req, res, next));
routes.delete('/locais/:id', (req, res, next) => localController.delete(req, res, next));

// 📋 Rotas do Módulo de Requisições Internas
routes.post('/requisicoes', (req, res, next) => requisicaoController.create(req, res, next));
routes.get('/requisicoes', (req, res, next) => requisicaoController.index(req, res, next));
routes.get('/requisicoes/:id', (req, res, next) => requisicaoController.show(req, res, next));
routes.patch('/requisicoes/:id/avaliar', (req, res, next) => requisicaoController.avaliar(req, res, next));


// 🟢 Rotas de Consulta e Painel de Estoque
routes.get('/estoque/consultar', (req, res, next) => estoqueController.index(req, res, next));
routes.get('/estoque/painel-kpi', (req, res, next) => estoqueController.dashboard(req, res, next));

// 🟢 ADICIONADOS: Endpoints para movimentar o StockSafe via Insomnia/Formulários
routes.post('/estoque/entrada', (req, res, next) => estoqueController.entrada(req, res, next));
routes.post('/estoque/saida', (req, res, next) => estoqueController.saida(req, res, next));

// 🔴 Rotas de Controle de Validades
routes.get('/validade/metricas', (req, res, next) => validadeController.metricas(req, res, next));
routes.get('/validade/produtos-criticos', (req, res, next) => validadeController.produtosCriticos(req, res, next));
routes.post('/validade/descartar', (req, res, next) => validadeController.descartar(req, res, next));
routes.post('/validade/descartar-em-massa', (req, res, next) => validadeController.descartarEmMassa(req, res, next));
routes.post('/validade/campanha', (req, res, next) => validadeController.campanha(req, res, next));
routes.post('/validade/campanhas', (req, res, next) => validadeController.criarCampanhaValidade(req, res, next));
routes.get('/validade/campanhas', (req, res, next) => validadeController.listCampanhas(req, res, next));
routes.get('/validade/campanhas/:id', (req, res, next) => validadeController.obterCampanha(req, res, next));

// 🛒 Rotas de Compras
routes.get('/rfqs', (req, res, next) => purchasingController.listRFQs(req, res, next));
routes.get('/rfqs/:id', (req, res, next) => purchasingController.getRFQ(req, res, next));
routes.post('/rfqs', (req, res, next) => purchasingController.createRFQ(req, res, next));
routes.post('/propostas', (req, res, next) => purchasingController.submitProposta(req, res, next));
routes.get('/rfqs/:id/propostas', (req, res, next) => purchasingController.getComparativoPropostas(req, res, next));
routes.delete('/rfqs/:id', (req, res, next) => purchasingController.cancelRFQ(req, res, next));

// 🚚 Rotas de Recebimento
routes.post('/recebimento/checkin', (req, res, next) => receivingController.createCheckIn(req, res, next));
routes.post('/recebimento/conferencia', (req, res, next) => receivingController.submitConferencia(req, res, next));
routes.post('/purchase-orders', (req, res, next) => receivingController.createPurchaseOrder(req, res, next));
routes.get('/purchase-orders', (req, res, next) => receivingController.listPurchaseOrders(req, res, next));
routes.get('/purchase-orders/:id', (req, res, next) => receivingController.getPurchaseOrder(req, res, next));
routes.delete('/purchase-orders/:id', (req, res, next) => receivingController.cancelPurchaseOrder(req, res, next));

// 🔬 Rotas de Qualidade
routes.post('/qualidade/inspecao', (req, res, next) => qualityController.createInspecao(req, res, next));
routes.get('/qualidade/inspecao', (req, res, next) => qualityController.listInspecoes(req, res, next));
routes.get('/qualidade/quarentena', (req, res, next) => qualityController.listQuarentena(req, res, next));
routes.get('/qualidade/quarentena/:id', (req, res, next) => qualityController.getQuarantineItem(req, res, next));

// 🗄️ Rotas de Inventários
routes.get('/inventarios', (req, res, next) => inventoryController.listInventarios(req, res, next));
routes.get('/inventarios/:id', (req, res, next) => inventoryController.getInventario(req, res, next));
routes.post('/inventarios', (req, res, next) => inventoryController.createInventario(req, res, next));
routes.post('/inventarios/:id/contar', (req, res, next) => inventoryController.submeterContagem(req, res, next));
routes.post('/inventarios/:id/ajustar', (req, res, next) => inventoryController.ajustarInventario(req, res, next));

// 📦 Rotas de Expedição (Shipping)
routes.get('/expedicao/ordens', (req, res, next) => shippingController.listPickingOrders(req, res, next));
routes.get('/expedicao/ordens/:id', (req, res, next) => shippingController.getPickingOrder(req, res, next));
routes.post('/expedicao/ordens', (req, res, next) => shippingController.createPickingOrder(req, res, next));
routes.post('/expedicao/picking/concluir', (req, res, next) => shippingController.concluirPicking(req, res, next));

export default routes;