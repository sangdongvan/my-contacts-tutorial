import type { ActionFunctionArgs } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, markAsFavoriteContact } from "../api/contact-api";
import { getAccessToken } from "~/auth/token.client";
import { authenticateOrGoLogin } from "~/auth/auth.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.id, "Missing id param");
  const { accessToken } = await authenticateOrGoLogin(request);
  const formData = await request.formData();
  await markAsFavoriteContact(
    params.id,
    formData.get("favorite") === "true",
    accessToken
  );
  return {};
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  invariant(params.id, "Missing id param");
  const token = await getAccessToken();
  const contact = await getContact(params.id, token);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
};

export default function Contact() {
  const { contact } = useLoaderData<typeof clientLoader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.firstName} ${contact.lastName} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.firstName || contact.lastName ? (
            <>
              {contact.firstName} {contact.lastName}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite favorite={contact.favorite} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ favorite }: { favorite: boolean }) {
  const fetcher = useFetcher();
  const effectiveFavorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          effectiveFavorite ? "Remove from favorites" : "Add to favorites"
        }
        name="favorite"
        value={effectiveFavorite ? "false" : "true"}
      >
        {effectiveFavorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
