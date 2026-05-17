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

  const hiphop = await prisma.genre.create({
    data: {
      name: "Hip-hop",
      description: "Zelfverzekerd, ritmisch en urban",
      artistReference: "Kendrick Lamar",
      visualTheme: "Neon, straattexturen, strakke contrasten",
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

  const rnbsoul = await prisma.genre.create({
    data: {
      name: "R&B/Soul",
      description: "Warm, gevoelig en groovy",
      artistReference: "Beyoncé",
      visualTheme: "Warme tinten, goud, soulvolle vibes",
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

  const klassiekjazz = await prisma.genre.create({
    data: {
      name: "Klassiek/Jazz",
      description: "Verfijnd, complex en tijdloos",
      artistReference: "Miles Davis",
      visualTheme: "Elegant, minimalistische lijnen, diepte",
    },
  });

  const rock = await prisma.genre.create({
    data: {
      name: "Rock",
      description: "Krachtig, rauw en authentiek",
      artistReference: "Foo Fighters",
      visualTheme: "Donker, gitaren, energie",
    },
  });

  const metal = await prisma.genre.create({
    data: {
      name: "Metal",
      description: "Extreem, intens en compromisloos",
      artistReference: "Metallica",
      visualTheme: "Zwart, vuur, duisternis",
    },
  });

  const q1 = await prisma.question.create({
    data: {
      text: "Wat trekt jou meestal als eerste in een nummer?",
      orderIndex: 1,
      answerOptions: {
        create: [
          {
            label: "De drums and bass pakken mij meteen mee.",
            orderIndex: 1,
          },
          {
            label: "Ik ben direct mee als ik het refrein snel kan onthouden.",
            orderIndex: 2,
          },
          {
            label:
              "Ik blijf hangen als de sfeer of de instrumenten iets bijzonders hebben.",
            orderIndex: 3,
          },
          {
            label:
              "Ik ben verkocht als het meteen hard en krachtig binnenkomt.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q2 = await prisma.question.create({
    data: {
      text: "Wat vind jij het belangrijkst in een nummer?",
      orderIndex: 2,
      answerOptions: {
        create: [
          {
            label: "Een ritme dat blijft duwen van begin tot einde.",
            orderIndex: 1,
          },
          {
            label: "Een refrein dat meteen in je hoofd blijft zitten.",
            orderIndex: 2,
          },
          {
            label: "Een nummer dat je blijft verrassen terwijl je luistert.",
            orderIndex: 3,
          },
          {
            label: "Een nummer dat vooral kracht en intensiteit heeft.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q3 = await prisma.question.create({
    data: {
      text: "Welke stem hoor je het liefst?",
      orderIndex: 3,
      answerOptions: {
        create: [
          {
            label: "Iemand die sterk is in ritme en woordgebruik.",
            orderIndex: 1,
          },
          {
            label: "Iemand met een heldere stem en een sterk refrein.",
            orderIndex: 2,
          },
          {
            label: "Iemand met een aparte of gevoelige stem die opvalt.",
            orderIndex: 3,
          },
          {
            label: "Iemand met een ruwe of heel krachtige stem.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q4 = await prisma.question.create({
    data: {
      text: "Hoe mag een nummer van jou opbouwen?",
      orderIndex: 4,
      answerOptions: {
        create: [
          {
            label: "Het mag langzaam opbouwen tot het ritme echt loskomt.",
            orderIndex: 1,
          },
          {
            label: "Het mag snel toewerken naar een groot refrein.",
            orderIndex: 2,
          },
          {
            label: "Het mag blijven veranderen en nieuwe kanten tonen.",
            orderIndex: 3,
          },
          {
            label: "Het mag steeds harder en heviger worden.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const q5 = await prisma.question.create({
    data: {
      text: "Welke klank spreekt jou het meest aan?",
      orderIndex: 5,
      answerOptions: {
        create: [
          {
            label: "Diepe bas en strakke drums.",
            orderIndex: 1,
          },
          {
            label: "Een nette, heldere klank die meteen goed klinkt.",
            orderIndex: 2,
          },
          {
            label: "Een warme, volle klank met veel gevoel.",
            orderIndex: 3,
          },
          {
            label: "Een ruwe, harde klank die mag schuren.",
            orderIndex: 4,
          },
        ],
      },
    },
    include: { answerOptions: true },
  });

  const questions = [q1, q2, q3, q4, q5];

  const scoreMap: Record<string, { genreName: string; score: number }[]> = {
    // Q1
    "De drums and bass pakken mij meteen mee.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Ik ben direct mee als ik het refrein snel kan onthouden.": [
      { genreName: "Pop", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Ik blijf hangen als de sfeer of de instrumenten iets bijzonders hebben.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Klassiek/Jazz", score: 1 },
    ],
    "Ik ben verkocht als het meteen hard en krachtig binnenkomt.": [
      { genreName: "Rock", score: 2 },
      { genreName: "Metal", score: 2 },
    ],

    // Q2
    "Een ritme dat blijft duwen van begin tot einde.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Een refrein dat meteen in je hoofd blijft zitten.": [
      { genreName: "Pop", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Een nummer dat je blijft verrassen terwijl je luistert.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Klassiek/Jazz", score: 1 },
    ],
    "Een nummer dat vooral kracht en intensiteit heeft.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Metal", score: 1 },
    ],

    // Q3
    "Iemand die sterk is in ritme en woordgebruik.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Iemand met een heldere stem en een sterk refrein.": [
      { genreName: "Pop", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Iemand met een aparte of gevoelige stem die opvalt.": [
      { genreName: "Indie", score: 2 },
      { genreName: "Rock", score: 1 },
    ],
    "Iemand met een ruwe of heel krachtige stem.": [
      { genreName: "Metal", score: 2 },
      { genreName: "Rock", score: 1 },
    ],

    // Q4
    "Het mag langzaam opbouwen tot het ritme echt loskomt.": [
      { genreName: "EDM", score: 2 },
      { genreName: "Hip-hop", score: 1 },
    ],
    "Het mag snel toewerken naar een groot refrein.": [
      { genreName: "Pop", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Het mag blijven veranderen en nieuwe kanten tonen.": [
      { genreName: "Klassiek/Jazz", score: 2 },
      { genreName: "Indie", score: 1 },
    ],
    "Het mag steeds harder en heviger worden.": [
      { genreName: "Rock", score: 2 },
      { genreName: "Metal", score: 1 },
    ],

    // Q5
    "Diepe bas en strakke drums.": [
      { genreName: "Hip-hop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Een nette, heldere klank die meteen goed klinkt.": [
      { genreName: "Pop", score: 2 },
      { genreName: "EDM", score: 1 },
    ],
    "Een warme, volle klank met veel gevoel.": [
      { genreName: "Klassiek/Jazz", score: 2 },
      { genreName: "R&B/Soul", score: 1 },
    ],
    "Een ruwe, harde klank die mag schuren.": [
      { genreName: "Rock", score: 2 },
      { genreName: "Metal", score: 1 },
    ],
  };

  const genresByName = {
    "Hip-hop": hiphop,
    EDM: edm,
    Pop: pop,
    "R&B/Soul": rnbsoul,
    Indie: indie,
    "Klassiek/Jazz": klassiekjazz,
    Rock: rock,
    Metal: metal,
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
