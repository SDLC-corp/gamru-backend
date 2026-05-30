import { Op, WhereOptions } from "sequelize";

/**
 * Segment rule engine.
 *
 * A segment's `content` JSONB holds a rule tree: a top-level group whose
 * `rules` are either leaf conditions (`field`/`op`/`value`) or nested groups
 * (`match`/`rules`). This module owns two things:
 *   1. SEGMENT_FIELDS — the catalog of player attributes that can be filtered
 *      on. Every entry maps 1:1 to a real, queryable Player column / JSON path,
 *      so the audience count is always truthful.
 *   2. buildSegmentWhere() — translates a rule tree into a Sequelize WHERE so
 *      `playerRepository.count(where)` returns the matching audience size.
 */

export type FieldKind =
  | "string"
  | "number"
  | "date"
  | "boolean"
  | "enum"
  | "tags"
  | "jsonBool";

interface FieldDef {
  /** Display label (also surfaced to the frontend catalog). */
  label: string;
  /** Catalog grouping for the field dropdown. */
  group: string;
  kind: FieldKind;
  /** Player column the field maps to (or the JSONB column for jsonBool). */
  column: string;
  /** For jsonBool: the key inside the JSONB column. */
  subKey?: string;
  /** For enum: the allowed values. */
  options?: string[];
}

export const SEGMENT_FIELDS: Record<string, FieldDef> = {
  // ─── Profile ─────────────────────────────────────────────────────
  country: { label: "Country", group: "Profile", kind: "string", column: "country" },
  city: { label: "City", group: "Profile", kind: "string", column: "city" },
  language: { label: "Language", group: "Profile", kind: "string", column: "language" },
  registration_date: {
    label: "Registered at",
    group: "Profile",
    kind: "date",
    column: "registration_date",
  },

  // ─── Status ──────────────────────────────────────────────────────
  status: {
    label: "Player status",
    group: "Status",
    kind: "enum",
    column: "status",
    options: ["ACTIVE", "INACTIVE", "BLOCKED", "N/A"],
  },
  account_status: {
    label: "Account status",
    group: "Status",
    kind: "string",
    column: "account_status",
  },
  gamification_active: {
    label: "Gamification active",
    group: "Status",
    kind: "boolean",
    column: "gamification_active",
  },

  // ─── Gamification ────────────────────────────────────────────────
  level: { label: "Level", group: "Gamification", kind: "number", column: "level" },
  xp_points: { label: "XP points", group: "Gamification", kind: "number", column: "xp_points" },
  rank_name: { label: "Rank", group: "Gamification", kind: "string", column: "rank_name" },
  tokens: { label: "Tokens", group: "Gamification", kind: "number", column: "tokens" },

  // ─── Contact ─────────────────────────────────────────────────────
  email: { label: "Email", group: "Contact", kind: "string", column: "email" },
  mobile_number: { label: "Mobile", group: "Contact", kind: "string", column: "mobile_number" },

  // ─── CRM ─────────────────────────────────────────────────────────
  tags: { label: "Tag", group: "CRM", kind: "tags", column: "tags" },
  consent_email: {
    label: "Email marketing consent",
    group: "CRM",
    kind: "jsonBool",
    column: "consents",
    subKey: "email",
  },
  consent_sms: {
    label: "SMS marketing consent",
    group: "CRM",
    kind: "jsonBool",
    column: "consents",
    subKey: "sms",
  },
  consent_push: {
    label: "Push marketing consent",
    group: "CRM",
    kind: "jsonBool",
    column: "consents",
    subKey: "push",
  },
};

