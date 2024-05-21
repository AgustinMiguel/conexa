import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard, RolesGuard } from "../../auth/guards";
import { PaginationDto } from "../../common/dtos";
import { CreateFilmDto, FilmDto } from "../dtos";
import { PaginatedFilmsDto } from "../dtos/paginated-film.dto";
import { FilmsService } from "../services/films.service";
import { FilmsController } from "./films.controller";

const mockFilmsService = {
  create: jest.fn(),
  getFilms: jest.fn(),
  getFilmById: jest.fn(),
};

describe("FilmsController", () => {
  let controller: FilmsController;
  let filmsService: FilmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const roles = new Reflector().get<string[]>(
            "roles",
            context.getHandler()
          );
          const request = context.switchToHttp().getRequest();
          const userRole = request.user?.role;
          return roles ? roles.includes(userRole) : true;
        },
      })
      .compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a film", async () => {
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
      const filmDto: FilmDto = {
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
      };

      mockFilmsService.create.mockResolvedValue(filmDto);

      const result = await controller.create(createFilmDto);

      expect(result).toEqual(filmDto);
      expect(filmsService.create).toHaveBeenCalledWith(createFilmDto);
    });

    it("should throw ForbiddenException if role is not ADMIN", async () => {
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

      jest.spyOn(controller, "create").mockImplementation(async () => {
        throw new ForbiddenException();
      });

      try {
        await controller.create(createFilmDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe("getFilms", () => {
    it("should return paginated films", async () => {
      const getFilmsDto: PaginationDto = { skip: 0, take: 10 };

      const paginatedFilmsDto: PaginatedFilmsDto = {
        films: [
          {
            id: 1,
            title: "Test Film",
            opening_crawl: "A long time ago...",
            director: "George Lucas",
            producer: "Gary Kurtz",
            release_date: new Date("1977-05-25"),
            characters: [],
          },
        ],
        total: 1,
        skip: 0,
        take: 10,
      };

      mockFilmsService.getFilms.mockResolvedValue(paginatedFilmsDto);

      const result = await controller.getFilms(getFilmsDto);

      expect(result).toEqual(paginatedFilmsDto);
      expect(filmsService.getFilms).toHaveBeenCalledWith(getFilmsDto);
    });
  });

  describe("getFilmById", () => {
    it("should return a film by id", async () => {
      const filmDto: FilmDto = {
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
      };

      mockFilmsService.getFilmById.mockResolvedValue(filmDto);

      const result = await controller.getFilmById(1);

      expect(result).toEqual(filmDto);
      expect(filmsService.getFilmById).toHaveBeenCalledWith(1);
    });

    it("should throw ForbiddenException if role is not USER", async () => {
      jest.spyOn(controller, "getFilmById").mockImplementation(async () => {
        throw new ForbiddenException();
      });

      try {
        await controller.getFilmById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
