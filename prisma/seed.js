const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar notícias de exemplo
  const news1 = await prisma.news.create({
    data: {
      title: "StarLadder Major 2019: O Maior Torneio de CS:GO do Ano",
      content: `O StarLadder Major Berlin 2019 foi um dos torneios mais emocionantes da história do Counter-Strike: Global Offensive. Com uma premiação total de $1.000.000, o evento reuniu as 24 melhores equipes do mundo em Berlim, Alemanha.

      A competição foi marcada por jogadas espetaculares, viradas emocionantes e performances individuais excepcionais. A equipe Astralis conseguiu defender seu título de campeã mundial, derrotando a AVANGAR na grande final por 2-0.

      O torneio também foi marcado pela excelente organização da StarLadder e pela atmosfera incrível criada pelos fãs alemães. A Mercedes-Benz Arena ficou lotada durante todos os dias de competição, criando um ambiente único para os jogadores e espectadores.

      Alguns destaques do torneio incluem:
      - A performance surpreendente da AVANGAR, chegando à final
      - As jogadas espetaculares de s1mple da Natus Vincere
      - A consistência da Astralis ao longo de todo o torneio
      - O nível técnico altíssimo apresentado por todas as equipes

      Este Major ficará marcado na história como um dos mais competitivos e emocionantes já realizados.`,
      summary: "O StarLadder Major Berlin 2019 foi um torneio épico de CS:GO com premiação de $1 milhão, onde a Astralis defendeu seu título mundial.",
      imageUrl: "/img/starladder/IMG_20190807_113117.jpg",
      author: "Douglas K. Hirose",
      category: "CS:GO",
      published: true,
      featured: true,
      views: 1250
    }
  });
  console.log(`Notícia 1 criada com ID: ${news1.id}`);

  const news2 = await prisma.news.create({
    data: {
      title: "League of Legends: Worlds 2024 - Previsões e Favoritos",
      content: `O Campeonato Mundial de League of Legends 2024 está se aproximando e as expectativas estão nas alturas. Este ano, o torneio promete ser um dos mais competitivos da história, com equipes de todas as regiões mostrando um nível técnico excepcional.

      As equipes coreanas continuam sendo as favoritas, especialmente T1 e Gen.G, que dominaram a LCK durante toda a temporada. No entanto, as equipes chinesas da LPL não ficam atrás, com JDG e BLG mostrando um jogo muito consistente.

      A região europeia (LEC) também promete surpreender, com G2 Esports e Fnatic chegando em boa forma. Já a América do Norte (LCS) aposta em Cloud9 e Team Liquid para fazer bonito no mundial.

      Principais pontos a observar:
      - O meta atual favorece jogadores de mid lane agressivos
      - A importância do controle de objetivos neutros
      - As novas estratégias de draft que surgiram na temporada
      - O impacto dos novos itens no late game

      O torneio promete grandes emoções e jogos inesquecíveis para todos os fãs de LoL.`,
      summary: "Análise completa dos favoritos e expectativas para o Campeonato Mundial de League of Legends 2024.",
      imageUrl: "/img/lol-worlds-2024.jpg",
      author: "Admin",
      category: "League of Legends",
      published: true,
      featured: false,
      views: 890
    }
  });
  console.log(`Notícia 2 criada com ID: ${news2.id}`);

  const news3 = await prisma.news.create({
    data: {
      title: "Dota 2: The International 2024 - Recordes de Premiação",
      content: `The International 2024 quebrou todos os recordes de premiação na história dos esports. Com um prize pool que ultrapassou os $15 milhões, o torneio mais importante de Dota 2 mais uma vez provou ser o evento mais lucrativo do cenário competitivo.

      A competição foi realizada em Seattle, berço da Valve, e contou com a participação de 20 equipes dos cinco continentes. O nível técnico apresentado foi simplesmente espetacular, com jogos que duraram mais de 70 minutos e viradas épicas.

      A equipe campeã, Team Spirit, conseguiu defender seu título de forma brilhante, mostrando uma consistência impressionante ao longo de todo o torneio. A final contra a PSG.LGD foi considerada uma das melhores da história do TI.

      Destaques do torneio:
      - Prize pool recorde de $15.2 milhões
      - Média de 1.2 milhão de espectadores simultâneos
      - 47 heróis diferentes foram escolhidos durante o evento
      - Jogos com duração média de 42 minutos

      O sucesso do TI 2024 consolida Dota 2 como um dos principais esports do mundo.`,
      summary: "The International 2024 bate recordes de premiação e audiência, consolidando Dota 2 no cenário mundial.",
      imageUrl: "/img/ti2024.jpg",
      author: "Admin",
      category: "Dota 2",
      published: true,
      featured: false,
      views: 654
    }
  });
  console.log(`Notícia 3 criada com ID: ${news3.id}`);

  // Criar tópicos do fórum
  const topic1 = await prisma.forumTopic.create({
    data: {
      title: "Discussão: Melhor equipe de CS:GO de todos os tempos",
      description: "Vamos debater qual foi a melhor equipe de Counter-Strike da história. Astralis? SK Gaming? Fnatic?",
      author: "GameMaster",
      category: "CS:GO",
      pinned: true,
      views: 2340
    }
  });
  console.log(`Tópico 1 criado com ID: ${topic1.id}`);

  const topic2 = await prisma.forumTopic.create({
    data: {
      title: "Dicas para subir de elo no League of Legends",
      description: "Compartilhem suas melhores dicas para conseguir subir de ranking no LoL.",
      author: "ProPlayer",
      category: "League of Legends",
      views: 1876
    }
  });
  console.log(`Tópico 2 criado com ID: ${topic2.id}`);

  // Criar posts no fórum
  await prisma.forumPost.createMany({
    data: [
      {
        content: "Na minha opinião, a Astralis de 2018-2019 foi a melhor equipe de todos os tempos. A forma como eles dominaram o cenário foi impressionante.",
        author: "CSFan2024",
        topicId: topic1.id
      },
      {
        content: "Discordo! A SK Gaming com FalleN, coldzera e fer foi muito mais dominante. Eles ganharam 2 Majors consecutivos!",
        author: "BrazilianPride",
        topicId: topic1.id
      },
      {
        content: "A dica mais importante é focar em farm e não ficar tentando fazer plays arriscadas o tempo todo.",
        author: "DiamondPlayer",
        topicId: topic2.id
      }
    ]
  });

  // Criar comentários nas notícias
  await prisma.comment.createMany({
    data: [
      {
        content: "Que torneio incrível! A final foi emocionante do início ao fim.",
        author: "FãDeCS",
        email: "fan@email.com",
        newsId: news1.id
      },
      {
        content: "A Astralis realmente merecia o título. Jogaram de forma impecável.",
        author: "AstralisFan",
        email: "astralis@email.com",
        newsId: news1.id
      },
      {
        content: "Mal posso esperar pelo Worlds! As equipes estão muito equilibradas este ano.",
        author: "LoLPlayer",
        email: "lol@email.com",
        newsId: news2.id
      }
    ]
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log(`📰 ${await prisma.news.count()} notícias criadas`);
  console.log(`💬 ${await prisma.comment.count()} comentários criados`);
  console.log(`🗣️ ${await prisma.forumTopic.count()} tópicos do fórum criados`);
  console.log(`📝 ${await prisma.forumPost.count()} posts do fórum criados`);
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


