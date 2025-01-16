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
    const accessToken = searchParams.get("accessToken");
    const shop = searchParams.get("shop");
    if (!accessToken) {
      return json(
        {
          error: "Missing parameters",
          message: "missing access token param",
        },
        { status: 400 },
      );
    }
    if (!shop) {
      return json(
        {
          error: "Missing parameters",
          message: "missing access token param",
        },
        { status: 400 },
      );
    }
    const req = await fetch(`https://${shop}/admin/api/2024-01/orders.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
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
