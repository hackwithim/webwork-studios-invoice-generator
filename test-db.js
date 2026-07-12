const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to DB...');
  const company = await prisma.company.findFirst();
  console.log('Success!', company);
}

main()
  .catch(e => console.error('Error:', e))
  .finally(async () => await prisma.$disconnect());