/** Operators valid for each field kind — mirrored by the frontend catalog. */
export const OPERATORS_BY_KIND: Record<FieldKind, string[]> = {
  string: ["equals", "not_equals", "contains", "starts_with", "is_set", "is_not_set"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte"],
  date: ["before", "after", "in_last_days"],
  boolean: ["is_true", "is_false"],
  enum: ["equals", "not_equals"],
  tags: ["includes", "not_includes"],
  jsonBool: ["is_true", "is_false"],
};

export interface RuleCondition {
  field?: string;
  op?: string;
  value?: unknown;
  not?: boolean;
}

export interface RuleGroup {
  match?: "AND" | "OR";
  rules?: Array<RuleCondition | RuleGroup>;
}

export type SegmentContent = RuleGroup & {
  type?: string;
  refresh?: { mode?: string; everyMinutes?: number };
};

const isGroup = (node: RuleCondition | RuleGroup): node is RuleGroup =>
  Array.isArray((node as RuleGroup).rules);

const hasValue = (v: unknown): boolean =>
  v !== undefined && v !== null && String(v).trim() !== "";

/** Build the WHERE fragment for a single leaf condition, or null to skip. */
const translateCondition = (cond: RuleCondition): WhereOptions | null => {
  if (!cond.field || !cond.op) return null;
  const def = SEGMENT_FIELDS[cond.field];
  if (!def) return null;

  const { column, kind, subKey } = def;
  const value = cond.value;
  let clause: WhereOptions | null = null;

  switch (kind) {
    case "string":
    case "enum": {
      if (cond.op === "is_set") clause = { [column]: { [Op.ne]: null } };
      else if (cond.op === "is_not_set") clause = { [column]: { [Op.is]: null } };
      else if (!hasValue(value)) return null;
      else if (cond.op === "equals") clause = { [column]: value };
      else if (cond.op === "not_equals") clause = { [column]: { [Op.ne]: value } };
      else if (cond.op === "contains")
        clause = { [column]: { [Op.iLike]: `%${value}%` } };
      else if (cond.op === "starts_with")
        clause = { [column]: { [Op.iLike]: `${value}%` } };
      break;
    }

    case "number": {
      if (!hasValue(value)) return null;
      const num = Number(value);
      if (!Number.isFinite(num)) return null;
      const map: Record<string, symbol> = {
        eq: Op.eq,
        ne: Op.ne,
        gt: Op.gt,
        gte: Op.gte,
        lt: Op.lt,
        lte: Op.lte,
      };
      const operator = map[cond.op];
      if (operator) clause = { [column]: { [operator]: num } };
      break;
    }

    case "date": {
      if (!hasValue(value)) return null;
      if (cond.op === "in_last_days") {
        const days = Number(value);
        if (!Number.isFinite(days)) return null;
        const since = new Date(Date.now() - days * 86_400_000);
        clause = { [column]: { [Op.gte]: since } };
      } else {
        const date = new Date(String(value));
        if (Number.isNaN(date.getTime())) return null;
        if (cond.op === "before") clause = { [column]: { [Op.lt]: date } };
        else if (cond.op === "after") clause = { [column]: { [Op.gt]: date } };
      }
      break;
    }

    case "boolean":
    case "jsonBool": {
      const truthy = cond.op === "is_true";
      if (kind === "boolean") {
        clause = { [column]: truthy };
      } else if (subKey) {
        // JSONB containment (`@>`) keeps this type-safe — no text/boolean cast.
        clause = { [column]: { [Op.contains]: { [subKey]: truthy } } };
      }
      break;
    }

    case "tags": {
      if (!hasValue(value)) return null;
      const contains = { [column]: { [Op.contains]: [value] } };
      clause = cond.op === "not_includes" ? { [Op.not]: contains } : contains;
      break;
    }
  }

  if (!clause) return null;
  // The per-row NOT toggle negates the whole built clause.
  return cond.not ? { [Op.not]: clause } : clause;
};

const translateNode = (node: RuleCondition | RuleGroup): WhereOptions | null => {
  if (isGroup(node)) {
    const children = (node.rules ?? [])
      .map(translateNode)
      .filter((c): c is WhereOptions => c !== null);
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    const combinator = node.match === "OR" ? Op.or : Op.and;
    return { [combinator]: children };
  }
  return translateCondition(node);
};

/**
 * Translate a segment rule tree into a Sequelize WHERE. An empty / all-invalid
 * tree returns `{}` (match every player), which is the correct audience for a
 * segment with no conditions yet.
 */
export const buildSegmentWhere = (
  content: SegmentContent | null | undefined
): WhereOptions => {
  if (!content) return {};
  return translateNode(content) ?? {};
};
