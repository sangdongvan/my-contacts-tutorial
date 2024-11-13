// An ephemeral access token is intentionally persisted in memory for security purposes.
// DO NOT try to store this token in local storage or anywhere else!
let _token: string;

export async function getAccessToken(): Promise<string> {
  if (_token) {
    return _token;
  }
  const res = await fetch("/api/get-access-token");
  const json = await res.json();
  _token = json["accessToken"] as string;
  return _token;
}
