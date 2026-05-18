import mongoose from 'mongoose';
import { LeadSource } from '../leads/lead-source.enum';
import { LeadSchema } from '../leads/schemas/lead.schema';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_flow';

const seedLeads = [
  {
    name: 'Laura Gómez',
    email: 'laura.gomez@example.com',
    phone: '+57 300 111 2233',
    source: LeadSource.Instagram,
    productInterest: 'Mentoría de ventas',
    budget: 250,
  },
  {
    name: 'Andrés Ruiz',
    email: 'andres.ruiz@example.com',
    phone: '+57 300 222 3344',
    source: LeadSource.Facebook,
    productInterest: 'Curso de automatización',
    budget: 180,
  },
  {
    name: 'María Torres',
    email: 'maria.torres@example.com',
    phone: '+57 300 333 4455',
    source: LeadSource.LandingPage,
    productInterest: 'Programa premium',
    budget: 500,
  },
  {
    name: 'Carlos Pérez',
    email: 'carlos.perez@example.com',
    phone: '+57 300 444 5566',
    source: LeadSource.Referido,
    productInterest: 'Diagnóstico estratégico',
    budget: 120,
  },
  {
    name: 'Sofía Herrera',
    email: 'sofia.herrera@example.com',
    phone: '+57 300 555 6677',
    source: LeadSource.Otro,
    productInterest: 'Workshop intensivo',
    budget: 90,
  },
  {
    name: 'Diego Castro',
    email: 'diego.castro@example.com',
    phone: '+57 300 666 7788',
    source: LeadSource.Instagram,
    productInterest: 'Acompañamiento mensual',
    budget: 320,
  },
  {
    name: 'Paula Rojas',
    email: 'paula.rojas@example.com',
    phone: '+57 300 777 8899',
    source: LeadSource.Facebook,
    productInterest: 'Masterclass premium',
    budget: 140,
  },
  {
    name: 'Juan Esteban',
    email: 'juan.esteban@example.com',
    phone: '+57 300 888 9900',
    source: LeadSource.LandingPage,
    productInterest: 'Funnel audit',
    budget: 280,
  },
  {
    name: 'Valentina Mejía',
    email: 'valentina.mejia@example.com',
    phone: '+57 300 999 0011',
    source: LeadSource.Referido,
    productInterest: 'Consultoría 1:1',
    budget: 600,
  },
  {
    name: 'Mateo Arias',
    email: 'mateo.arias@example.com',
    phone: '+57 300 101 1122',
    source: LeadSource.Otro,
    productInterest: 'Sesión de cierre',
    budget: 75,
  },
];

async function main() {
  await mongoose.connect(uri);
  const LeadModel = mongoose.model('Lead', LeadSchema);

  for (const lead of seedLeads) {
    await LeadModel.updateOne(
      { email: lead.email },
      { $set: lead },
      { upsert: true },
    );
  }

  await mongoose.disconnect();
  console.log('Seed finished');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
