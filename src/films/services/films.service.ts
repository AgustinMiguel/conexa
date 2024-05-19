import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../common/dtos';
import { PrismaService } from '../../common/prisma.service';
import { CreateFilmDto, FilmDto } from '../dtos';
import { PaginatedFilmsDto } from '../dtos/paginated-film.dto';

@Injectable()
export class FilmsService {
  constructor(private prisma: PrismaService) {}

  async create(createFilmDto: CreateFilmDto): Promise<FilmDto> {
    const { characters, ...filmData } = createFilmDto;

    const createdFilm = await this.prisma.film.create({
      data: {
        ...filmData,
        characters: {
          create: await Promise.all(
            characters.map(async (character) => {
              return {
                character: {
                  connectOrCreate: {
                    where: { name: character.name },
                    create: {
                      name: character.name,
                      gender: character.gender,
                      homeworld: {
                        connectOrCreate: {
                          where: { name: character.homeworld },
                          create: { name: character.homeworld },
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
      include: {
        characters: {
          include: {
            character: {
              include: {
                homeworld: true,
              },
            },
          },
        },
      },
    });

    const filmDto = plainToInstance(FilmDto, {
      ...createdFilm,
      characters: createdFilm.characters.map((fc) => ({
        id: fc.character.id,
        name: fc.character.name,
        gender: fc.character.gender,
        homeworld: {
          id: fc.character.homeworld.id,
          name: fc.character.homeworld.name,
        },
      })),
    });

    return filmDto;
  }

  async getFilms(getFilmsDto: PaginationDto): Promise<PaginatedFilmsDto> {
    const { skip, take } = getFilmsDto;

    const [films, total] = await Promise.all([
      this.prisma.film.findMany({
        skip,
        take,
        select: {
          id: true,
          title: true,
        },
      }),
      this.prisma.film.count(),
    ]);

    const filmDtos = plainToInstance(FilmDto, films);

    return {
      films: filmDtos,
      total,
      skip,
      take,
    };
  }

  async getFilmById(id: number): Promise<FilmDto> {
    const film = await this.prisma.film.findUnique({
      where: { id },
      include: {
        characters: {
          include: {
            character: {
              include: {
                homeworld: true,
              },
            },
          },
        },
      },
    });

    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }

    return plainToInstance(FilmDto, {
      ...film,
      characters: film.characters.map((fc) => ({
        id: fc.character.id,
        name: fc.character.name,
        gender: fc.character.gender,
        homeworld: {
          name: fc.character.homeworld.name,
        },
      })),
    });
  }
}
