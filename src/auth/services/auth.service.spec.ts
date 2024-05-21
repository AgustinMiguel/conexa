import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { UserService } from "../../user/services";
import { JwtPayload } from "../interfaces";
import { AuthService } from "./auth.service";

const mockUserService = {
  getUserByEmail: jest.fn(),
  getUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should return user data without password if validation is successful", async () => {
      const email = "test@example.com";
      const password = "password123";
      const user = {
        id: 1,
        email,
        password: await bcrypt.hash(password, 10),
        role: Role.USER,
      };

      mockUserService.getUserByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: 1,
        email,
        role: Role.USER,
      });
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it("should return null if validation fails", async () => {
      const email = "test@example.com";
      const password = "wrongpassword";

      mockUserService.getUserByEmail.mockResolvedValue(null);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe("login", () => {
    it("should return access token", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: Role.USER,
      };
      const payload: JwtPayload = {
        email: user.email,
        role: user.role,
        sub: user.id,
      };
      const accessToken = "access_token";

      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: accessToken });
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe("validateUserByJwt", () => {
    it("should return user data if validation is successful", async () => {
      const payload: JwtPayload = {
        email: "test@example.com",
        role: Role.USER,
        sub: 1,
      };
      const user = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };

      mockUserService.getUser.mockResolvedValue(user);

      const result = await service.validateUserByJwt(payload);

      expect(result).toEqual(user);
      expect(userService.getUser).toHaveBeenCalledWith({ id: payload.sub });
    });

    it("should throw UnauthorizedException if user is not found", async () => {
      const payload: JwtPayload = {
        email: "test@example.com",
        role: Role.USER,
        sub: 1,
      };

      mockUserService.getUser.mockResolvedValue(null);

      await expect(service.validateUserByJwt(payload)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userService.getUser).toHaveBeenCalledWith({ id: payload.sub });
    });
  });
});
