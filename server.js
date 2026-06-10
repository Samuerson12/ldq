require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const VALID_PASSWORDS = ["0902","4312"];

const defaultState = () => ({
    currentYear: 1,
    currentMonth: 1,
    concubines: []
});

let db;

async function getCollection() {
    return db.collection('states');
}

async function getState(password) {
    const col = await getCollection();
    let doc = await col.findOne({ password });
    if (!doc) {
        const newState = { password, ...defaultState() };
        await col.insertOne(newState);
        return newState;
    }
    return doc;
}

async function updateState(password, updates) {
    const col = await getCollection();
    await col.updateOne({ password }, { $set: updates }, { upsert: true });
    return col.findOne({ password });
}

// ---- Routes ----

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (VALID_PASSWORDS.includes(password)) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "密码错误" });
    }
});

app.get('/api/state', async (req, res) => {
    const password = req.headers['x-password'];
    if (!VALID_PASSWORDS.includes(password)) return res.status(401).json({ error: 'Unauthorized' });
    const state = await getState(password);
    res.json(state);
});

app.post('/api/time', async (req, res) => {
    const password = req.headers['x-password'];
    if (!VALID_PASSWORDS.includes(password)) return res.status(401).json({ error: 'Unauthorized' });

    const state = await getState(password);
    const { action } = req.body;
    if (action === 'add') {
        state.currentMonth++;
        if (state.currentMonth > 12) { state.currentMonth = 1; state.currentYear++; }
    } else if (action === 'sub') {
        state.currentMonth--;
        if (state.currentMonth < 1) {
            state.currentMonth = 12;
            state.currentYear--;
            if (state.currentYear < 1) state.currentYear = 1;
        }
    }
    const updated = await updateState(password, {
        currentYear: state.currentYear,
        currentMonth: state.currentMonth
    });
    res.json(updated);
});

app.post('/api/concubine/add', async (req, res) => {
    const password = req.headers['x-password'];
    if (!VALID_PASSWORDS.includes(password)) return res.status(401).json({ error: 'Unauthorized' });

    const state = await getState(password);
    const { name, title, enterYear, enterMonth, notes } = req.body;
    state.concubines.push({
        id: Date.now(),
        name,
        title,
        enterYear: parseInt(enterYear),
        enterMonth: parseInt(enterMonth),
        lianShiCount: 0,
        isPregnant: false,
        hasSon: false,
        customTitle: "",
        notes: notes || "",
        deceased: false,
        pregnancyPromoted: false,
        sonPromoted: false,
        lianShiPromotions: 0,
        durationPromotions: 0
    });
    await updateState(password, { concubines: state.concubines });
    res.json({ success: true });
});

app.post('/api/concubine/update', async (req, res) => {
    const password = req.headers['x-password'];
    if (!VALID_PASSWORDS.includes(password)) return res.status(401).json({ error: 'Unauthorized' });

    const state = await getState(password);
    const {
        id, title, lianShiCount, isPregnant, hasSon,
        customTitle, notes, deceased,
        pregnancyPromoted, sonPromoted,
        lianShiPromotions, durationPromotions
    } = req.body;

    const index = state.concubines.findIndex(c => c.id === id);
    if (index !== -1) {
        if (title !== undefined) state.concubines[index].title = title;
        if (lianShiCount !== undefined) state.concubines[index].lianShiCount = Math.max(0, lianShiCount);
        if (isPregnant !== undefined) state.concubines[index].isPregnant = isPregnant;
        if (hasSon !== undefined) state.concubines[index].hasSon = hasSon;
        if (customTitle !== undefined) state.concubines[index].customTitle = customTitle;
        if (notes !== undefined) state.concubines[index].notes = notes;
        if (deceased !== undefined) state.concubines[index].deceased = deceased;
        if (pregnancyPromoted !== undefined) state.concubines[index].pregnancyPromoted = pregnancyPromoted;
        if (sonPromoted !== undefined) state.concubines[index].sonPromoted = sonPromoted;
        if (lianShiPromotions !== undefined) state.concubines[index].lianShiPromotions = lianShiPromotions;
        if (durationPromotions !== undefined) state.concubines[index].durationPromotions = durationPromotions;
    }
    const updated = await updateState(password, { concubines: state.concubines });
    res.json(updated);
});

app.post('/api/concubine/delete', async (req, res) => {
    const password = req.headers['x-password'];
    if (!VALID_PASSWORDS.includes(password)) return res.status(401).json({ error: 'Unauthorized' });

    const state = await getState(password);
    const { id } = req.body;

    state.concubines = state.concubines.filter(c => c.id !== id);
    const updated = await updateState(password, { concubines: state.concubines });
    res.json(updated);
});

// ---- Start ----
async function start() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('haremtracker');
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(console.error);