import { BaseRepository } from "../../../core/models/base.repository";
import CampaignAnalytics, {
  AnalyticsChannel,
} from "./campaign-analytics.model";

class CampaignAnalyticsRepository extends BaseRepository<CampaignAnalytics> {
  constructor() {
    super(CampaignAnalytics);
  }

  async findByCampaignAndChannel(
    campaignId: string,
    channel: AnalyticsChannel
  ) {
    return this.findOne({ campaign_id: campaignId, channel });
  }

  async incrementMetric(
    campaignId: string,
    channel: AnalyticsChannel,
    metric: "sent" | "delivered" | "opened" | "clicked",
    by = 1,
    smsParts = 0
  ) {
    const existing = await this.findByCampaignAndChannel(campaignId, channel);

    if (!existing) {
      return this.create({
        campaign_id: campaignId,
        channel,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        sms_parts: smsParts,
        [metric]: by,
      });
    }

    existing.set(metric, (existing.get(metric) as number) + by);
    if (smsParts) {
      existing.set("sms_parts", existing.sms_parts + smsParts);
    }
    await existing.save();
    return existing;
  }
}

export default new CampaignAnalyticsRepository();
