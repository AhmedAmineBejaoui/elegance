#!/usr/bin/env node

// Script pour initialiser la base de données
import { sql } from "@vercel/postgres";
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function initDatabase() {
  console.log('🗄️  Initialisation de la base de données...\n');

  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL n\'est pas configuré');
    console.log('📝 Veuillez configurer POSTGRES_URL dans votre fichier .env');
    console.log('\n💡 Pour Neon:');
    console.log('1. Allez sur https://console.neon.tech/');
    console.log('2. Créez un nouveau projet ou sélectionnez un existant');
    console.log('3. Copiez l\'URL de connexion dans POSTGRES_URL');
    process.exit(1);
  }

  // Détecter Neon
  const isNeon = process.env.POSTGRES_URL.includes('neon.tech');
  if (isNeon) {
    console.log('✅ Neon PostgreSQL détecté - Configuration optimisée');
  }

  try {
    // Créer la table users
    console.log('👥 Création de la table users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table users créée/mise à jour');

    // Créer la table sessions (pour connect-pg-simple)
    console.log('🔐 Création de la table sessions...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE)
    `;
    console.log('✅ Table sessions créée/mise à jour');

    // Créer les index pour les sessions
    console.log('📊 Création des index...');
    await sql`
      CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions(expire)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS IDX_sessions_sid ON sessions(sid)
    `;
    console.log('✅ Index créés/mis à jour');

    // Vérifier que les tables existent
    console.log('\n🔍 Vérification des tables...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions')
      ORDER BY table_name
    `;

    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log(`📋 Tables existantes: ${existingTables.join(', ')}`);

    if (existingTables.includes('users') && existingTables.includes('sessions')) {
      console.log('\n✅ Base de données initialisée avec succès!');
      console.log('🚀 L\'authentification Google devrait maintenant fonctionner.');
      
      if (isNeon) {
        console.log('\n💡 Neon PostgreSQL - Conseils:');
        console.log('- Votre base de données est hébergée sur Neon');
        console.log('- Les connexions sont automatiquement optimisées');
        console.log('- La base de données est accessible depuis Vercel');
        console.log('- Surveillez l\'utilisation dans le dashboard Neon');
      }
    } else {
      console.log('\n⚠️  Certaines tables sont manquantes');
      console.log('📋 Tables attendues: users, sessions');
      console.log(`📋 Tables trouvées: ${existingTables.join(', ')}`);
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation de la base de données:');
    console.error(error.message);
    
    if (error.message.includes('connection')) {
      console.log('\n💡 Suggestions:');
      console.log('1. Vérifiez que POSTGRES_URL est correct');
      console.log('2. Vérifiez que la base de données est accessible');
      console.log('3. Vérifiez les permissions de l\'utilisateur de base de données');
      
      if (isNeon) {
        console.log('\n🔧 Pour Neon spécifiquement:');
        console.log('1. Vérifiez que l\'URL de connexion Neon est correcte');
        console.log('2. Assurez-vous que le projet Neon est actif');
        console.log('3. Vérifiez les paramètres de sécurité dans Neon Console');
        console.log('4. Testez la connexion depuis le dashboard Neon');
      }
    }
    
    process.exit(1);
  }
}

// Exécuter l'initialisation
initDatabase();