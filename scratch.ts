import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany();
  const clients = await prisma.client.findMany();
  console.log('Leads:', leads.map(l => ({ name: l.name, phone: l.phone })));
  console.log('Clients:', clients.map(c => ({ name: c.clientName, phone: c.phone })));
}
main()
