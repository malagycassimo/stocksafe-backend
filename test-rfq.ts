import { prisma } from './src/lib/prisma.js';

async function test() {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.rFQ.count();
    const codigo = `RFQ-${year}-${String(count + 1).padStart(3, '0')}`;
    console.log('Generated code:', codigo);

    const product = await prisma.produto.findFirst();
    if (!product) {
      console.log('No products in database.');
      return;
    }
    console.log('Using product:', product.id, product.sku);

    const rfq = await prisma.rFQ.create({
      data: {
        codigo,
        dataLimite: new Date(),
        status: 'PENDING',
        items: {
          create: [{
            produtoId: product.id,
            quantidade: 10
          }]
        }
      },
      include: {
        items: true
      }
    });
    console.log('RFQ created successfully:', rfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
