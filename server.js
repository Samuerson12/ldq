const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let gameState = {
    currentYear: 2,
    currentMonth: 6,
    concubines: [
        {
            id: 1, name: "甄嬛", title: "贵人",
            enterYear: 1, enterMonth: 1,
            lianShiCount: 5,
            isPregnant: false, hasSon: false,
            customTitle: "", notes: "惊鸿舞",
            deceased: false,
            pregnancyPromoted: false,
            sonPromoted: false,
            lianShiPromotions: 0,
            durationPromotions: 0
        }
    ]
};

app.get('/api/state', (req, res) => {
    res.json(gameState);
});

app.post('/api/time', (req, res) => {
    const { action } = req.body;
    if (action === 'add') {
        gameState.currentMonth++;
        if (gameState.currentMonth > 12) {
            gameState.currentMonth = 1;
            gameState.currentYear++;
        }
    } else if (action === 'sub') {
        gameState.currentMonth--;
        if (gameState.currentMonth < 1) {
            gameState.currentMonth = 12;
            gameState.currentYear--;
            if (gameState.currentYear < 1) gameState.currentYear = 1;
        }
    }
    res.json(gameState);
});

app.post('/api/concubine/add', (req, res) => {
    const { name, title, enterYear, enterMonth, notes } = req.body;
    const newConcubine = {
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
    };
    gameState.concubines.push(newConcubine);
    res.json({ success: true });
});

app.post('/api/concubine/update', (req, res) => {
    const {
        id, title, lianShiCount, isPregnant, hasSon,
        customTitle, notes, deceased,
        pregnancyPromoted, sonPromoted,
        lianShiPromotions, durationPromotions
    } = req.body;
    const index = gameState.concubines.findIndex(c => c.id === id);
    if (index !== -1) {
        if (title !== undefined) gameState.concubines[index].title = title;
        if (lianShiCount !== undefined) gameState.concubines[index].lianShiCount = Math.max(0, lianShiCount);
        if (isPregnant !== undefined) gameState.concubines[index].isPregnant = isPregnant;
        if (hasSon !== undefined) gameState.concubines[index].hasSon = hasSon;
        if (customTitle !== undefined) gameState.concubines[index].customTitle = customTitle;
        if (notes !== undefined) gameState.concubines[index].notes = notes;
        if (deceased !== undefined) gameState.concubines[index].deceased = deceased;
        if (pregnancyPromoted !== undefined) gameState.concubines[index].pregnancyPromoted = pregnancyPromoted;
        if (sonPromoted !== undefined) gameState.concubines[index].sonPromoted = sonPromoted;
        if (lianShiPromotions !== undefined) gameState.concubines[index].lianShiPromotions = lianShiPromotions;
        if (durationPromotions !== undefined) gameState.concubines[index].durationPromotions = durationPromotions;
    }
    res.json(gameState);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));