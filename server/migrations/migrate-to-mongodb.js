require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const connectDB = require('../config/db');
const User = require('../models/userModel');
const Airdrop = require('../models/airdropModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const Tracking = require('../models/trackingModel');
const View = require('../models/viewModel');

const PAGE_SIZE = 1000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const shouldClearMongo = process.env.CLEAR_MONGO === 'true';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const toDate = (value) => (value ? new Date(value) : undefined);
const toObjectId = (value) => (value ? new mongoose.Types.ObjectId(value) : undefined);

async function fetchAllRows(table, columns = '*', orderColumn = 'created_at') {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderColumn, { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed fetching ${table}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

async function ensureMongoIsEmptyOrClear() {
  const existingCounts = await Promise.all([
    User.countDocuments(),
    Airdrop.countDocuments(),
    PasswordResetToken.countDocuments(),
    Tracking.countDocuments(),
    View.countDocuments(),
  ]);

  const hasExistingData = existingCounts.some((count) => count > 0);
  if (!hasExistingData) {
    return;
  }

  if (!shouldClearMongo) {
    throw new Error(
      'MongoDB already has data. Set CLEAR_MONGO=true to wipe collections before migration.'
    );
  }

  await Promise.all([
    User.deleteMany({}),
    Airdrop.deleteMany({}),
    PasswordResetToken.deleteMany({}),
    Tracking.deleteMany({}),
    View.deleteMany({}),
  ]);

  console.log('Cleared existing MongoDB data');
}

async function migrateUsers(userIdMap) {
  const supabaseUsers = await fetchAllRows('users');
  if (supabaseUsers.length === 0) {
    return { inserted: 0, users: [] };
  }

  const userDocs = supabaseUsers.map((user) => {
    const newId = new mongoose.Types.ObjectId();
    userIdMap.set(user.id, newId.toString());

    return {
      _id: newId,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role || 'user',
      createdAt: toDate(user.created_at),
      updatedAt: toDate(user.updated_at),
    };
  });

  await User.insertMany(userDocs, { ordered: false });
  return { inserted: userDocs.length, users: supabaseUsers };
}

async function migrateAirdrops(airdropIdMap) {
  const [airdrops, socialLinksRows, telegramRows, updatesRows] = await Promise.all([
    fetchAllRows('airdrops'),
    fetchAllRows('social_links'),
    fetchAllRows('telegram_info'),
    fetchAllRows('airdrop_updates'),
  ]);

  if (airdrops.length === 0) {
    return { inserted: 0, airdrops: [] };
  }

  const socialByAirdropId = new Map();
  for (const row of socialLinksRows) {
    if (!socialByAirdropId.has(row.airdrop_id)) {
      socialByAirdropId.set(row.airdrop_id, row);
    }
  }

  const telegramByAirdropId = new Map();
  for (const row of telegramRows) {
    if (!telegramByAirdropId.has(row.airdrop_id)) {
      telegramByAirdropId.set(row.airdrop_id, row);
    }
  }

  const updatesByAirdropId = new Map();
  for (const row of updatesRows) {
    const items = updatesByAirdropId.get(row.airdrop_id) || [];
    items.push({
      content: row.content,
      date: toDate(row.created_at),
      telegramMessageId: row.telegram_message_id || null,
    });
    updatesByAirdropId.set(row.airdrop_id, items);
  }

  const airdropDocs = airdrops.map((row) => {
    const newId = new mongoose.Types.ObjectId();
    airdropIdMap.set(row.id, newId.toString());

    const social = socialByAirdropId.get(row.id);
    const telegram = telegramByAirdropId.get(row.id);

    return {
      _id: newId,
      airdropId: row.airdrop_id,
      title: row.title,
      description: row.description,
      token: row.token,
      criteria: row.criteria,
      startDate: row.start_date ? String(row.start_date) : undefined,
      status: row.status,
      costType: row.cost_type || 'free',
      link: row.link,
      claimUrl: row.claim_url || '',
      logoUrl: row.logo_url || '',
      cardColor: row.card_color || '',
      predefinedColor: row.predefined_color || 'default',
      views: row.views || 0,
      skipTelegramNotification: Boolean(row.skip_telegram_notification),
      socialLinks: {
        website: social?.website || '',
        discord: social?.discord || '',
        twitter: social?.twitter || '',
        telegram: social?.telegram || '',
        github: social?.github || '',
        instagram: social?.instagram || '',
      },
      telegram: {
        messageId: telegram?.message_id ?? null,
        chatId: telegram?.chat_id ?? null,
        lastUpdated: toDate(telegram?.last_updated) ?? null,
      },
      updates: updatesByAirdropId.get(row.id) || [],
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  });

  await Airdrop.insertMany(airdropDocs, { ordered: false });
  return { inserted: airdropDocs.length, airdrops };
}

async function migratePasswordResetTokens(userIdMap) {
  const tokens = await fetchAllRows('password_reset_tokens');
  if (tokens.length === 0) {
    return 0;
  }

  const tokenDocs = [];
  for (const token of tokens) {
    const mappedUserId = userIdMap.get(token.user_id);
    if (!mappedUserId) {
      continue;
    }

    tokenDocs.push({
      _id: new mongoose.Types.ObjectId(),
      userId: toObjectId(mappedUserId),
      token: token.token,
      createdAt: toDate(token.created_at),
    });
  }

  if (tokenDocs.length === 0) {
    return 0;
  }

  await PasswordResetToken.insertMany(tokenDocs, { ordered: false });
  return tokenDocs.length;
}

async function migrateTracking(userIdMap, airdropIdMap) {
  const trackingRows = await fetchAllRows('tracking');
  if (trackingRows.length === 0) {
    return 0;
  }

  const trackingDocs = trackingRows.map((row) => {
    const mappedUserId = userIdMap.get(row.user_id) || row.user_id;
    const rawAirdropIds = Array.isArray(row.airdrop_ids) ? row.airdrop_ids : [];

    const mappedAirdropIds = rawAirdropIds
      .map((id) => airdropIdMap.get(String(id)))
      .filter(Boolean);

    return {
      _id: new mongoose.Types.ObjectId(),
      userId: mappedUserId,
      airdropIds: mappedAirdropIds,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  });

  await Tracking.insertMany(trackingDocs, { ordered: false });
  return trackingDocs.length;
}

async function migrateViews(airdropIdMap) {
  const viewRows = await fetchAllRows('views');
  if (viewRows.length === 0) {
    return 0;
  }

  const viewDocs = [];
  for (const row of viewRows) {
    const mappedAirdropId = airdropIdMap.get(row.airdrop_id);
    if (!mappedAirdropId) {
      continue;
    }

    viewDocs.push({
      _id: new mongoose.Types.ObjectId(),
      airdropId: toObjectId(mappedAirdropId),
      timestamp: toDate(row.created_at),
      ipAddress: row.ip_address || '',
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.created_at),
    });
  }

  if (viewDocs.length === 0) {
    return 0;
  }

  const chunkSize = 1000;
  for (let i = 0; i < viewDocs.length; i += chunkSize) {
    const chunk = viewDocs.slice(i, i + chunkSize);
    await View.insertMany(chunk, { ordered: false });
  }

  return viewDocs.length;
}

async function main() {
  const userIdMap = new Map();
  const airdropIdMap = new Map();

  try {
    await connectDB();
    await ensureMongoIsEmptyOrClear();

    const userResult = await migrateUsers(userIdMap);
    const airdropResult = await migrateAirdrops(airdropIdMap);
    const tokenCount = await migratePasswordResetTokens(userIdMap);
    const trackingCount = await migrateTracking(userIdMap, airdropIdMap);
    const viewCount = await migrateViews(airdropIdMap);

    console.log('Supabase -> MongoDB migration completed');
    console.log(`Users: ${userResult.inserted}`);
    console.log(`Airdrops: ${airdropResult.inserted}`);
    console.log(`Password reset tokens: ${tokenCount}`);
    console.log(`Tracking rows: ${trackingCount}`);
    console.log(`Views: ${viewCount}`);
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
