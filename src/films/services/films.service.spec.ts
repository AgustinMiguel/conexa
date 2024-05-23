import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { FilmsService } from ".";
import { PaginationDto } from "../../common/dtos";
import { PrismaService } from "../../common/prisma.service";
import { CreateFilmDto, FilmDto } from "../dtos";

const mockPrismaService = {
  film: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("FilmsService", () => {
  let service: FilmsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a film and return FilmDto", async () => {
      const createFilmDto: CreateFilmDto = {
        title: "Test Film",
        opening_crawl: "A long time ago...",
        director: "George Lucas",
        producer: "Gary Kurtz",
        release_date: new Date("1977-05-25"),
        characters: [
          {
            name: "Luke Skywalker",
            gender: "male",
            homeworld: "Tatooine",
          },
        ],
      };

      const createdFilm = {
        id: 1,
        title: "Test Film",
        opening_crawl: "A long time ago...",
        director: "George Lucas",
        producer: "Gary Kurtz",
        release_date: new Date("1977-05-25"),
        characters: [
          {
            character: {
              id: 1,
              name: "Luke Skywalker",
              gender: "male",
              homeworld: {
                id: 1,
                name: "Tatooine",
              },
            },
          },
        ],
      };

      (prisma.film.create as jest.Mock).mockResolvedValue(createdFilm);

      const result = await service.create(createFilmDto);

      expect(result).toEqual(
        plainToInstance(FilmDto, {
          id: 1,
          title: "Test Film",
          opening_crawl: "A long time ago...",
          director: "George Lucas",
          producer: "Gary Kurtz",
          release_date: new Date("1977-05-25"),
          characters: [
            {
              id: 1,
              name: "Luke Skywalker",
              gender: "male",
              homeworld: {
                id: 1,
                name: "Tatooine",
              },
            },
          ],
        })
      );

      expect(prisma.film.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Test Film",
          opening_crawl: "A long time ago...",
          director: "George Lucas",
          producer: "Gary Kurtz",
          release_date: new Date("1977-05-25"),
        }),
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
    });
  });

  describe("getFilms", () => {
    it("should return paginated films", async () => {
      const getFilmsDto: PaginationDto = { skip: 0, take: 10 };

      const films = [
        {
          id: 1,
          title: "Test Film",
        },
      ];
      const total = 1;

      (prisma.film.findMany as jest.Mock).mockResolvedValue(films);
      (prisma.film.count as jest.Mock).mockResolvedValue(total);

      const result = await service.getFilms(getFilmsDto);

      expect(result).toEqual({
        films: plainToInstance(FilmDto, films),
        total,
        skip: 0,
        take: 10,
      });

      expect(prisma.film.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          title: true,
        },
      });

      expect(prisma.film.count).toHaveBeenCalled();
    });
  });

  describe("getFilmById", () => {
    it("should return a film by id", async () => {
      const film = {
        id: 1,
        title: "Test Film",
        opening_crawl: "A long time ago...",
        director: "George Lucas",
        producer: "Gary Kurtz",
        release_date: new Date("1977-05-25"),
        characters: [
          {
            character: {
              id: 1,
              name: "Luke Skywalker",
              gender: "male",
              homeworld: {
                id: 1,
                name: "Tatooine",
              },
            },
          },
        ],
      };

      (prisma.film.findUnique as jest.Mock).mockResolvedValue(film);

      const result = await service.getFilmById(1);

      expect(result).toEqual(
        plainToInstance(FilmDto, {
          id: 1,
          title: "Test Film",
          opening_crawl: "A long time ago...",
          director: "George Lucas",
          producer: "Gary Kurtz",
          release_date: new Date("1977-05-25"),
          characters: [
            {
              id: 1,
              name: "Luke Skywalker",
              gender: "male",
              homeworld: {
                name: "Tatooine",
              },
            },
          ],
        })
      );

      expect(prisma.film.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it("should throw NotFoundException if film not found", async () => {
      (prisma.film.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getFilmById(1)).rejects.toThrow(NotFoundException);
      expect(prisma.film.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });
  });
});
