import { z } from "zod";

import { httpClient } from "@/lib/session/session";

export const emailTemplateSchema = z.object({
  name: z.string(),
  slug: z.string(),
  subject: z.string(),
  content: z.string(),
  variables: z.array(z.string()),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paginatedEmailTemplatesSchema = z.object({
  data: z.array(emailTemplateSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type EmailTemplateDTO = z.infer<typeof emailTemplateSchema>;
export type PaginatedEmailTemplates = z.infer<typeof paginatedEmailTemplatesSchema>;

export interface CreateEmailTemplatePayload {
  name: string;
  slug: string;
  subject: string;
  content: string;
  variables?: string[];
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateEmailTemplatePayload {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  imageUrl?: string;
  isActive?: boolean;
}

export interface SendTestEmailPayload {
  useCase: string;
  to: string;
  variables?: Record<string, string>;
}

export interface EmailTemplatesQuery {
  page: number;
  limit: number;
  active?: boolean;
}

/**
 * @returns The api-user query; the tri-state `active` filter becomes a boolean and an absent
 * filter stays absent, matching `ListTemplatesQueryDTO` where only `true` filters.
 */
export function emailTemplatesQueryFromFilters(
  page: number,
  limit: number,
  active: string | undefined,
): EmailTemplatesQuery {
  return {
    page,
    limit,
    active: active === undefined ? undefined : active === "true",
  };
}

/**
 * @param query - pagination is always sent; the API answers a paginated envelope.
 * @returns The validated paginated envelope, so a contract drift fails here and not in the table.
 */
export async function fetchEmailTemplates(
  query: EmailTemplatesQuery,
): Promise<PaginatedEmailTemplates> {
  const search = new URLSearchParams();

  search.set("page", String(query.page));
  search.set("limit", String(query.limit));
  if (query.active !== undefined) {
    search.set("active", String(query.active));
  }

  const raw = await httpClient.request<unknown>(`/email/templates?${search.toString()}`);

  return paginatedEmailTemplatesSchema.parse(raw);
}

/**
 * @param slug - the template slug; it is percent-encoded so a hostile slug cannot change the path.
 * @returns The validated `EmailTemplateDTO`, so a contract drift on the detail shape fails here.
 */
export async function fetchEmailTemplate(slug: string): Promise<EmailTemplateDTO> {
  const raw = await httpClient.request<unknown>(`/email/templates/${encodeURIComponent(slug)}`);

  return emailTemplateSchema.parse(raw);
}

/**
 * @param payload - the create-template body; the API echoes the stored template.
 * @returns The validated `EmailTemplateDTO`.
 */
export async function createEmailTemplate(
  payload: CreateEmailTemplatePayload,
): Promise<EmailTemplateDTO> {
  const raw = await httpClient.request<unknown>("/email/templates", {
    method: "POST",
    body: payload,
  });

  return emailTemplateSchema.parse(raw);
}

/**
 * @param slug - the template slug; it is percent-encoded so a hostile slug cannot change the path.
 * @param payload - the update body; only the changed fields travel.
 * @returns The validated `EmailTemplateDTO` echoing the patch.
 */
export async function updateEmailTemplate(
  slug: string,
  payload: UpdateEmailTemplatePayload,
): Promise<EmailTemplateDTO> {
  const raw = await httpClient.request<unknown>(`/email/templates/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: payload,
  });

  return emailTemplateSchema.parse(raw);
}

/**
 * @param slug - the template slug; it is percent-encoded so a hostile slug cannot change the path.
 * The endpoint answers 204 with no body, and the shared client maps that to `undefined`.
 */
export async function deleteEmailTemplate(slug: string): Promise<undefined> {
  await httpClient.request<undefined>(`/email/templates/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

/**
 * @param payload - the test-send body: template slug as `useCase`, recipient and sample variables.
 * @returns The validated status envelope (`{ status }`), so a drift fails here.
 */
export async function sendTestEmail(payload: SendTestEmailPayload): Promise<{ status: string }> {
  const raw = await httpClient.request<unknown>("/email/send", {
    method: "POST",
    body: payload,
  });

  return z.object({ status: z.string() }).parse(raw);
}
