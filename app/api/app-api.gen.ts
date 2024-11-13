import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CreateUserRequest = z.object({ email: z.string(), password: z.string() });
const GetUserTokenResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
const CreateUserResponse = z.object({
  id: z.string(),
  email: z.string(),
  token: GetUserTokenResponse.optional(),
});
const GetUserTokenRequest = z.object({
  email: z.string(),
  password: z.string(),
  twoFactorCode: z.string().nullish(),
  twoFactorRecoveryCode: z.string().nullish(),
});
const FindOneContactResponse = z.object({
  id: z.string(),
  avatar: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  twitter: z.string(),
  notes: z.string(),
  favorite: z.boolean(),
});
const FindContactsResponse = z.object({
  contacts: z.array(FindOneContactResponse),
});
const DeleteOneContactRequest = z.object({ id: z.string() });
const UpdateOneContactRequest = z.object({
  id: z.string(),
  avatar: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  twitter: z.string().nullish(),
  notes: z.string().nullish(),
  favorite: z.boolean().nullish(),
});
const MarkAsFavoriteContactRequest = z.object({
  id: z.string(),
  favorite: z.boolean().optional(),
});

export const schemas = {
  CreateUserRequest,
  GetUserTokenResponse,
  CreateUserResponse,
  GetUserTokenRequest,
  FindOneContactResponse,
  FindContactsResponse,
  DeleteOneContactRequest,
  UpdateOneContactRequest,
  MarkAsFavoriteContactRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/_connect/token",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/Contact/CreateEmpty",
    requestFormat: "json",
    response: FindOneContactResponse,
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
    path: "/api/Contact/DeleteOne",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ id: z.string() }),
      },
    ],
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
    method: "get",
    path: "/api/Contact/Find",
    requestFormat: "json",
    parameters: [
      {
        name: "Q",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: FindContactsResponse,
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
    method: "get",
    path: "/api/Contact/FindOne",
    requestFormat: "json",
    parameters: [
      {
        name: "Id",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: FindOneContactResponse,
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
    path: "/api/Contact/MarkAsFavorite",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MarkAsFavoriteContactRequest,
      },
    ],
    response: FindOneContactResponse,
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
    path: "/api/Contact/UpdateOne",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateOneContactRequest,
      },
    ],
    response: FindOneContactResponse,
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
