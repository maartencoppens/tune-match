import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run prisma seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.sessionAnswer.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.answerGenreScore.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.genre.deleteMany();

  const punk = await prisma.genre.create({
    data: {
      name: "Punk",
      description: "Rebels, luid en energiek",
      artistReference: "Green Day",
      visualTheme: "Graffiti, neon, ruwe texturen",
    },
  });

  const indie = await prisma.genre.create({
    data: {
      name: "Indie",
      description: "Dromerig, creatief en alternatief",
      artistReference: "Arctic Monkeys",
      visualTheme: "Zachte kleuren, dreamy visuals",
    },
  });

  const edm = await prisma.genre.create({
    data: {
      name: "EDM",
      description: "Beats, energie en dans",
      artistReference: "Martin Garrix",
      visualTheme: "Lichtflitsen, lasers, futuristisch",
    },
  });

  const pop = await prisma.genre.create({
    data: {
      name: "Pop",
      description: "Catchy, sociaal en expressief",
      artistReference: "Dua Lipa",
      visualTheme: "Kleurrijk, glossy, speels",
    },
  });

  const hiphop = await prisma.genre.create({
    data: {
      name: "Hip-hop",
      description: "Zelfverzekerd, ritmisch en urban",
      artistReference: "Kendrick Lamar",
      visualTheme: "Neon, straattexturen, strakke contrasten",
    },
  });

  const q1 = await prisma.question.create({
    data: {
      text: "Stel, je hebt een mindere dag. Wat moet de muziek voor je doen?",
      orderIndex: 1,
      answerOptions: {
        create: [
          {
            label:
              "Mij opvrolijken met een melodie die ik meteen kan meezingen.",
            orderIndex: 1,
          },
          {
            label:
              "Me de kans geven om de frustratie er lekker uit te schreeuwen.",
            orderIndex: 2,
          },
          {
            label:
              "Mij het gevoel geven dat ik een eindbaas ben en alles aankan.",
            orderIndex: 3,
          },
          {
            label: "Me kalmeren, weghalen uit de realiteit en laten wegdromen.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q2 = await prisma.question.create({
    data: {
      text: "Je bent je vrienden kwijt op het festivalterrein. Waar ga je heen?",
      orderIndex: 2,
      answerOptions: {
        create: [
          {
            label:
              "Naar die donkere tent waar de sub-bassen door je borstkas trillen.",
            orderIndex: 1,
          },
          {
            label:
              "Chillen in het gras bij een kleine stage met een onbekende band.",
            orderIndex: 2,
          },
          {
            label:
              "Vooraan bij de mainstage, genietend van de grootste hits in de zon.",
            orderIndex: 3,
          },
          {
            label: "Naar de urban stage om mee te bouncen met de crowd.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q3 = await prisma.question.create({
    data: {
      text: "Als we jouw vibe in een paar woorden moeten samenvatten, wat past het best?",
      orderIndex: 3,
      answerOptions: {
        create: [
          {
            label:
              "Vrolijk, sociaal en altijd in voor gezelligheid of een feestje.",
            orderIndex: 1,
          },
          {
            label: "Zelfzeker, laid-back en altijd met een strakke stijl.",
            orderIndex: 2,
          },
          {
            label: "Rebels, direct, rauw en een beetje tegendraads.",
            orderIndex: 3,
          },
          {
            label: "Energiek, altijd aan het stuiteren en een echt nachtdier.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q4 = await prisma.question.create({
    data: {
      text: "Je mag je eigen virtuele AR-kamer ontwerpen. Welke stijl kies je?",
      orderIndex: 4,
      answerOptions: {
        create: [
          {
            label:
              "Veel planten, vintage posters, zacht zonlicht en warme kleuren.",
            orderIndex: 1,
          },
          {
            label:
              "Donker met flitsende laserstralen, rookmachines en abstracte vormen.",
            orderIndex: 2,
          },
          {
            label:
              "Straatlantaarns, neonverlichting, strakke sneakers en ruw beton.",
            orderIndex: 3,
          },
          {
            label:
              "Een rommelige kelder, gescheurde posters, rood licht en pure chaos.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q5 = await prisma.question.create({
    data: {
      text: "De track bouwt op en bereikt zijn absolute climax. Wat doet jouw lichaam?",
      orderIndex: 5,
      answerOptions: {
        create: [
          {
            label:
              "Ik spring direct de moshpit in en gooi alle remmen fysiek los.",
            orderIndex: 1,
          },
          {
            label:
              "Mijn handen gaan de lucht in, ik sluit mijn ogen en wacht op de drop.",
            orderIndex: 2,
          },
          {
            label:
              "Ik sta stil, doe mijn ogen dicht en laat me helemaal meevoeren.",
            orderIndex: 3,
          },
          {
            label:
              "Ik pak mijn vrienden vast en schreeuw luidkeels elk woord mee.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const questions = [q1, q2, q3, q4, q5];

  const scoreMap: Record<string, { genreName: string; score: number }[]> = {
    "Mij opvrolijken met een melodie die ik meteen kan meezingen.": [
      { genreName: "Pop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Me de kans geven om de frustratie er lekker uit te schreeuwen.": [
      { genreName: "Punk", score: 2 },
      { genreName: "Hip-hop", score: 1 },
    ],
    "Mij het gevoel geven dat ik een eindbaas ben en alles aankan.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "Punk", score: 1 },
    ],
    "Me kalmeren, weghalen uit de realiteit en laten wegdromen.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Pop", score: 1 },
    ],
    "Chillen in het gras bij een kleine stage met een onbekende band.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Pop", score: 1 },
    ],
    "Naar die donkere tent waar de sub-bassen door je borstkas trillen.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Hip-hop", score: 1 },
    ],
    "Vooraan bij de mainstage, genietend van de grootste hits in de zon.": [
      { genreName: "Pop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Naar de urban stage om mee te bouncen met de crowd.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "Indie", score: 1 },
    ],
    "Vrolijk, sociaal en altijd in voor gezelligheid of een feestje.": [
      { genreName: "Pop", score: 2 },
      { genreName: "Indie", score: 1 },
    ],
    "Zelfzeker, laid-back en altijd met een strakke stijl.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "Pop", score: 1 },
    ],
    "Rebels, direct, rauw en een beetje tegendraads.": [
      { genreName: "Punk", score: 2 },
      { genreName: "Hip-hop", score: 1 },
    ],
    "Energiek, altijd aan het stuiteren en een echt nachtdier.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Punk", score: 1 },
    ],
    "Veel planten, vintage posters, zacht zonlicht en warme kleuren.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Pop", score: 1 },
    ],
    "Donker met flitsende laserstralen, rookmachines en abstracte vormen.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Indie", score: 1 },
    ],
    "Straatlantaarns, neonverlichting, strakke sneakers en ruw beton.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "Punk", score: 1 },
    ],
    "Een rommelige kelder, gescheurde posters, rood licht en pure chaos.": [
      { genreName: "Punk", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Ik spring direct de moshpit in en gooi alle remmen fysiek los.": [
      { genreName: "Punk", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Mijn handen gaan de lucht in, ik sluit mijn ogen en wacht op de drop.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Pop", score: 1 },
    ],
    "Ik sta stil, doe mijn ogen dicht en laat me helemaal meevoeren.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Hip-hop", score: 1 },
    ],
    "Ik pak mijn vrienden vast en schreeuw luidkeels elk woord mee.": [
      { genreName: "Pop", score: 2 },
      { genreName: "Indie", score: 1 },
    ],
  };

  const genresByName = {
    Punk: punk,
    Indie: indie,
    EDM: edm,
    Pop: pop,
    "Hip-hop": hiphop,
  };

  for (const question of questions) {
    for (const option of question.answerOptions) {
      const scores = scoreMap[option.label] || [];

      for (const scoreEntry of scores) {
        await prisma.answerGenreScore.create({
          data: {
            answerOptionId: option.id,
            genreId:
              genresByName[scoreEntry.genreName as keyof typeof genresByName]
                .id,
            score: scoreEntry.score,
          },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
