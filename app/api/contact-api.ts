// @ts-ignore - no types, but it's a tiny function
import type { z } from "zod";
import type { schemas } from "./app-api.gen";
import { createApiClient } from "./app-api.gen";

const appApi = createApiClient("http://localhost:5167");

////////////////////////////////////////////////////////////////////////////////
// Handful of helper functions to be called from route loaders and actions
export async function getContacts(query: string | null, token: string) {
  let findRes = await appApi.get("/api/Contact/Find", {
    ...(query === null ? {} : { queries: { Q: query } }),
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return findRes.contacts;
}

export async function createEmptyContact(token: string) {
  let createEmptyRes = await appApi.post(
    "/api/Contact/CreateEmpty",
    undefined,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return createEmptyRes;
}

export async function getContact(id: string, token: string) {
  const findOneRes = await appApi.get("/api/Contact/FindOne", {
    queries: { Id: id },
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return findOneRes;
}

type UpdateOneRequest = z.infer<typeof schemas.UpdateOneContactRequest>;
export async function updateContact(request: UpdateOneRequest, token: string) {
  const updateOneRes = await appApi.post("/api/Contact/UpdateOne", request, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!updateOneRes) {
    throw new Error(`No contact found for ${request.id}`);
  }
}

export async function markAsFavoriteContact(
  id: string,
  favorite: boolean,
  token: string
) {
  await appApi.post(
    "/api/Contact/MarkAsFavorite",
    {
      id,
      favorite,
    },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
}

export async function deleteContact(id: string, token: string) {
  await appApi.post(
    "/api/Contact/DeleteOne",
    {
      id,
    },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
}
