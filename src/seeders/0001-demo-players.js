"use strict";

/**
 * Demo players + related history/rewards/logs so the Players UI has
 * something realistic to render out of the box.
 * Run with: npm run db:seed
 */

const J = (o) => JSON.stringify(o);
const PRIMARY_ID = "11111111-1111-1111-1111-111111111111";

const personalization = {
  casino: {
    totalTurnover: 42.7,
    gameCategory: [
      { name: "slots", perc: 97.66, turnover: 41.7 },
      { name: "mt_originals", perc: 2.34, turnover: 1 },
    ],
    gameProvider: [
      { name: "PragmaticPlay", perc: 87.75, turnover: 37.47 },
      { name: "Endorphina", perc: 9.91, turnover: 4.23 },
      { name: "MT_ORIGINALS", perc: 2.34, turnover: 1 },
    ],
    favoriteGames: [
      { position: 1, game: "Sweet Bonanza Mobile", category: "slots", turnover: 18.73, perc: 43.88 },
      { position: 2, game: "Dino Drop Mobile", category: "slots", turnover: 18.73, perc: 43.88 },
      { position: 3, game: "Hell Hot 100", category: "slots", turnover: 2.35, perc: 5.5 },
      { position: 4, game: "Blue Slot", category: "slots", turnover: 1.88, perc: 4.4 },
      { position: 5, game: "Mines", category: "mt_originals", turnover: 1, perc: 2.34 },
    ],
  },
  sports: { sports: [], tournaments: [], teams: [], markets: [] },
};

const playerData = {
  "Allow Email": true,
  "Allow On-Site Notification": true,
  "Allow Phone": true,
  "Allow Post": true,
  "Allow Push Notification": true,
  "Allow Sms": true,
  "Allow Telephone": true,
  "Birth Date": null,
  "Brand ID": null,
  City: null,
  Country: null,
  Currency: "USD",
  Email: "cepep34849@mypethealh.com",
  "First Name": "Player_T8M6hljA",
  "Gamification Opt-In": true,
  Gender: null,
  "Has In App Push Notifications Enabled": null,
  "Has Web Push Notifications Enabled": null,
  "Is Active": null,
  "Is Kyc Verified": null,
  "Kyc Verified Date": null,
  Language: null,
  "Last Login Date": "2026-04-27",
  "Last Logout Date": "2026-04-22",
  "Last Name": null,
  "Last Self Assessment Date": null,
  "Login Count": 5,
  Nationality: null,
  "Number Days In Last Two Logins": 6,
  Phone: null,
  "Player ID": "cmo6vx8i1000ijo1fxgu76jol",
  "Player Tag Categories": null,
  "Player Tags": null,
  "Postal Code": null,
  "Registration Date": "2026-04-20",
  "Registration Device": "mobile",
  "Second Last Login Date": "2026-04-22",
  "Self Assessment Count": null,
  Street: null,
  "Username": "Player_T8M6hljA",
  "Verification Channel": "EMAIL",
  "Verification Date": "2026-04-20",
};

const customData = {
  "Email Custom": true,
  "Test Notificatiom": null,
};

