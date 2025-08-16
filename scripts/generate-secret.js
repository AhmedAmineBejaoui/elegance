#!/usr/bin/env node

// Script pour générer un secret de session sécurisé
import crypto from 'crypto';

function generateSecret() {
  console.log('🔐 Génération d\'un secret de session sécurisé...\n');
  
  // Générer un secret de 64 caractères
  const secret = crypto.randomBytes(32).toString('hex');
  
  console.log('✅ Secret généré avec succès!');
  console.log('\n📋 Ajoutez cette ligne à votre fichier .env:');
  console.log(`SESSION_SECRET=${secret}`);
  console.log('\n⚠️  IMPORTANT:');
  console.log('- Gardez ce secret en sécurité');
  console.log('- Ne le partagez jamais');
  console.log('- Utilisez un secret différent pour chaque environnement');
  console.log('- Changez ce secret si vous pensez qu\'il a été compromis');
  
  return secret;
}

// Exécuter la génération
generateSecret();