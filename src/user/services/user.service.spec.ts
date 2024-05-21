import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../common/prisma.service";
import { CreateUserDto, GetUsersDto, UpdateUserDto, UserDto } from "../dtos";
import { UserService } from "./user.service";

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("mocked-hash"),
}));

describe("UserService", () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe("createUser", () => {
    it("should create a user and return UserDto", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const hashedPassword = "mocked-hash";
      const createdUser = { id: 1, ...createUserDto, password: hashedPassword };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    });

    it("should throw BadRequestException on error", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error("Error"));

      await expect(
        service.createUser({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getUser", () => {
    it("should return a user by unique input", async () => {
      const userWhereUniqueInput: Prisma.UserWhereUniqueInput = { id: 1 };
      const foundUser = { id: 1, email: "test@example.com", name: "Test User" };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(foundUser);

      const result = await service.getUser(userWhereUniqueInput);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: userWhereUniqueInput,
      });
    });

    it("should throw an error if user not found", async () => {
      const userWhereUniqueInput: Prisma.UserWhereUniqueInput = { id: 1 };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error("User not found")
      );

      await expect(service.getUser(userWhereUniqueInput)).rejects.toThrow(
        Error
      );
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: userWhereUniqueInput,
      });
    });
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const getUsersDto: GetUsersDto = { skip: 0, take: 10 };
      const foundUsers = [
        { id: 1, email: "test@example.com", name: "Test User" },
      ];
      const totalUsers = 1;

      (prisma.user.findMany as jest.Mock).mockResolvedValue(foundUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(totalUsers);

      const result = await service.getUsers(getUsersDto);

      expect(result).toEqual({
        users: plainToInstance(UserDto, foundUsers),
        total: totalUsers,
        skip: 0,
        take: 10,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe("updateUser", () => {
    it("should update a user and return UserDto", async () => {
      const updateUserParams = {
        where: { id: 1 },
        data: { name: "Updated User" } as UpdateUserDto,
      };
      const updatedUser = {
        id: 1,
        email: "test@example.com",
        name: "Updated User",
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        updatedUser
      );
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUser(updateUserParams);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Updated User",
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        data: updateUserParams.data,
        where: updateUserParams.where,
      });
    });

    it("should throw an error if user not found", async () => {
      const updateUserParams = {
        where: { id: 1 },
        data: { name: "Updated User" } as UpdateUserDto,
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error("User not found")
      );

      await expect(service.updateUser(updateUserParams)).rejects.toThrow(Error);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: updateUserParams.where,
      });
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const email = "test@example.com";
      const foundUser = { id: 1, email: "test@example.com", name: "Test User" };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(foundUser);

      const result = await service.getUserByEmail(email);

      expect(result).toEqual(foundUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it("should return null if user not found", async () => {
      const email = "test@example.com";

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserByEmail(email);

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
