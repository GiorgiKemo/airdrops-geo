require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/userModel');
const Airdrop = require('../models/airdropModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const Tracking = require('../models/trackingModel');
const View = require('../models/viewModel');

const DEFAULT_DUMP_PATH = path.resolve(
  __dirname,
  'backup',
  'db_cluster-30-04-2025@06-21-15.sql'
);

const dumpPath = process.env.PG_DUMP_PATH || DEFAULT_DUMP_PATH;
const shouldClearMongo = process.env.CLEAR_MONGO === 'true';

const toDate = (value) => (value ? new Date(value) : null);
const toBool = (value) => value === 't' || value === 'true' || value === '1';

const decodeCopyValue = (value) => {
  if (value === '\\N') {
    return null;
  }

  return value
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\\\/g, '\\');
};

const parseCopyTables = (sqlContent) => {
  const normalized = sqlContent.replace(/\r/g, '');
  const lines = normalized.split('\n');
  const tables = {};

  let activeTable = null;
  let activeColumns = [];

  for (const line of lines) {
    const copyMatch = line.match(/^COPY public\.([a-zA-Z0-9_]+) \(([^)]+)\) FROM stdin;$/);
    if (copyMatch) {
      activeTable = copyMatch[1];
      activeColumns = copyMatch[2].split(',').map((column) => column.trim());
      tables[activeTable] = tables[activeTable] || [];
      continue;
    }

    if (!activeTable) {
      continue;
    }

    if (line === '\\.') {
      activeTable = null;
      activeColumns = [];
      continue;
    }

    if (!line.length) {
      continue;
    }

    const values = line.split('\t').map(decodeCopyValue);
    const row = {};
    activeColumns.forEach((column, index) => {
      row[column] = values[index] ?? null;
    });
    tables[activeTable].push(row);
  }

  return tables;
};

const ensureMongoIsEmptyOrClear = async () => {
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
      'MongoDB already has data. Set CLEAR_MONGO=true to wipe collections before import.'
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
};

const migrateUsers = async (rows, userIdMap) => {
  if (!rows.length) {
    return 0;
  }

  const docs = rows.map((row, index) => {
    const mongoId = new mongoose.Types.ObjectId();
    userIdMap.set(row.id, mongoId.toString());

    return {
      _id: mongoId,
      username: row.username || `user_${index + 1}`,
      email: row.email || `user_${index + 1}@example.com`,
      password: row.password_hash || row.password || 'changeme',
      role: row.role || 'user',
      createdAt: toDate(row.created_at) || new Date(),
      updatedAt: toDate(row.updated_at) || new Date(),
    };
  });

  await User.insertMany(docs, { ordered: false });
  return docs.length;
};

const migrateAirdrops = async (tables, airdropIdMap) => {
  const airdropRows = tables.airdrops || [];
  if (!airdropRows.length) {
    return 0;
  }

  const socialByAirdropId = new Map();
  for (const row of tables.social_links || []) {
    if (!socialByAirdropId.has(row.airdrop_id)) {
      socialByAirdropId.set(row.airdrop_id, row);
    }
  }

  const updatesByAirdropId = new Map();
  for (const row of tables.airdrop_updates || []) {
    const items = updatesByAirdropId.get(row.airdrop_id) || [];
    items.push({
      content: row.content || '',
      date: toDate(row.created_at) || new Date(),
      telegramMessageId: null,
    });
    updatesByAirdropId.set(row.airdrop_id, items);
  }

  const allowedStatuses = new Set(['active', 'upcoming', 'ended', 'claim']);

  const docs = airdropRows.map((row, index) => {
    const mongoId = new mongoose.Types.ObjectId();
    airdropIdMap.set(row.id, mongoId.toString());

    const social = socialByAirdropId.get(row.id);
    const status = allowedStatuses.has(row.status) ? row.status : 'upcoming';

    return {
      _id: mongoId,
      airdropId: index + 1,
      title: row.title || 'Untitled Airdrop',
      description: row.description || row.short_description || 'No description',
      token: row.token_name || row.token_symbol || 'UNKNOWN',
      criteria: row.criteria || row.requirements || 'No requirements',
      startDate: row.start_date ? String(row.start_date).split(' ')[0] : undefined,
      status,
      costType: row.cost_type || 'free',
      link: row.website_url || row.claim_url || 'https://example.com',
      claimUrl: row.claim_url || '',
      logoUrl: row.logo_url || '',
      cardColor: row.card_color || '',
      predefinedColor: row.predefined_color || 'default',
      views: Number(row.views || 0),
      skipTelegramNotification: toBool(row.skip_telegram_notification),
      socialLinks: {
        website: social?.website || '',
        discord: social?.discord || '',
        twitter: social?.twitter || '',
        telegram: social?.telegram || '',
        github: social?.github || '',
        instagram: social?.instagram || '',
      },
      telegram: {
        messageId: null,
        chatId: null,
        lastUpdated: null,
      },
      updates: updatesByAirdropId.get(row.id) || [],
      createdAt: toDate(row.created_at) || new Date(),
      updatedAt: toDate(row.updated_at) || new Date(),
    };
  });

  await Airdrop.insertMany(docs, { ordered: false });
  return docs.length;
};

