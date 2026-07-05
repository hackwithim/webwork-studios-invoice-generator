const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const company = await prisma.company.findFirst();
  console.log('Company ID:', company?.id);
  console.log('Has googleDriveKey:', !!company?.googleDriveKey);
  if (company?.googleDriveKey) {
    console.log('Key snippet:', company.googleDriveKey.substring(0, 50));
  }
}
main().finally(() => prisma.$disconnect());
