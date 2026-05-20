import UnsubscribeReportRepository, {
  UnsubscribeReportFilter,
} from "../model/unsubscribe-report.repository";
import {
  UnsubscribeReport,
  UnsubscribeChannel,
} from "../model/unsubscribe-report.model";

export interface UnsubscribeReportInput {
  player_id: string;
  campaign_name?: string | null;
  channel: UnsubscribeChannel;
  reason?: string | null;
  unsubscribed_at?: Date | string;
}

export const createUnsubscribeReportService = async (
  input: UnsubscribeReportInput
) => {
  return UnsubscribeReportRepository.create(
    input as Partial<UnsubscribeReport["_creationAttributes"]>
  );
};

export const paginateUnsubscribeReportsService = async (
  page: number,
  limit: number,
  filter: UnsubscribeReportFilter
) => {
  return UnsubscribeReportRepository.paginateReports(page, limit, filter);
};
