import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.join(process.cwd(),'data'); fs.mkdirSync(dir,{recursive:true});
const globalDb = globalThis as typeof globalThis & { gigDb?: Database.Database };
export const db = globalDb.gigDb ?? new Database(path.join(dir,'gigpilot.sqlite'));
if(process.env.NODE_ENV !== 'production') globalDb.gigDb=db;
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON');
db.exec(`CREATE TABLE IF NOT EXISTS opportunities(id INTEGER PRIMARY KEY, category TEXT NOT NULL, buyer TEXT NOT NULL, problem TEXT NOT NULL, evidence TEXT NOT NULL, source TEXT NOT NULL, observed TEXT NOT NULL, confidence INTEGER NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS drafts(id INTEGER PRIMARY KEY, content TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS versions(id INTEGER PRIMARY KEY, draft_id INTEGER NOT NULL REFERENCES drafts(id), content TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS approvals(id INTEGER PRIMARY KEY, draft_id INTEGER NOT NULL REFERENCES drafts(id), version_id INTEGER NOT NULL REFERENCES versions(id), created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, action TEXT NOT NULL, detail TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
export function audit(action:string,detail:string){db.prepare('INSERT INTO audit(action,detail) VALUES(?,?)').run(action,detail)}
