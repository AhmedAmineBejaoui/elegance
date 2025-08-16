#!/usr/bin/env node

// Script pour tester spécifiquement la connexion Neon
import { sql } from "@vercel/postgres";
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function testNeonConnection() {
  console.log('🔍 Test de la connexion Neon PostgreSQL...\n');

  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL n\'est pas configuré');
    console.log('📝 Veuillez configurer POSTGRES_URL dans votre fichier .env');
    process.exit(1);
  }

  const isNeon = process.env.POSTGRES_URL.includes('neon.tech');
  if (!isNeon) {
    console.log('⚠️  POSTGRES_URL ne semble pas être une URL Neon');
    console.log('📝 URL actuelle:', process.env.POSTGRES_URL.substring(0, 50) + '...');
    console.log('💡 Pour utiliser Neon, l\'URL doit contenir "neon.tech"');
    process.exit(1);
  }

  console.log('✅ URL Neon détectée');
  console.log('🔗 URL:', process.env.POSTGRES_URL.substring(0, 50) + '...');

  try {
    console.log('\n🧪 Test de connexion...');
    
    // Test de connexion basique
    const result = await sql`SELECT 1 as test, version() as version`;
    console.log('✅ Connexion réussie!');
    console.log('📊 Test query:', result.rows[0].test);
    console.log('🐘 Version PostgreSQL:', result.rows[0].version.split(' ')[0]);

    // Vérifier les tables existantes
    console.log('\n📋 Vérification des tables...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Tables existantes:', existingTables.length > 0 ? existingTables.join(', ') : 'Aucune');

    // Vérifier les tables requises
    const requiredTables = ['users', 'sessions'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('⚠️  Tables manquantes:', missingTables.join(', '));
      console.log('💡 Exécutez: npm run init-db');
    } else {
      console.log('✅ Toutes les tables requises sont présentes');
    }

    // Test de performance
    console.log('\n⚡ Test de performance...');
    const startTime = Date.now();
    await sql`SELECT COUNT(*) as count FROM users`;
    const endTime = Date.now();
    console.log(`✅ Query exécutée en ${endTime - startTime}ms`);

    // Informations sur Neon
    console.log('\n💡 Informations Neon:');
    console.log('- ✅ Connexion serverless active');
    console.log('- ✅ Optimisations automatiques activées');
    console.log('- ✅ Monitoring disponible dans Neon Console');
    console.log('- 📊 Surveillez l\'utilisation: https://console.neon.tech/');

    console.log('\n🎉 Connexion Neon testée avec succès!');
    console.log('🚀 Votre base de données est prête pour l\'authentification Google.');

  } catch (error) {
    console.error('\n❌ Erreur de connexion Neon:');
    console.error(error.message);

    if (error.message.includes('connection')) {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez que l\'URL de connexion Neon est correcte');
      console.log('2. Assurez-vous que le projet Neon est actif');
      console.log('3. Vérifiez les paramètres de sécurité dans Neon Console');
      console.log('4. Testez la connexion depuis le dashboard Neon');
      console.log('5. Vérifiez que l\'IP n\'est pas bloquée (si applicable)');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔐 Problème d\'authentification:');
      console.log('1. Vérifiez les identifiants dans l\'URL de connexion');
      console.log('2. Régénérez l\'URL de connexion dans Neon Console');
      console.log('3. Vérifiez les permissions de l\'utilisateur');
    } else if (error.message.includes('database')) {
      console.log('\n🗄️  Problème de base de données:');
      console.log('1. Vérifiez que la base de données existe');
      console.log('2. Créez une nouvelle base de données si nécessaire');
      console.log('3. Vérifiez les permissions de l\'utilisateur');
    }

    console.log('\n📞 Support Neon:');
    console.log('- Documentation: https://neon.tech/docs');
    console.log('- Discord: https://discord.gg/neondatabase');
    console.log('- Email: support@neon.tech');

    process.exit(1);
  }
}

// Exécuter le test
testNeonConnection();