const transactionalData = {
  "Bonus Money Balance": 0,
  "Days In Last Deposit": 7,
  "First Deposit Amount": 8.51,
  "First Deposit Date": "2026-04-20",
  "Fourth Deposit Amount": null,
  "Fourth Deposit Date": null,
  "Gross Gaming Revenue Lifetime": 5.23,
  "Last Activity Date": "2026-04-27",
  "Last Balance Update Date": "2026-04-27",
  "Last Deposit Amount": 5.1,
  "Last Deposit Date": "2026-04-20",
  "Last Withdraw Amount": 0,
  "Last Withdraw Date": null,
  "Net Loss Lifetime": 5.23,
  "Number Of Activity Days": 0,
  "Player ID": "cmo6vx8i1000ijo1fxgu76jol",
  "Real Money Balance": 27.53,
  "RTP Calculated": true,
  "RTP Lifetime": 0,
  "Second Deposit Amount": 16.97,
  "Second Deposit Date": "2026-04-20",
  "Second Last Deposit Date": "2026-04-20",
  "Third Deposit Amount": 5.1,
  "Third Deposit Date": "2026-04-20",
  "Total Bet Amount Bonus Money": 0,
  "Total Bet Amount Real Bonus Money": 5.23,
  "Total Bet Amount Real Money": 5.23,
  "Total Bet Count Bonus Money": 0,
  "Total Bet Count Real Bonus Money": 7,
  "Total Bet Count Real Money": 7,
  "Total Deposit Amount Lifetime": 30.58,
  "Total Deposit Count Lifetime": 3,
  "Total Win Amount Bonus Money": 0,
  "Total Win Amount Real Bonus Money": 0,
  "Total Win Amount Real Money": 0,
  "Total Win Count Bonus Money": 0,
  "Total Win Count Real Bonus Money": 0,
  "Total Win Count Real Money": 0,
  "Total Withdraw Amount Lifetime": 0,
  "Total Withdraw Count Lifetime": 0,
};

const consents = {
  email: true,
  sms: true,
  onsite: true,
  push: true,
  phone: true,
  post: true,
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("players", [
      {
        id: PRIMARY_ID,
        player_id: "cmo6vx8i1000ijo1fxgu76jol",
        username: "Player_T8M6hljA",
        name: "Player_T8M6hljA",
        email: "cepep34849@mypethealh.com",
        status: "ACTIVE",
        registration_date: new Date("2026-04-20"),
        country: null,
        city: null,
        avatar_url: null,
        mobile_number: null,
        birthday: null,
        address: null,
        language: null,
        account_status: null,
        gamification_active: true,
        level: 1,
        max_level: 15,
        xp_points: 20.85,
        xp_to_next: 280,
        rank_name: "Sprout",
        tokens: 20.85,
        consents: J(consents),
        personalization: J(personalization),
        player_data: J(playerData),
        custom_data: J(customData),
        transactional_data: J(transactionalData),
        created_at: now,
        updated_at: now,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        player_id: "cofkmmajjdcmsmdemmi",
        username: "Player_kajfiaddal",
        name: null,
        email: "cepeds94974@mypethhealth.com",
        status: "N/A",
        registration_date: null,
        country: null,
        city: null,
        gamification_active: false,
        level: 1,
        max_level: 15,
        xp_points: 0,
        xp_to_next: 300,
        rank_name: "Sprout",
        tokens: 0,
        consents: J(consents),
        personalization: J({ casino: {}, sports: {} }),
        player_data: J({ "Player ID": "cofkmmajjdcmsmdemmi" }),
        custom_data: J({}),
        transactional_data: J({}),
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("player_campaign_history", [
      ["WEB_PUSH", "Web Push Notification", "ERROR"],
      ["ON_SITE", "On Site Notification", "OPEN"],
      ["EMAIL", "Email", "SENT"],
      ["WEB_PUSH", "Web Push Notification", "ERROR"],
      ["ON_SITE", "On Site Notification", "OPEN"],
    ].map(([channel, title, status], i) => ({
      id: `aaaa0000-0000-0000-0000-00000000000${i + 1}`,
      player_id: PRIMARY_ID,
      channel,
      title,
      status,
      event_label: "Registration - Push",
      event_at: new Date("2026-04-20T07:40:11Z"),
      created_at: now,
      updated_at: now,
    })));

    await queryInterface.bulkInsert(
      "player_rewards",
      [1, 2].map((i) => ({
        id: `bbbb0000-0000-0000-0000-00000000000${i}`,
        player_id: PRIMARY_ID,
        status: "IN_PROGRESS",
        granted_date: new Date("2026-01-23T14:55:00Z"),
        gamification_source: "Missions",
        reward_type: "Bonus Offer",
        reward: "fssbgmoeijocnocmoanczco",
        is_manual: false,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("player_logs", null, {});
    await queryInterface.bulkDelete("player_rewards", null, {});
    await queryInterface.bulkDelete("player_campaign_history", null, {});
    await queryInterface.bulkDelete("players", null, {});
  },
};
