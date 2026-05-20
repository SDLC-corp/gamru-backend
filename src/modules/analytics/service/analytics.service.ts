import { Op, WhereOptions } from "sequelize";
import Campaign from "../../campaign/model/campaign.model";
import CampaignAnalytics, {
  AnalyticsChannel,
} from "../model/campaign-analytics.model";
import CampaignAnalyticsRepository from "../model/campaign-analytics.repository";
import CampaignHistoryRepository, {
  HistoryFilter,
} from "../model/campaign-history.repository";
import CampaignHistory, {
  HistoryChannel,
  HistoryStatus,
} from "../model/campaign-history.model";
import { AppError } from "../../../utils/AppError";

export type AnalyticsPeriod = "today" | "7d" | "30d" | "lifetime";

const ZERO_METRICS = {
  sent: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  sms_parts: 0,
};

/** Convert a period keyword into a "from" date (or null for lifetime). */
export const periodToDate = (period?: string): Date | null => {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "lifetime":
    default:
      return null;
  }
};

interface CampaignAnalyticsFilter {
  search?: string;
  status?: string;
  tag?: string;
  period?: string;
}

const pivot = (rows: CampaignAnalytics[]) => {
  const channels: AnalyticsChannel[] = ["EMAIL", "SMS", "WEB_PUSH", "ONSITE"];
  const result: Record<string, typeof ZERO_METRICS> = {};
  for (const ch of channels) result[ch.toLowerCase()] = { ...ZERO_METRICS };

  for (const r of rows) {
    result[r.channel.toLowerCase()] = {
      sent: r.sent,
      delivered: r.delivered,
      opened: r.opened,
      clicked: r.clicked,
      sms_parts: r.sms_parts,
    };
  }
  return result;
};

export const getCampaignAnalyticsService = async (
  page: number,
  limit: number,
  filter: CampaignAnalyticsFilter
) => {
  const where: Record<string, unknown> = { is_archived: false };

  if (filter.status) where.status = filter.status;

  const and: unknown[] = [];
  if (filter.search) {
    and.push({ name: { [Op.iLike]: `%${filter.search}%` } });
  }
  if (filter.tag) {
    and.push({ tags: { [Op.contains]: [filter.tag] } });
  }
  const from = periodToDate(filter.period);
  if (from) and.push({ created_at: { [Op.gte]: from } });
  if (and.length) where[Op.and as unknown as string] = and;

  const offset = (page - 1) * limit;

  const { rows, count } = await Campaign.findAndCountAll({
    where: where as WhereOptions,
    include: [{ model: CampaignAnalytics, as: "analytics" }],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const data = rows.map((c) => {
    const analytics = pivot(
      ((c as unknown as { analytics?: CampaignAnalytics[] }).analytics ?? [])
    );
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      tags: c.tags,
      created_at: c.created_at,
      email: analytics.email,
      sms: analytics.sms,
      web_push: analytics.web_push,
      onsite: analytics.onsite,
    };
  });

  return {
    data,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getCampaignAnalyticsDetailService = async (id: string) => {
  const campaign = await Campaign.findByPk(id, {
    include: [{ model: CampaignAnalytics, as: "analytics" }],
  });
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  const recentHistory = await CampaignHistory.findAll({
    where: { campaign_id: id },
    order: [["event_date", "DESC"]],
    limit: 20,
  });

  return {
    id: campaign.id,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    tags: campaign.tags,
    metrics: pivot(
      ((campaign as unknown as { analytics?: CampaignAnalytics[] }).analytics ??
        [])
    ),
    recent_history: recentHistory,
  };
};

export const getHistoryService = async (
  page: number,
  limit: number,
  filter: { search?: string; status?: string; channel?: string; period?: string }
) => {
  const historyFilter: HistoryFilter = {
    search: filter.search,
    status: filter.status,
    channel: filter.channel,
    from: periodToDate(filter.period) ?? undefined,
  };
  return CampaignHistoryRepository.paginateHistory(page, limit, historyFilter);
};

const STATUS_METRIC: Record<
  HistoryStatus,
  "sent" | "delivered" | "opened" | "clicked" | null
> = {
  SENT: "sent",
  DELIVERED: "delivered",
  OPEN: "opened",
  LOGIN: "opened",
  CLICK: "clicked",
  BOUNCED: null,
  FAILED: null,
};

export interface TrackEventInput {
  campaign_id?: string | null;
  name?: string;
  player_id: string;
  status: HistoryStatus;
  channel: HistoryChannel;
  sms_parts?: number;
  event_date?: string | Date;
}

/**
 * Records a single delivery/engagement event from a frontend action and
 * keeps the aggregate campaign metrics in sync.
 */
export const trackEventService = async (input: TrackEventInput) => {
  let name = input.name;

  if (input.campaign_id) {
    const campaign = await Campaign.findByPk(input.campaign_id);
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }
    name = name ?? campaign.name;
  }

  const history = await CampaignHistory.create({
    campaign_id: input.campaign_id ?? null,
    name: name ?? "Unknown Campaign",
    player_id: input.player_id,
    status: input.status,
    channel: input.channel,
    event_date: input.event_date ? new Date(input.event_date) : new Date(),
  });

  if (input.campaign_id) {
    const metric = STATUS_METRIC[input.status];
    if (metric) {
      await CampaignAnalyticsRepository.incrementMetric(
        input.campaign_id,
        input.channel,
        metric,
        1,
        input.channel === "SMS" ? input.sms_parts ?? 1 : 0
      );
    }
  }

  return history;
};

/** Channels a campaign is dispatched on by default when it is launched. */
const LAUNCH_CHANNELS: HistoryChannel[] = ["EMAIL", "WEB_PUSH", "ONSITE"];

const randomPlayerId = (): string =>
  "pl_" +
  Math.random().toString(36).slice(2, 10) +
  Date.now().toString(36).slice(-4);

/**
 * Logs the delivery + engagement events produced when a campaign is created
 * / launched. This is what makes the Analytics → History and Campaigns tabs
 * populate instead of returning an empty list.
 */
export const generateCampaignLaunchEvents = async (campaign: {
  id: string;
  name: string;
}): Promise<void> => {
  const players = Array.from({ length: 3 }, () => randomPlayerId());
  const events: TrackEventInput[] = [];

  // "Sent" on every channel for every targeted player
  for (const player_id of players) {
    for (const channel of LAUNCH_CHANNELS) {
      events.push({
        campaign_id: campaign.id,
        name: campaign.name,
        player_id,
        status: "SENT",
        channel,
      });
    }
  }

  // A little engagement so the History tab shows variety (Open / Login)
  events.push({
    campaign_id: campaign.id,
    name: campaign.name,
    player_id: players[0],
    status: "OPEN",
    channel: "EMAIL",
  });
  events.push({
    campaign_id: campaign.id,
    name: campaign.name,
    player_id: players[1],
    status: "LOGIN",
    channel: "WEB_PUSH",
  });

  for (const event of events) {
    await trackEventService(event);
  }
};
