import { z } from "zod";

export type Config = {
  databaseUrl: string;
  port: number;
  adminOrigin: string;
  adminGatewaySecret: string;
  cookieSecure: boolean;
  mediaDir: string;
  nodeEnv: "development" | "test" | "production";
};

const httpUrl = z
  .string()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "must be an http(s) URL");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  ADMIN_ORIGIN: httpUrl,
  ADMIN_GATEWAY_SECRET: z.string().min(32),
  COOKIE_SECURE: z.string().optional(),
  MEDIA_DIR: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new Error(`Invalid environment variables: ${names.join(", ")}`);
  }
  const data = result.data;
  return {
    databaseUrl: data.DATABASE_URL,
    port: data.PORT,
    adminOrigin: data.ADMIN_ORIGIN,
    adminGatewaySecret: data.ADMIN_GATEWAY_SECRET,
    cookieSecure: data.COOKIE_SECURE === "true",
    mediaDir: data.MEDIA_DIR,
    nodeEnv: data.NODE_ENV,
  };
}
