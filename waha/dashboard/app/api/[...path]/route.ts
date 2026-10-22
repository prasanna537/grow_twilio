import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getUpstreamConfig() {
  const baseUrl =
    process.env.WAHA_BASE_URL ||
    process.env.NEXT_PUBLIC_WAHA_BASE_URL ||
    "http://localhost:3010";

  const apiKey =
    process.env.WAHA_API_KEY ||
    process.env.NEXT_PUBLIC_WAHA_API_KEY ||
    "";

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
  };
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathStr = path.join("/");
  const url = new URL(req.url);
  const search = url.search;

  const { baseUrl, apiKey } = getUpstreamConfig();
  const targetUrl = `${baseUrl}/api/${pathStr}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!["host", "connection", "content-length"].includes(lowerKey)) {
      headers.set(key, value);
    }
  });

  // Attach API key: prefer client-provided key, fallback to server secret
  const clientApiKey = req.headers.get("x-api-key");
  if (clientApiKey) {
    headers.set("x-api-key", clientApiKey);
  } else if (apiKey) {
    headers.set("x-api-key", apiKey);
  }

  let body: BodyInit | null = null;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      body = await req.arrayBuffer();
    } catch {
      body = null;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(lowerKey)) {
        responseHeaders.set(key, val);
      }
    });

    const responseData = await upstreamRes.arrayBuffer();
    return new NextResponse(responseData, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        message: `Proxy failed to connect to WAHA backend at ${baseUrl}: ${err.message}`,
        statusCode: 502,
      },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
