import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <p id="index-page">
      This is a demo for Remix.
      <br />
      <Link to="/login">Go to login</Link>
    </p>
  );
}
