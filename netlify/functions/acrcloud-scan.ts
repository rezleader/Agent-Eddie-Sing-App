import type { Handler } from "@netlify/functions";
import ACRCloud from "acrcloud";

const client = new ACRCloud({
  host: process.env.ACRCLOUD_HOST!,
  access_key: process.env.ACRCLOUD_ACCESS_KEY!,
  access_secret: process.env.ACRCLOUD_ACCESS_SECRET!,
});

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const buffer = Buffer.from(body.audioBase64, "base64");

    const result = await client.identify(buffer);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Recognition failed" }),
    };
  }
};
