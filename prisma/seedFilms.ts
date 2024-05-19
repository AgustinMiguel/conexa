import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function fetchFilms() {
  const response = await fetch('https://swapi.dev/api/films/');
  const data = await response.json();
  return data.results;
}

export async function seedFilms() {
  const films = await fetchFilms();

  for (const film of films) {
    const existingFilm = await prisma.film.findFirst({
      where: { title: film.title },
    });

    if (!existingFilm) {
      const createdFilm = await prisma.film.create({
        data: {
          title: film.title,
          opening_crawl: film.opening_crawl,
          director: film.director,
          producer: film.producer,
          release_date: new Date(film.release_date),
          characters: {
            create: await Promise.all(
              film.characters.map(async (characterUrl: string) => {
                const characterResponse = await fetch(characterUrl);
                const characterData = await characterResponse.json();
                const planetResponse = await fetch(characterData.homeworld);
                const planetData = await planetResponse.json();

                return {
                  character: {
                    connectOrCreate: {
                      where: { name: characterData.name },
                      create: {
                        name: characterData.name,
                        gender: characterData.gender,
                        homeworld: {
                          connectOrCreate: {
                            where: { name: planetData.name },
                            create: { name: planetData.name },
                          },
                        },
                      },
                    },
                  },
                };
              }),
            ),
          },
        },
      });

      console.log(`Film '${createdFilm.title}' and its characters seeded.`);
    } else {
      console.log(`Film '${film.title}' already exists. Skipping.`);
    }
  }
}

seedFilms()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
