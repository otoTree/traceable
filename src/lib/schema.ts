import { query } from "./db";

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      image1_url TEXT,
      image2_url TEXT,
      images TEXT[] DEFAULT '{}',
      result JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure images column exists if table was already created
  await query(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='images') THEN
        ALTER TABLE analyses ADD COLUMN images TEXT[] DEFAULT '{}';
      END IF;
    END $$;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
