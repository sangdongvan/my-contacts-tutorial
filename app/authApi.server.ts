import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CreateUserRequest = z.object({ email: z.string(), password: z.string() });
const GetUserTokenResponse = z
  .object({ accessToken: z.string(), refreshToken: z.string() })
  .partial();
const CreateUserResponse = z
  .object({ id: z.string(), email: z.string(), token: GetUserTokenResponse })
  .partial();
const GetUserTokenRequest = z.object({
  email: z.string(),
  password: z.string(),
  twoFactorCode: z.string().nullish(),
  twoFactorRecoveryCode: z.string().nullish(),
});
const GetContactResponse = z
  .object({
    id: z.string(),
    avatar: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    twitter: z.string(),
  })
  .partial();
const FindContactsResponse = z
  .object({ contacts: z.array(GetContactResponse) })
  .partial();

export const schemas = {
  CreateUserRequest,
  GetUserTokenResponse,
  CreateUserResponse,
  GetUserTokenRequest,
  GetContactResponse,
  FindContactsResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/_connect/token",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/Contact/Find",
    requestFormat: "json",
    response: FindContactsResponse,
  },
  {
    method: "get",
    path: "/api/message",
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/Auth/CreateUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateUserRequest,
      },
    ],
    response: CreateUserResponse,
  },
  {
    method: "post",
    path: "/Auth/GetUserToken",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GetUserTokenRequest,
      },
    ],
    response: GetUserTokenResponse,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
