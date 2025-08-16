#!/usr/bin/env node

// Script pour tester l'authentification Google
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

function testConfiguration() {
  console.log('🔍 Test de la configuration d\'authentification Google...\n');

  const config = {
    POSTGRES_URL: process.env.POSTGRES_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL
  };

  console.log('📋 Configuration actuelle:');
  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      if (key.includes('SECRET') || key.includes('PASSWORD')) {
        console.log(`✅ ${key}: ${value.substring(0, 8)}...`);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: MANQUANT`);
    }
  });

  // Vérifier la configuration OAuth
  console.log('\n🔧 Configuration OAuth:');
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Identifiants Google OAuth configurés');
    
    const callbackUrl = `${config.PUBLIC_BASE_URL || 'auto'}/api/callback`;
    console.log(`🔗 URL de callback: ${callbackUrl}`);
    
    console.log('\n📝 Instructions pour Google Console:');
    console.log('1. Allez sur https://console.cloud.google.com/');
    console.log('2. Sélectionnez votre projet');
    console.log('3. APIs & Services > Credentials');
    console.log('4. Modifiez votre OAuth 2.0 Client ID');
    console.log(`5. Ajoutez cette URL dans "Authorized redirect URIs":`);
    console.log(`   ${callbackUrl}`);
    console.log(`6. Ajoutez cette URL dans "Authorized JavaScript origins":`);
    console.log(`   ${config.PUBLIC_BASE_URL || 'https://your-domain.vercel.app'}`);
  } else {
    console.log('❌ Identifiants Google OAuth manquants');
    console.log('📝 Configurez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET');
  }

  // Vérifier la base de données
  console.log('\n🗄️  Configuration de la base de données:');
  if (config.POSTGRES_URL) {
    console.log('✅ POSTGRES_URL configuré');
    console.log('📝 Pour tester la connexion: npm run init-db');
  } else {
    console.log('❌ POSTGRES_URL manquant');
    console.log('📝 Configurez une base de données PostgreSQL');
  }

  // Vérifier les sessions
  console.log('\n🔐 Configuration des sessions:');
  if (config.SESSION_SECRET) {
    console.log('✅ SESSION_SECRET configuré');
  } else {
    console.log('❌ SESSION_SECRET manquant');
    console.log('📝 Générez un secret fort pour les sessions');
  }

  // Instructions de test
  console.log('\n🧪 Instructions de test:');
  console.log('1. Vérifiez la configuration: npm run check-env');
  console.log('2. Initialisez la base de données: npm run init-db');
  console.log('3. Testez l\'endpoint de santé: curl /api/health');
  console.log('4. Testez l\'authentification:');
  console.log('   - Allez sur /api/login');
  console.log('   - Suivez le flux Google OAuth');
  console.log('   - Vérifiez la redirection vers /api/callback');
  console.log('5. Vérifiez la session: GET /api/auth/user');

  // Problèmes courants
  console.log('\n🐛 Problèmes courants et solutions:');
  console.log('❌ Erreur "invalid_grant":');
  console.log('   - Vérifiez l\'URL de callback dans Google Console');
  console.log('   - Assurez-vous que le domaine est autorisé');
  console.log('');
  console.log('❌ Erreur "missing_connection_string":');
  console.log('   - Vérifiez POSTGRES_URL');
  console.log('   - Testez la connexion: npm run init-db');
  console.log('');
  console.log('❌ Erreur 401 sur /api/auth/user:');
  console.log('   - Vérifiez SESSION_SECRET');
  console.log('   - Vérifiez la connexion à la base de données');
  console.log('   - Testez l\'endpoint de santé: /api/health');
}

// Exécuter le test
testConfiguration();