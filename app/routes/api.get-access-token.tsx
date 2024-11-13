import {
  type LoaderFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticateWithJwt } from "~/auth/auth.server";

export let loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const { accessToken } = await authenticateWithJwt(request);
  return { accessToken };
};
