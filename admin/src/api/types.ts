import type { BlockType } from "../content/blockForms";

export type PermissionKey =
  | "users.view"
  | "users.manage"
  | "roles.manage"
  | "audit.view"
  | "content.view"
  | "content.edit"
  | "content.publish"
  | "media.manage";

export type Me = {
  id: number;
  email: string;
  fullName: string;
  mustChangePassword: boolean;
  role: { id: number; name: string; isSystem: boolean };
  permissions: PermissionKey[];
};

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string>; requestId?: string };
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export type RoleRef = { id: number; name: string; isSystem: boolean };

export type UserDto = {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: RoleRef;
};

export type RoleDto = {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionKey[];
};

export type PermissionModule = { module: string; permissions: { key: PermissionKey; label: string }[] };

export type PermissionCatalog = { modules: PermissionModule[] };

export type AuditLogDto = {
  id: number;
  action: string;
  actor: { id: number; email: string; fullName: string } | null;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
};

export type Localized = { vi: string; en: string };

export type MediaDto = {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: Localized;
  url: string;
  sourcePath: string | null;
  createdAt: string;
};

export type UserRef = { id: number; email: string; fullName: string };

export type PageListItem = {
  id: number;
  path: string;
  name: string;
  hasUnpublishedChanges: boolean;
  untranslatedCount: number;
  publishedVersion: { number: number; publishedAt: string; publishedBy: UserRef | null } | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: UserRef | null;
};

export type ContentBlock = {
  id: string;
  type: BlockType;
  hidden: boolean;
  data: Record<string, unknown>;
};

export type PageContent = {
  seo: { title: Localized; description: Localized; image: { mediaId: number } | null };
  blocks: ContentBlock[];
};

export type PageDetail = {
  id: number;
  path: string;
  name: string;
  draft: { content: PageContent; revision: number; updatedAt: string };
  published: { number: number; content: PageContent } | null;
};
