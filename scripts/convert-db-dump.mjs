import fs from 'fs';
import path from 'path';

const inputPath = process.argv[2] || path.resolve('./db_dump.json');
const outputPath = process.argv[3] || path.resolve('./db_dump_converted.json');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function toNumber(val) {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function normalizeSet(set, dateISO, bodyWeightMap) {
  const r = toNumber(set?.r) || 0;
  const wDisplayRaw = set?.wDisplay ?? set?.weightDisplay ?? set?.w ?? '';
  const wNum = toNumber(set?.w);
  const isBodyWeightDisplay = typeof wDisplayRaw === 'string' && wDisplayRaw.toLowerCase().startsWith('body weight');
  const isBwPlus = typeof wDisplayRaw === 'string' && wDisplayRaw.toUpperCase().startsWith('BW+');

  // Günlük kilo bilgisi; yoksa 0
  const dayBodyWeight = toNumber(bodyWeightMap?.[dateISO]) || 0;

  if (isBodyWeightDisplay) {
    return { r, w: dayBodyWeight, wDisplay: 'BW', note: set?.note || '' };
  }

  if (isBwPlus) {
    const additional = wNum || 0;
    return { r, w: dayBodyWeight + additional, wDisplay: String(wDisplayRaw), note: set?.note || '' };
  }

  if (Number.isFinite(wNum)) {
    return { r, w: wNum, wDisplay: set?.wDisplay ?? String(wNum), note: set?.note || '' };
  }

  return { r, w: 0, wDisplay: String(wDisplayRaw || ''), note: set?.note || '' };
}

function normalizeItem(item, dateISO, bodyWeightMap) {
  const rawName = (item?.displayName || item?.name || item?.canonicalName || '').trim();
  if (!rawName) return null;
  const canonicalName = item?.canonicalName || rawName;

  const sets = (item?.sets || [])
    .map((s) => normalizeSet(s, dateISO, bodyWeightMap))
    .filter((s) => Number.isFinite(s.r) && s.r > 0);

  return {
    ...item,
    name: rawName,
    displayName: rawName,
    canonicalName,
    sets,
  };
}

function normalizeWorkoutCollection(collection, bodyWeightMap) {
  const out = {};
  Object.entries(collection || {}).forEach(([iso, entry]) => {
    if (!entry) return;
    const dateISO = entry.dateISO || iso;
    const items = (entry.items || [])
      .map((it) => normalizeItem(it, dateISO, bodyWeightMap))
      .filter(Boolean);

    out[dateISO] = {
      ...entry,
      dateISO,
      workoutName: entry.workoutName || '',
      workoutFocus: Array.isArray(entry.workoutFocus) ? entry.workoutFocus : [],
      workoutFuel: entry.workoutFuel || '',
      notes: typeof entry.notes === 'string' ? entry.notes : '',
      items,
    };
  });
  return out;
}

function buildPayload(src) {
  const bodyWeight = src.gym_body_weight_v1 || src.bodyWeight || {};
  const exercises = src.gym_exercises_v1 || src.exercises || [];
  const improvements = src.gym_improvements_v1 || src.improvements || {};
  const workoutsRaw = src.gym_workouts_v1 || src.workouts || {};

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    exercises,
    workouts: normalizeWorkoutCollection(workoutsRaw, bodyWeight),
    bodyWeight,
    improvements,
  };
}

const source = readJson(inputPath);
const payload = buildPayload(source);
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Converted -> ${outputPath}`);
