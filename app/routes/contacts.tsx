import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect } from "react";

import { createEmptyContact, getContacts } from "../data.server";
import { accessTokenCookie, refreshTokenCookie } from "~/cookies.server";
import { authenticateWithJwt } from "~/authentication.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "NEW_CONTACT") {
    const contact = await createEmptyContact();
    return redirect(`${contact.id}/edit`);
  } else if (intent === "LOGOUT") {
    return redirect("/", {
      headers: [
        [
          "Set-Cookie",
          await accessTokenCookie.serialize("", {
            maxAge: 0,
            expires: new Date(0),
          }),
        ],
        [
          "Set-Cookie",
          await refreshTokenCookie.serialize("", {
            maxAge: 0,
            expires: new Date(0),
          }),
        ],
      ],
    });
  } else {
    throw new Error("Wrong intent");
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const { accessToken } = await authenticateWithJwt(request);
  const contacts = await getContacts(q, accessToken);
  return json({ contacts, q });
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>
          Remix Contacts
          <Form method="post">
            <input type="hidden" name="intent" value="LOGOUT" />
            <button type="submit">Logout</button>
          </Form>
        </h1>
        <div>
          <Form
            id="search-form"
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, { replace: !isFirstSearch });
            }}
            role="search"
          >
            <input
              aria-label="Search contacts"
              className={searching ? "loading" : ""}
              defaultValue={q || ""}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="NEW_CONTACT" />
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={`${contact.id}`}
                  >
                    {contact.firstName || contact.lastName ? (
                      <>
                        {contact.firstName} {contact.lastName}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite ? <span>★</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        className={
          navigation.state === "loading" && !searching ? "loading" : ""
        }
        id="detail"
      >
        <Outlet />
      </div>
    </>
  );
}
