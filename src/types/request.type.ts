import { Request } from "express";

export interface ResolvedClient {
  id: string;
  name: string;
  slug: string;
  skin_id: string;
  status: "ENABLED" | "DISABLED";
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  client?: ResolvedClient;
}

export interface ClientRequest extends Request {
  client?: ResolvedClient;
}
