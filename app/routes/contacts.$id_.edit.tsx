import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContact } from "../api/contact-api";
import { getAccessToken } from "~/auth/token.client";
import { authenticateOrError } from "~/auth/auth.server";
import { schemas } from "~/api/app-api.gen";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { accessToken: token, error } = await authenticateOrError(request);
  if (error) {
    return Response.json({}, { status: 401 });
  }

  // TODO: Handle validation error
  const formPayload = Object.fromEntries(await request.formData());
  const updateOneRequest = await schemas.UpdateOneContactRequest.parseAsync(
    formPayload
  );

  await updateContact(updateOneRequest, token);

  return redirect(`/contacts/${updateOneRequest.id}`);
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

export default function EditContact() {
  const { contact } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.firstName}
          aria-label="First name"
          name="firstName"
          type="text"
          placeholder="First name"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.lastName}
          name="lastName"
          placeholder="Last name"
          type="text"
        />
      </p>
      <input type="hidden" name="id" value={contact.id} />
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
      </p>
    </Form>
  );
}
