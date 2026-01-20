require('dotenv').config();

const express = require('express');
const cors = require('cors');

// routes
const formsRouter = require('./routes/forms');
const submissionsRouter = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 4000;


// Middleware Configuration

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/forms', formsRouter);
app.use('/', submissionsRouter);
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});


app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(' Dynamic Form Backend Server');
    console.log('='.repeat(50));
    console.log(` Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).filter(e => e)
        : [];

    if (adminEmails.length === 0) {
        console.log(' WARNING: No admin emails configured!');
        console.log('   Set ADMIN_EMAILS in .env file to enable admin access');
    } else {
        console.log(` Admin emails configured: ${adminEmails.length}`);
        adminEmails.forEach((email, idx) => {
            console.log(`   ${idx + 1}. ${email}`);
        });
    }

    console.log('='.repeat(50));
});

module.exports = app;
