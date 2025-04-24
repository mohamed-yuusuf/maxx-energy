const db = require('../db/db');
const fs = require('fs');
const path = require('path');

const timeColumns = [
    "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
    "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

const times = timeColumns.map(t => `"${t}"`).join(', ');

const logInvalidEntry = (data, errors) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        input: data,
        errors
    };
    const logPath = path.join(__dirname, '../logs/invalid-entries.log');
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
};

const isValidDate = (date) => !isNaN(Date.parse(date));

const getAccountNumberByRole = (account_no, role) => {
    return role === 'Executive' ? account_no : maskAccountNumber(account_no);
};

const maskAccountNumber = (accountNumber) => {
    const strAccountNumber = accountNumber.toString();
    const maskedCharts = '*'.repeat(strAccountNumber.length - 4);
    return maskedCharts + strAccountNumber.slice(-4);
};

exports.getAccounts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const accountsResult = await db.query(
            'SELECT DISTINCT "account_no", "type", "substation", "transformer", "zip_code" FROM "energy_data" ORDER BY "account_no" LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const userRole = req.query.role || 'Staff';
        const accounts = accountsResult.rows.map(row => ({
            account_info: {
                account_no: getAccountNumberByRole(row.account_no, userRole),
                type: row.type,
                substation: row.substation,
                transformer: row.transformer
            },
            location: { zip_code: row.zip_code }
        }));

        res.json({ accounts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDistinctAccounts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const accountsResult = await db.query(
            'SELECT DISTINCT "account_no" FROM "energy_data" ORDER BY "account_no" LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const userRole = req.query.role || 'Staff';
        const accounts = accountsResult.rows.map(row => ({
            account_info: {
                account_no: getAccountNumberByRole(row.account_no, userRole)
            }
        }));

        res.json({ accounts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSubstations = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const substationsResult = await db.query(
            'SELECT DISTINCT "substation", "transformer" FROM "energy_data" LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const substations = substationsResult.rows.map(row => ({
            substation_details: {
                substation: row.substation,
                transformer: row.transformer
            }
        }));

        res.json({ substations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAccountUsage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { account_no, start_date, end_date } = req.query;
    const validationErrors = [];

    if (!account_no) validationErrors.push("Missing account_no");
    if (!start_date || !isValidDate(start_date)) validationErrors.push("Invalid start_date");
    if (!end_date || !isValidDate(end_date)) validationErrors.push("Invalid end_date");

    if (validationErrors.length > 0) {
        logInvalidEntry(req.query, validationErrors);
        return res.status(400).json({ errors: validationErrors });
    }

    try {
        const query = `SELECT "account_no", ${times}, "substation", "transformer" FROM "energy_data" WHERE "date" >= $1 AND "date" <= $2 AND "account_no" = $3 LIMIT $4 OFFSET $5`;
        const values = [start_date, end_date, account_no, limit, offset];

        const accountsResult = await db.query(query, values);
        const userRole = req.query.role || 'Staff';

        const accounts = accountsResult.rows.map(row => ({
            ...row,
            account_no: getAccountNumberByRole(row.account_no, userRole)
        }));

        res.json({
            usage_details: {
                date_range: { start_date, end_date },
                accounts
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
