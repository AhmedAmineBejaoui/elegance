#!/usr/bin/env node

// Script pour vérifier les variables d'environnement critiques
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const requiredEnvVars = [
  'POSTGRES_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET'
];

const optionalEnvVars = [
  'PUBLIC_BASE_URL',
  'NODE_ENV',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

console.log('🔍 Vérification des variables d\'environnement...\n');

let hasErrors = false;

// Vérifier les variables requises
console.log('📋 Variables requises:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MANQUANTE`);
    hasErrors = true;
  } else {
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? value.substring(0, 8) + '...' 
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📋 Variables optionnelles:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Non définie (optionnelle)`);
  } else {
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? value.substring(0, 8) + '...' 
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n🔧 Configuration de l\'application:');
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 PUBLIC_BASE_URL: ${process.env.PUBLIC_BASE_URL || 'Auto-détecté'}`);

if (hasErrors) {
  console.log('\n❌ ERREUR: Variables d\'environnement manquantes!');
  console.log('📝 Veuillez configurer les variables manquantes dans votre fichier .env');
  console.log('📖 Consultez .env.example pour un exemple de configuration');
  process.exit(1);
} else {
  console.log('\n✅ Toutes les variables d\'environnement critiques sont configurées!');
  console.log('🚀 L\'application devrait fonctionner correctement.');
}