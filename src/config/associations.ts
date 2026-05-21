import User from "../modules/user/model/user.model";
import UserLog from "../modules/user-log/model/user-log.model";
import Campaign from "../modules/campaign/model/campaign.model";
import CampaignAnalytics from "../modules/analytics/model/campaign-analytics.model";
import CampaignHistory from "../modules/analytics/model/campaign-history.model";
import Player from "../modules/player/model/player.model";
import PlayerCampaignHistory from "../modules/player/model/player-campaign-history.model";
import PlayerReward from "../modules/player/model/player-reward.model";
import PlayerLog from "../modules/player/model/player-log.model";
import Client from "../modules/client/model/client.model";
import ExternalAccount from "../modules/integration/model/external-account.model";
import GamXpTransaction from "../modules/integration/model/gam-xp-transaction.model";

export const initAssociations = () => {

    // Player → Campaign History / Rewards / Logs
    Player.hasMany(PlayerCampaignHistory, { foreignKey: "player_id", as: "campaignHistory" });
    PlayerCampaignHistory.belongsTo(Player, { foreignKey: "player_id", as: "player" });

    Player.hasMany(PlayerReward, { foreignKey: "player_id", as: "rewards" });
    PlayerReward.belongsTo(Player, { foreignKey: "player_id", as: "player" });

    Player.hasMany(PlayerLog, { foreignKey: "player_id", as: "logs" });
    PlayerLog.belongsTo(Player, { foreignKey: "player_id", as: "player" });

    // Client (tenant) → owned/introduced rows
    Client.hasMany(Player, { foreignKey: "client_id", as: "players" });
    Player.belongsTo(Client, { foreignKey: "client_id", as: "client" });

    Client.hasMany(ExternalAccount, { foreignKey: "client_id", as: "external_accounts" });
    ExternalAccount.belongsTo(Client, { foreignKey: "client_id", as: "client" });

    Client.hasMany(GamXpTransaction, { foreignKey: "client_id", as: "events" });
    GamXpTransaction.belongsTo(Client, { foreignKey: "client_id", as: "client" });

    Client.hasMany(PlayerLog, { foreignKey: "client_id", as: "player_logs" });
    PlayerLog.belongsTo(Client, { foreignKey: "client_id", as: "client" });

    // User → Logs
    User.hasMany(UserLog, {
        foreignKey: "user_id",
        as: "logs",
    });

    // Log → User
    UserLog.belongsTo(User, {
        foreignKey: "user_id",
        as: "user",
    });

    // Campaign → Analytics (per-channel metrics)
    Campaign.hasMany(CampaignAnalytics, {
        foreignKey: "campaign_id",
        as: "analytics",
    });
    CampaignAnalytics.belongsTo(Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
    });

    // Campaign → History (per-player events)
    Campaign.hasMany(CampaignHistory, {
        foreignKey: "campaign_id",
        as: "history",
    });
    CampaignHistory.belongsTo(Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
    });

    console.log("✅ Associations initialized");
};