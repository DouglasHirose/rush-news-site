const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Função para conectar ao banco
async function connectDB() {
  try {
    await prisma.$connect();
    console.log(' Conectado ao banco de dados');
  } catch (error) {
    console.error(' Erro ao conectar ao banco:', error);
    process.exit(1);
  }
}

// Função para desconectar do banco
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Desconectado do banco de dados');
  } catch (error) {
    console.error(' Erro ao desconectar do banco:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};