const migratePasswordResetTokens = async (rows, userIdMap) => {
  if (!rows.length) {
    return 0;
  }

  const docs = [];
  for (const row of rows) {
    const mappedUserId = userIdMap.get(row.user_id);
    if (!mappedUserId || !row.token) {
      continue;
    }

    docs.push({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mappedUserId),
      token: row.token,
      createdAt: toDate(row.created_at) || new Date(),
    });
  }

  if (!docs.length) {
    return 0;
  }

  await PasswordResetToken.insertMany(docs, { ordered: false });
  return docs.length;
};

const migrateTracking = async (trackingRows, userIdMap, airdropIdMap) => {
  if (!trackingRows.length) {
    return 0;
  }

  const trackedByUser = new Map();

  for (const row of trackingRows) {
    const mappedUserId = userIdMap.get(row.user_id);
    const mappedAirdropId = airdropIdMap.get(row.airdrop_id);

    if (!mappedUserId || !mappedAirdropId) {
      continue;
    }

    const bucket = trackedByUser.get(mappedUserId) || {
      ids: new Set(),
      createdAt: toDate(row.created_at) || new Date(),
      updatedAt: toDate(row.updated_at) || new Date(),
    };

    bucket.ids.add(mappedAirdropId);
    const updated = toDate(row.updated_at);
    if (updated && updated > bucket.updatedAt) {
      bucket.updatedAt = updated;
    }
    trackedByUser.set(mappedUserId, bucket);
  }

  const docs = Array.from(trackedByUser.entries()).map(([userId, bucket]) => ({
    _id: new mongoose.Types.ObjectId(),
    userId,
    airdropIds: Array.from(bucket.ids),
    createdAt: bucket.createdAt,
    updatedAt: bucket.updatedAt,
  }));

  if (!docs.length) {
    return 0;
  }

  await Tracking.insertMany(docs, { ordered: false });
  return docs.length;
};

const migrateViews = async (viewRows, airdropIdMap) => {
  if (!viewRows.length) {
    return 0;
  }

  const docs = [];
  for (const row of viewRows) {
    const mappedAirdropId = airdropIdMap.get(row.airdrop_id);
    if (!mappedAirdropId) {
      continue;
    }

    const viewedAt = toDate(row.viewed_at) || toDate(row.created_at) || new Date();
    docs.push({
      _id: new mongoose.Types.ObjectId(),
      airdropId: new mongoose.Types.ObjectId(mappedAirdropId),
      timestamp: viewedAt,
      ipAddress: row.ip_address || '',
      createdAt: viewedAt,
      updatedAt: viewedAt,
    });
  }

  if (!docs.length) {
    return 0;
  }

  await View.insertMany(docs, { ordered: false });
  return docs.length;
};

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
  }

  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Dump file not found: ${dumpPath}`);
  }

  const sql = fs.readFileSync(dumpPath, 'utf8');
  const tables = parseCopyTables(sql);
  const userIdMap = new Map();
  const airdropIdMap = new Map();

  const sourceTrackingRows = (tables.tracking && tables.tracking.length)
    ? tables.tracking
    : (tables.airdrop_tracking || []);
  const sourceViewRows = (tables.views && tables.views.length)
    ? tables.views
    : (tables.airdrop_views || []);

  await connectDB();
  await ensureMongoIsEmptyOrClear();

  const usersInserted = await migrateUsers(tables.users || [], userIdMap);
  const airdropsInserted = await migrateAirdrops(tables, airdropIdMap);
  const passwordResetInserted = await migratePasswordResetTokens(
    tables.password_reset_tokens || [],
    userIdMap
  );
  const trackingInserted = await migrateTracking(
    sourceTrackingRows,
    userIdMap,
    airdropIdMap
  );
  const viewsInserted = await migrateViews(sourceViewRows, airdropIdMap);

  console.log('PostgreSQL dump -> MongoDB import completed');
  console.log(`Source users: ${(tables.users || []).length}`);
  console.log(`Source airdrops: ${(tables.airdrops || []).length}`);
  console.log(`Source tracking rows: ${sourceTrackingRows.length}`);
  console.log(`Source views rows: ${sourceViewRows.length}`);
  console.log(`Source password reset tokens: ${(tables.password_reset_tokens || []).length}`);
  console.log(`Inserted users: ${usersInserted}`);
  console.log(`Inserted airdrops: ${airdropsInserted}`);
  console.log(`Inserted tracking documents: ${trackingInserted}`);
  console.log(`Inserted views: ${viewsInserted}`);
  console.log(`Inserted password reset tokens: ${passwordResetInserted}`);
}

main()
  .catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
