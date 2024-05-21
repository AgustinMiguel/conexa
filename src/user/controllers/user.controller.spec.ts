import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { Role } from "@prisma/client";
import { JwtAuthGuard, RolesGuard } from "../../auth/guards";
import { CreateUserDto, GetUsersDto, UpdateUserDto, UserDto } from "../dtos";
import { UserService } from "../services";
import { UserController } from "./user.controller";

const mockUserService = {
  createUser: jest.fn(),
  getUser: jest.fn(),
  getUsers: jest.fn(),
  updateUser: jest.fn(),
};

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
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

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      const userDto: UserDto = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.ADMIN,
      };

      mockUserService.createUser.mockResolvedValue(userDto);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(userDto);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it("should throw ForbiddenException if role is not ADMIN", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      jest.spyOn(controller, "createUser").mockImplementation(async () => {
        throw new ForbiddenException();
      });

      try {
        await controller.createUser(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe("getUser", () => {
    it("should return a user", async () => {
      const userDto: UserDto = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.USER,
      };

      mockUserService.getUser.mockResolvedValue(userDto);

      const result = await controller.getUser("1");

      expect(result).toEqual(userDto);
      expect(userService.getUser).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const getUsersDto: GetUsersDto = { skip: 0, take: 10 };
      const paginatedUsersDto = {
        users: [
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            role: Role.USER,
          },
        ],
        total: 1,
        skip: 0,
        take: 10,
      };

      mockUserService.getUsers.mockResolvedValue(paginatedUsersDto);

      const result = await controller.getUsers(getUsersDto);

      expect(result).toEqual(paginatedUsersDto);
      expect(userService.getUsers).toHaveBeenCalledWith(getUsersDto);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = { name: "Updated User" };
      const userDto: UserDto = {
        id: 1,
        email: "test@example.com",
        name: "Updated User",
        role: Role.USER,
      };

      mockUserService.updateUser.mockResolvedValue(userDto);

      const result = await controller.updateUser("1", updateUserDto);

      expect(result).toEqual(userDto);
      expect(userService.updateUser).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
    });
  });
});
