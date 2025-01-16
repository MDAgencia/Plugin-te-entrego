import { json } from "@remix-run/node";

interface LoaderParams {
  url: string;
}

export const loader = async ({
  params,
  request,
}: {
  params: LoaderParams;
  request: Request;
}) => {
  try {
    const fullUrl = new URL(request.url);
    const searchParams = new URLSearchParams(fullUrl.search);
    const clientId = searchParams.get("clientId");
    const clientSecret = searchParams.get("clientSecret");
    const shop = searchParams.get("shop");
    const sessionToken = searchParams.get("sessionToken");

    const auth = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token: sessionToken,
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      requested_token_type:
        "urn:shopify:params:oauth:token-type:online-access-token",
    };

    if (!clientId || !clientSecret || !shop || !sessionToken) {
      return json(
        {
          error: "Missing parameters",
          message: "clientId, clientSecret, shop, or sessionToken is missing.",
        },
        { status: 400 },
      );
    }

    const req = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(auth),
    });

    if (!req.ok) {
      throw new Error(`Error: ${req.statusText}`);
    }
    const res = await req.json();
    return json(res);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return json(
        {
          error: err.name,
          message: err.message,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: "Unknown error",
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
};
