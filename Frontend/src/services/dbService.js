import * as SQLite from 'expo-sqlite';

const database_name = 'CRM.db';

// Expo handles opening differently
const db = SQLite.openDatabase(database_name);

export const getDBConnection = () => {
    return db;
};

export const createTable = () => {
    db.transaction((tx) => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS CustomerNotes(
                contactId TEXT PRIMARY KEY NOT NULL,
                note TEXT
            );`,
            [],
            () => { console.log('Table created successfully'); },
            (_, error) => { console.error('Error creating table:', error); return false; }
        );
    });
};

export const saveNote = (contactId, note) => {
    db.transaction((tx) => {
        tx.executeSql(
            `INSERT OR REPLACE INTO CustomerNotes (contactId, note) VALUES (?, ?)`,
            [contactId, note],
            () => { console.log('Note saved successfully'); },
            (_, error) => { console.error('Error saving note:', error); return false; }
        );
    });
};

export const getNote = (contactId) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT note FROM CustomerNotes WHERE contactId = ?`,
                [contactId],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        resolve(rows.item(0).note);
                    } else {
                        resolve('');
                    }
                },
                (_, error) => { reject(error); return false; }
            );
        });
    });
};