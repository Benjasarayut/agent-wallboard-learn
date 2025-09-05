const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const agents = [
    { code: "A001", name: "John Doe", status: "Available", skill: "Sales", loginTime: null },
    { code: "A002", name: "Jane Smith", status: "Active", skill: "Support", loginTime: null },
    { code: "A003", name: "Mike Lee", status: "Not Ready", skill: "Tech", loginTime: null }
];

app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
});

app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});


app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});


app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

app.patch('/api/agents/:code/status', (req, res) => {
    const agentCode = req.params.code;
    const newStatus = req.body.status;

    const agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const oldStatus = agent.status;
    agent.status = newStatus;

    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    res.json({ success: true, data: agent });
});

app.get('/api/dashboard/stats', (req, res) => {
    const totalAgents = agents.length;

    const countByStatus = (status) => agents.filter(a => a.status === status).length;
    const makeStat = (status) => {
        const count = countByStatus(status);
        return {
            count,
            percent: totalAgents > 0 ? Math.round((count / totalAgents) * 100) : 0
        };
    };

    res.json({
        success: true,
        data: {
            total: totalAgents,
            statusBreakdown: {
                available: makeStat("Available"),
                active: makeStat("Active"),
                wrapUp: makeStat("Wrap Up"),
                notReady: makeStat("Not Ready"),
                offline: makeStat("Offline")
            },
            timestamp: new Date().toISOString()
        }
    });
});

app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;

    let agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        agent = { code: agentCode, name, status: "Available", loginTime: new Date().toISOString() };
        agents.push(agent);
    } else {
        agent.status = "Available";
        agent.loginTime = new Date().toISOString();
    }

    res.json({ success: true, data: agent });
});

app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
    }

    agent.status = "Offline";
    agent.loginTime = null;

    res.json({ success: true, data: agent });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});