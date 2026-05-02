# Tissenza Backend API Documentation

## 🆕 Nouvelles Fonctionnalités - Mise à Jour 2026-04-26

### ✅ DTO Pattern Complètement Implémenté
Toutes les APIs de lecture utilisent maintenant des DTOs pour éviter les `LazyInitializationException` et améliorer la performance.

### ✅ Accès Élargi pour Tous
Les endpoints de lecture sont maintenant accessibles à tous les utilisateurs authentifiés (ADMIN + VENDEUR + CLIENT).

### ✅ Nouvelles APIs de Recherche Sous-Catégories

#### **Recherche avec informations de catégorie :**
- `GET /api/sous-categories/with-categorie` - Toutes les sous-catégories avec infos catégorie
- `GET /api/sous-categories/{id}/with-categorie` - Sous-catégorie individuelle avec infos catégorie  
- `GET /api/sous-categories/search/nom/with-categorie?nom=xxx` - Recherche LIKE avec infos catégorie
- `GET /api/sous-categories/search/with-categorie?keyword=xxx` - Recherche mot-clé avec infos catégorie

#### **Recherche par ID catégorie :**
- `GET /api/sous-categories/categorie/{categorieId}/with-categorie-info` - Par catégorie avec infos
- `GET /api/sous-categories/categorie/{categorieId}/search/nom?nom=xxx` - Par catégorie + nom (LIKE)

#### **Nouvelles APIs de Recherche Produit Combinée :**
- `GET /api/produits/search/combined?boutiqueId=1&sousCategorieId=2&nom=chemise` - Recherche flexible (paramètres optionnels)
- `GET /api/produits/search/boutique-souscategorie-nom?boutiqueId=1&sousCategorieId=2&nom=chemise` - Recherche stricte (tous obligatoires)

#### **Structure DTO améliorée :**
```json
{
  "id": 1,
  "categorieId": 1,
  "nom": "Chemises",
  "description": "Chemises formelles",
  "createdAt": "2026-04-26T18:40:47",
  "categorieNom": "Vêtements Hommes",
  "categorieDescription": "Collection complète"
}
```

---

## Table des Matières
- [Configuration](#configuration)
- [User Management APIs](#user-management-apis)
- [Boutique Management APIs](#boutique-management-apis)
- [Category Management APIs](#category-management-apis)
- [Product Management APIs](#product-management-apis)
- [Article Management APIs](#article-management-apis)
- [Stock History APIs](#stock-history-apis)

---

## Authentication APIs

### Connexion Utilisateur
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 1,
    "email": "john.doe@example.com",
    "username": "Doe John",
    "role": "CLIENT",
    "photoProfil": "/uploads/40e85e63-3383-4f84-a7c3-b72b96040fcc.jpeg",
    "expiresIn": 86400000
  }
}
```

**Erreurs possibles:**
- `400 Bad Request` - Email ou mot de passe invalide
- `401 Unauthorized` - Compte suspendu ou inactif

**Codes d'erreur détaillés:**
- `BAD_PASSWORD` - Mot de passe incorrect pour l'email spécifié
- `EMAIL_NOT_FOUND` - Aucun compte trouvé avec l'email spécifié
- `ACCOUNT_SUSPENDED` - Compte suspendu. Veuillez contacter l'administrateur
- `ACCOUNT_INACTIVE` - Compte inactif. Veuillez activer votre compte
- `ACCOUNT_DISABLED` - Compte désactivé. Veuillez contacter l'administrateur
- `ACCOUNT_LOCKED` - Compte verrouillé. Veuillez contacter l'administrateur
- `AUTH_ERROR` - Erreur technique lors de l'authentification
- `EMAIL_ALREADY_EXISTS` - Email déjà utilisé lors de l'inscription
- `INVALID_CREDENTIALS` - Identifiants invalides (générique)

**Exemples de réponses d'erreur:**

**Email non trouvé:**
```json
{
  "success": false,
  "message": "Aucun compte trouvé avec l'email: user@example.com",
  "data": null,
  "errorCode": "EMAIL_NOT_FOUND"
}
```

**Mot de passe incorrect:**
```json
{
  "success": false,
  "message": "Mot de passe incorrect pour l'email: user@example.com",
  "data": null,
  "errorCode": "BAD_PASSWORD"
}
```

---

### Inscription Utilisateur
```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "password": "password123",
  "telephone": "+221771234567",
  "adresse": "Dakar, Sénégal",
  "ville": "dakar",
  "role": "CLIENT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "username": "Doe John",
    "role": "CLIENT",
    "message": "Compte créé avec succès"
  }
}
```

**Validation:**
- Nom obligatoire (2-100 caractères)
- Prénom obligatoire (2-100 caractères)
- Email unique et format valide
- Mot de passe obligatoire (min 6 caractères)
- Téléphone optionnel
- Rôle par défaut: CLIENT

---

### Déconnexion
```http
POST /api/auth/logout
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Déconnexion réussie",
  "data": null
}
```

---

### Informations Utilisateur Actuel
```http
GET /api/auth/me
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Informations utilisateur récupérées",
  "data": {
    "id": 2,
    "nom": "Doe",
    "prenom": "John",
    "adresse": "Dakar, Sénégal",
    "photoProfil": null,
    "ville": "dakar",
    "createdAt": "2026-04-16T22:11:53.802206",
    "updatedAt": "2026-04-16T22:11:53.802206"
  }
}
```

**Headers requis:**
- `Authorization: Bearer <token_jwt>` pour accéder

---

### Diagnostic d'Authentification

#### Vérifier un Email
```http
GET /api/auth/diagnostic/check-email/{email}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Diagnostic complété",
  "data": {
    "found": true,
    "compteId": 1,
    "email": "john.doe@example.com",
    "statut": "ACTIF",
    "role": "CLIENT",
    "isVerified": false,
    "hasPassword": true,
    "passwordLength": 60,
    "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMy...",
    "hasPersonne": true,
    "personneId": 1,
    "personneName": "Doe John"
  }
}
```

#### Lister tous les Comptes
```http
GET /api/auth/diagnostic/list-accounts
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Liste des comptes",
  "data": {
    "totalAccounts": 2,
    "accounts": [
      {
        "id": 1,
        "email": "john.doe@example.com",
        "statut": "ACTIF",
        "role": "CLIENT",
        "isVerified": false,
        "hasPassword": true,
        "hasPersonne": true
      }
    ]
  }
}
```

---

## Configuration

**Base URL:** `http://localhost:8081`
**Swagger UI:** `http://localhost:8081/swagger-ui.html`
**Content-Type:** `application/json`

---

## User Management APIs

### Personne APIs

#### Créer une personne
```http
POST /api/personnes
Content-Type: application/json

{
  "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "telephone": "+221771234567",
  "dateNaissance": "1990-05-15",
  "adresse": "Dakar, Sénégal"
}
```

#### Mettre à jour la photo de profil
```http
POST /api/personnes/{id}/photo-profil
Content-Type: multipart/form-data

photoProfil: [fichier image]
```

**Description:**
- Upload une photo de profil et la stocke localement
- Le fichier est sauvegardé dans le répertoire `/uploads/`
- Retourne l'URL d'accès à la photo

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Photo de profil mise à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "telephone": "+221771234567",
  "dateNaissance": "1990-05-15",
  "adresse": "Dakar, Sénégal",
  "photoProfil": "/uploads/40e85e63-3383-4f84-a7c3-b72b96040fcc.jpeg",
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Lister toutes les personnes
```http
GET /api/personnes
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@example.com",
    "telephone": "+221771234567",
    "dateNaissance": "1990-05-15",
    "adresse": "Dakar, Sénégal",
    "createdAt": "2026-04-13T01:50:00"
  }
]
```

#### Rechercher par nom
```http
GET /api/personnes/search/nom?nom=Doe
```

#### Compter les personnes
```http
GET /api/personnes/count
```

**Response (200 OK):**
```json
1
```

### Compte APIs

#### Créer un compte
```http
POST /api/comptes
Content-Type: application/json

{
  "personneId": 1,  
  "email": "john.doe@example.com",
  "motDePasse": "password123",
  "telephone": "+221771234567",
  "role": "CLIENT"
}
```

**Contraintes d'unicité:**
- `email` doit être unique
- `telephone` doit être unique

**Erreurs possibles:**
- `400 Bad Request` - Email ou téléphone déjà utilisé
- `Runtime Exception` - "Email déjà utilisé: xxx" ou "Téléphone déjà utilisé: xxx"

**Response (201 Created):**
```json
{
  "id": 1,
  "personneId": 1,
  "email": "john.doe@example.com",
  "motDePasse": "$2a$10$...",
  "telephone": "+221771234567",
  "role": "CLIENT",
  "statut": "ACTIF",
  "isVerified": false,
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Activer/Désactiver un compte
```http
PUT /api/comptes/1/activate
PUT /api/comptes/1/deactivate
```

#### Vérifier un compte
```http
PUT /api/comptes/1/verify
```

---

## Boutique Management APIs

### Boutique APIs

#### Créer une boutique avec logo
```http
POST /api/boutiques/with-logo
Content-Type: multipart/form-data

vendeurId: 1
nom: "Ma Boutique"
description: "Boutique de vêtements"
addresse: "Dakar, Plateau"
statut: "EN_ATTENTE"
note: 4.5
logo: [fichier image]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Boutique créée avec succès",
  "data": {
    "id": 1,
    "vendeur": {
      "id": 1
    },
    "nom": "Ma Boutique",
    "description": "Boutique de vêtements",
    "addresse": "Dakar, Plateau",
    "logo": "/uploads/produit/uuid.jpg",
    "statut": "EN_ATTENTE",
    "note": 4.5,
    "createdAt": "2026-04-26T15:57:33"
  }
}
```

#### Mettre à jour le logo d'une boutique
```http
POST /api/boutiques/{id}/logo
Content-Type: multipart/form-data

logo: [fichier image]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logo mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Ma Boutique",
    "logo": "/uploads/produit/nouveau-uuid.jpg",
    "statut": "VALIDE",
    "note": 4.5
  }
}
```

#### Mettre à jour les informations générales d'une boutique
```http
PUT /api/boutiques/{id}/infos
Content-Type: application/x-www-form-urlencoded

nom=Nouveau nom&description=Nouvelle description&addresse=Nouvelle adresse
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Informations mises à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Nouveau nom",
    "description": "Nouvelle description",
    "addresse": "Nouvelle adresse",
    "logo": "/uploads/produit/existing-logo.jpg",
    "statut": "VALIDE",
    "note": 4.5,
    "createdAt": "2026-04-26T15:57:33"
  }
}
```

#### Mettre à jour la note d'une boutique
```http
PUT /api/boutiques/{id}/note?note=4.8
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note mise à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Ma Boutique",
    "note": 4.8,
    "statut": "VALIDE"
  }
}
```

#### Mettre à jour le statut d'une boutique
```http
PUT /api/boutiques/{id}/statut?statut=VALIDE
```

**Statuts possibles:**
- `EN_ATTENTE`
- `VALIDE`
- `REFUSE`
- `SUSPENDU`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statut mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Ma Boutique",
    "statut": "VALIDE",
    "note": 4.5
  }
}
```

#### Modifier une boutique (complète)
```http
PUT /api/boutiques/{id}
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "vendeur": {
    "id": 123
  },
  "nom": "Nouveau nom de boutique",
  "description": "Nouvelle description",
  "addresse": "Nouvelle adresse",
  "logo": "https://example.com/nouveau-logo.png",
  "statut": "VALIDE",
  "note": 4.5
}
```

#### Mettre à jour la note d'une boutique
```http
PUT /api/boutiques/{id}/note?note=4.5
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note mise à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Ma Boutique",
    "note": 4.8,
    "statut": "VALIDE"
  }
}
```

#### Mettre à jour le statut d'une boutique
```http
PUT /api/boutiques/{id}/statut?statut=VALIDE
```

**Statuts possibles:**
- `EN_ATTENTE`
- `VALIDE`
- `REFUSE`
- `SUSPENDU`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statut mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Ma Boutique",
    "statut": "VALIDE",
    "note": 4.5
  }
}
```

#### Mettre à jour les informations générales d'une boutique
```http
PUT /api/boutiques/{id}/infos
Content-Type: application/x-www-form-urlencoded

nom=Nouveau nom&description=Nouvelle description&addresse=Nouvelle adresse
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Informations mises à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Nouveau nom",
    "description": "Nouvelle description",
    "addresse": "Nouvelle adresse",
    "logo": "/uploads/produit/existing-logo.jpg",
    "statut": "VALIDE",
    "note": 4.5,
    "createdAt": "2026-04-26T15:57:33"
  }
}
```

#### Récupérer les boutiques d'un vendeur
```http
GET /api/boutiques/vendeur/{vendeurId}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Ma Boutique",
    "description": "Boutique de vêtements",
    "addresse": "Dakar, Plateau",
    "logo": "/uploads/produit/uuid.jpg",
    "statut": "VALIDE",
    "note": 4.5,
    "createdAt": "2026-04-26T15:57:33",
    "vendeur": {
      "id": 1,
      "email": "vendeur@example.com"
    }
  },
  {
    "id": 2,
    "nom": "Deuxième Boutique",
    "description": "Accessoires de mode",
    "addresse": "Dakar, Almadies",
    "logo": "/uploads/produit/uuid2.jpg",
    "statut": "EN_ATTENTE",
    "note": 4.2,
    "createdAt": "2026-04-26T16:00:00",
    "vendeur": {
      "id": 1,
      "email": "vendeur@example.com"
    }
  }
]
```

**Response (404 Not Found) si le vendeur n'existe pas:**
```json
{
  "success": false,
  "message": "Vendeur non trouvé",
  "data": null
}
```

#### Vérifier si un vendeur a une boutique
```http
GET /api/boutiques/exists/vendeur/{vendeurId}
```

**Response (200 OK):**
```json
true
```

ou

```json
false
```

#### Récupérer les boutiques du vendeur connecté
```http
GET /api/boutiques/mes-boutiques
Authorization: Bearer <token_jwt>
```

**Description:**
- Retourne la liste des boutiques du vendeur actuellement authentifié
- Nécessite le rôle `VENDEUR`
- Utilise des DTOs pour éviter les `LazyInitializationException`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Boutiques du vendeur récupérées avec succès",
  "data": [
    {
      "id": 1,
      "nom": "Boutique Mode Paris",
      "description": "Boutique de vêtements tendance",
      "vendeurId": 2,
      "addresse": "Paris, France",
      "logo": "/uploads/produit/boutique-logo.jpg",
      "statut": "VALIDE",
      "note": 4.5,
      "createdAt": "2026-04-26T19:00:00Z"
    }
  ]
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Utilisateur non authentifié
- `403 Forbidden` - Utilisateur n'a pas le rôle VENDEUR
- `500 Internal Server Error` - Erreur technique

---

#### Récupérer la boutique unique du vendeur connecté
```http
GET /api/boutiques/ma-boutique
Authorization: Bearer <token_jwt>
```

**Description:**
- Retourne directement la boutique unique du vendeur connecté (1 vendeur = 1 boutique)
- Optimisée pour le cas d'usage où chaque vendeur n'a qu'une seule boutique
- Nécessite le rôle `VENDEUR`
- Utilise des DTOs pour éviter les `LazyInitializationException`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Boutique du vendeur récupérée avec succès",
  "data": {
    "id": 1,
    "nom": "Boutique Mode Paris",
    "description": "Boutique de vêtements tendance",
    "vendeurId": 2,
    "addresse": "Paris, France",
    "logo": "/uploads/produit/boutique-logo.jpg",
    "statut": "VALIDE",
    "note": 4.5,
    "createdAt": "2026-04-26T19:00:00Z"
  }
}
```

**Response (404 Not Found) si le vendeur n'a pas de boutique:**
```json
{
  "success": false,
  "message": "Aucune boutique trouvée pour ce vendeur",
  "data": null
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Utilisateur non authentifié
- `403 Forbidden` - Utilisateur n'a pas le rôle VENDEUR
- `404 Not Found` - Le vendeur n'a pas de boutique
- `500 Internal Server Error` - Erreur technique

**Cas d'usage recommandé:**
- Application mobile vendeur où chaque vendeur gère une seule boutique
- Dashboard vendeur pour afficher rapidement les informations de sa boutique
- Plus simple que `/mes-boutiques` car retourne directement l'objet boutique (pas de tableau)

---

#### Rechercher des boutiques
```http
GET /api/boutiques/search?keyword=vêtements
GET /api/boutiques/statut/VALIDE
```

---

## Document Management APIs

### Document APIs

#### Types de documents disponibles
- `CARTE_IDENTITE`
- `NINEA`
- `PASSPORT` 
- `RCCM`

#### Créer un document
```http
POST /api/documents
Content-Type: application/json

{
  "personneId": 1,
  "type": "CARTE_IDENTITE",
  "url": "/uploads/documents/carte-id.jpg",
  "validated": false
}
```

#### Créer un document avec upload de fichier
```http
POST /api/documents/with-file
Content-Type: multipart/form-data

personneId: 1
type: "CARTE_IDENTITE"
file: [fichier image à stocker en local]
```

#### Mettre à jour le fichier d'un document
```http
POST /api/documents/{id}/file
Content-Type: multipart/form-data

file: [fichier image à stocker en local]
```

**Response (201 Created):**
```json
{
  "id": 1,
  "personneId": 1,
  "type": "CARTE_IDENTITE",
  "url": "/uploads/documents/carte-id.jpg",
  "validated": false,
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Types de documents disponibles
- `CARTE_IDENTITE`
- `NINEA`
- `PASSPORT`
- `RCCM`

**Note :** Les documents sont des fichiers images (JPG, PNG, etc.) stockés en local.

#### Mettre à jour un document
```http
PUT /api/documents/1
Content-Type: application/json

{
  "personneId": 1,
  "type": "CARTE_IDENTITE",
  "url": "/uploads/documents/carte-id-updated.jpg",
  "validated": true
}
```

#### Valider un document
```http
PUT /api/documents/1/validate
```

#### Rechercher des documents
```http
GET /api/documents/personne/1
GET /api/documents/type/CARTE_IDENTITE
GET /api/documents/validated/true
```

---

## Category Management APIs

### Sécurité et Autorisations

Le module de gestion des catégories utilise Spring Security avec des autorisations basées sur les rôles :

#### Rôles et Permissions
- **ADMIN** : Accès complet à toutes les fonctionnalités des catégories et sous-catégories

#### Endpoints Sécurisés

**Lecture (GET) - Accès public pour tous les utilisateurs authentifiés :**
- **Catégories** : `GET /api/categories`, `GET /api/categories/with-sous-categories`
- **Sous-Catégories** : `GET /api/sous-categories`, `GET /api/sous-categories/categorie/{id}`, `GET /api/sous-categories/categorie/{id}/with-produits`

**Écriture (POST, PUT, DELETE) - ADMIN uniquement :**
- **Catégories** : `POST /api/categories`, `PUT /api/categories/{id}`, `DELETE /api/categories/{id}`
- **Sous-Catégories** : `POST /api/sous-categories`, `PUT /api/sous-categories/{id}`, `DELETE /api/sous-categories/{id}`

#### Authentification Requise
- **Lecture** : Authentification JWT requise (ADMIN, VENDEUR, CLIENT)
- **Écriture** : Authentification JWT avec rôle ADMIN requise

### Catégorie APIs

#### Lister toutes les catégories
```http
GET /api/categories
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Vêtements Hommes",
    "description": "Collection complète de vêtements pour hommes",
    "createdAt": "2026-04-26T17:15:55"
  },
  {
    "id": 2,
    "nom": "Vêtements Femmes",
    "description": "Mode féminine tendance et élégante",
    "createdAt": "2026-04-26T17:15:55"
  }
]
```

#### Lister les catégories avec sous-catégories
```http
GET /api/categories/with-sous-categories
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Vêtements Hommes",
    "description": "Collection complète de vêtements pour hommes",
    "createdAt": "2026-04-26T17:15:55",
    "sousCategories": [
      {
        "id": 1,
        "nom": "Chemises",
        "description": "Chemises formelles et décontractées pour hommes"
      },
      {
        "id": 2,
        "nom": "T-shirts",
        "description": "T-shirts et débardeurs pour hommes"
      }
    ]
  }
]
```

#### Créer une catégorie
```http
POST /api/categories
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "nom": "Vêtements",
  "description": "Catégorie de vêtements pour hommes et femmes"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "nom": "Vêtements",
  "description": "Catégorie de vêtements pour hommes et femmes",
  "createdAt": "2026-04-26T17:15:55"
}
```

#### Rechercher des catégories
```http
GET /api/categories/search?keyword=vêtements
Authorization: Bearer <token_jwt>
```

```http
GET /api/categories/nom/Vêtements
Authorization: Bearer <token_jwt>
```

#### Modifier une catégorie
```http
PUT /api/categories/{id}
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "nom": "Nouveau nom",
  "description": "Nouvelle description"
}
```

### Sous-Catégorie APIs

#### Lister toutes les sous-catégories
```http
GET /api/sous-categories
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "categorie": {
      "id": 1,
      "nom": "Vêtements Hommes"
    },
    "createdAt": "2026-04-26T17:15:55"
  },
  {
    "id": 2,
    "nom": "T-shirts",
    "description": "T-shirts et débardeurs pour hommes",
    "categorie": {
      "id": 1,
      "nom": "Vêtements Hommes"
    },
    "createdAt": "2026-04-26T17:15:55"
  }
]
```

#### Lister les sous-catégories d'une catégorie
```http
GET /api/sous-categories/categorie/{categorieId}
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "categorie": {
      "id": 1,
      "nom": "Vêtements Hommes"
    },
    "createdAt": "2026-04-26T17:15:55"
  },
  {
    "id": 2,
    "nom": "T-shirts",
    "description": "T-shirts et débardeurs pour hommes",
    "categorie": {
      "id": 1,
      "nom": "Vêtements Hommes"
    },
    "createdAt": "2026-04-26T17:15:55"
  }
]
```

#### Lister les sous-catégories d'une catégorie avec produits
```http
GET /api/sous-categories/categorie/{categorieId}/with-produits
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "categorie": {
      "id": 1,
      "nom": "Vêtements Hommes"
    },
    "createdAt": "2026-04-26T17:15:55",
    "produits": [
      {
        "id": 1,
        "nom": "Chemise blanche",
        "prix": 2500.00
      }
    ]
  }
]
```

#### Créer une sous-catégorie
```http
POST /api/sous-categories
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "categorieId": 1,
  "nom": "T-shirts",
  "description": "T-shirts pour hommes"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "categorieId": 1,
  "nom": "T-shirts",
  "description": "T-shirts pour hommes",
  "createdAt": "2026-04-26T17:15:55"
}
```

#### Lister les sous-catégories
```http
GET /api/sous-categories
Authorization: Bearer <token_jwt>
```

#### Lister les sous-catégories avec informations de catégorie
```http
GET /api/sous-categories/with-categorie
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "categorieId": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "createdAt": "2026-04-26T18:40:47",
    "categorieNom": "Vêtements Hommes",
    "categorieDescription": "Collection complète de vêtements pour hommes"
  }
]
```

#### Rechercher des sous-catégories par ID catégorie avec informations
```http
GET /api/sous-categories/categorie/{categorieId}/with-categorie-info
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "categorieId": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "createdAt": "2026-04-26T18:40:47",
    "categorieNom": "Vêtements Hommes",
    "categorieDescription": "Collection complète de vêtements pour hommes"
  }
]
```

#### Rechercher des sous-catégories par catégorie et nom (LIKE)
```http
GET /api/sous-categories/categorie/{categorieId}/search/nom?nom=chem
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "categorieId": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "createdAt": "2026-04-26T18:40:47",
    "categorieNom": "Vêtements Hommes",
    "categorieDescription": "Collection complète de vêtements pour hommes"
  }
]
```

#### Rechercher des sous-catégories par nom avec informations de catégorie
```http
GET /api/sous-categories/search/nom/with-categorie?nom=chemise
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "categorieId": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "createdAt": "2026-04-26T18:40:47",
    "categorieNom": "Vêtements Hommes",
    "categorieDescription": "Collection complète de vêtements pour hommes"
  }
]
```

#### Rechercher des sous-catégories par mot-clé avec informations de catégorie
```http
GET /api/sous-categories/search/with-categorie?keyword=chemise
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "categorieId": 1,
    "nom": "Chemises",
    "description": "Chemises formelles et décontractées pour hommes",
    "createdAt": "2026-04-26T18:40:47",
    "categorieNom": "Vêtements Hommes",
    "categorieDescription": "Collection complète de vêtements pour hommes"
  }
]
```

#### Modifier une sous-catégorie
```http
PUT /api/sous-categories/{id}
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "categorieId": 1,
  "nom": "Polo shirts",
  "description": "Polo shirts pour hommes"
}
```

#### Supprimer une sous-catégorie
```http
DELETE /api/sous-categories/{id}
Authorization: Bearer <token_jwt>
```

**Response (204 No Content)**
```

#### Lister les sous-catégories
```http
GET /api/sous-categories
GET /api/sous-categories/categorie/1
```

#### Modifier une sous-catégorie
```http
PUT /api/sous-categories/{id}
Content-Type: application/json

{
  "categorieId": 1,
  "nom": "Polo shirts",
  "description": "Polos pour hommes"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "categorieId": 1,
  "nom": "Chemises",
  "description": "Chemises pour hommes",
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Lister les sous-catégories par catégorie
```http
GET /api/sous-categories/categorie/1
GET /api/sous-categories/categorie/1/with-produits
```

---

## Product Management APIs

### Produit APIs

#### Créer un produit
```http
POST /api/produits
Content-Type: application/json

{
  "boutiqueId": 1,
  "sousCategorieId": 1,
  "nom": "Chemise en coton",
  "description": "Chemise confortable en coton bio",
  "image": "https://example.com/chemise.jpg",
  "statut": "ACTIF"
}
```

#### Créer un produit avec upload d'image
```http
POST /api/produits/with-image
Content-Type: multipart/form-data

boutiqueId: 1
sousCategorieId: 1
nom: "Chemise en coton"
description: "Chemise confortable en coton bio"
statut: "ACTIF"
image: [fichier image]
```

**Response (201 Created):**
```json
{
  "id": 1,
  "boutiqueId": 1,
  "sousCategorieId": 1,
  "nom": "Chemise en coton",
  "description": "Chemise confortable en coton bio",
  "image": "/uploads/produit/3ac357ed-9e9e-4e4f-b633-b3ac6ec5ea60.jpeg",
  "statut": "ACTIF",
  "createdAt": "2026-04-26T22:26:50"
}
```

**Note :** Les images des produits sont des fichiers images (JPG, PNG, etc.) stockés en local dans le dossier `/uploads/produit/`.

#### Créer un produit avec plusieurs articles
```http
POST /api/produits/with-articles
Content-Type: multipart/form-data

boutiqueId: 1
sousCategorieId: 1
nom: "Chemise en coton"
description: "Chemise confortable en coton bio disponible en plusieurs tailles et couleurs"
statut: "ACTIF"
image: [fichier image du produit]
articles: [
  {
    "sku": "CHEMISE-ROUGE-M",
    "prix": 29.99,
    "stock": 50,
    "attributs": {
      "taille": "M",
      "couleur": "rouge",
      "matiere": "coton"
    }
  },
  {
    "sku": "CHEMISE-ROUGE-L",
    "prix": 29.99,
    "stock": 30,
    "attributs": {
      "taille": "L",
      "couleur": "rouge",
      "matiere": "coton"
    }
  },
  {
    "sku": "CHEMISE-BLEU-M",
    "prix": 29.99,
    "stock": 45,
    "attributs": {
      "taille": "M",
      "couleur": "bleu",
      "matiere": "coton"
    }
  }
]
```

**Response (201 Created):**
```json
{
  "id": 1,
  "boutiqueId": 1,
  "sousCategorieId": 1,
  "nom": "Chemise en coton",
  "description": "Chemise confortable en coton bio disponible en plusieurs tailles et couleurs",
  "image": "/uploads/produit/uuid-chemise.jpg",
  "statut": "ACTIF",
  "createdAt": "2026-04-30T20:01:31",
  "articles": [
    {
      "id": 1,
      "produitId": 1,
      "sku": "CHEMISE-ROUGE-M",
      "prix": 29.99,
      "stockActuel": 50,
      "attributs": "{\"taille\":\"M\",\"couleur\":\"rouge\",\"matiere\":\"coton\"}",
      "image": null
    },
    {
      "id": 2,
      "produitId": 1,
      "sku": "CHEMISE-ROUGE-L",
      "prix": 29.99,
      "stockActuel": 30,
      "attributs": "{\"taille\":\"L\",\"couleur\":\"rouge\",\"matiere\":\"coton\"}",
      "image": null
    },
    {
      "id": 3,
      "produitId": 1,
      "sku": "CHEMISE-BLEU-M",
      "prix": 29.99,
      "stockActuel": 45,
      "attributs": "{\"taille\":\"M\",\"couleur\":\"bleu\",\"matiere\":\"coton\"}",
      "image": null
    }
  ]
}
```

**Note :** Cette API utilise une transaction atomique. Si la création d'un article échoue, toute l'opération (produit + tous les articles) est annulée.

#### Lister les produits avec articles
```http
GET /api/produits/1/with-articles
```

#### Rechercher des produits
```http
GET /api/produits/boutique/1
GET /api/produits/sous-categorie/1
GET /api/produits/statut/ACTIF
GET /api/produits/search?keyword=chemise
```

#### Rechercher des produits par critères combinés
```http
GET /api/produits/search/combined?boutiqueId=1&sousCategorieId=2&nom=chemise
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "boutiqueId": 1,
    "sousCategorieId": 2,
    "nom": "Chemise en coton",
    "description": "Chemise confortable en coton bio",
    "image": "https://example.com/chemise.jpg",
    "statut": "ACTIF",
    "createdAt": "2026-04-26T18:46:39"
  }
]
```

#### Rechercher produits par boutique + sous-catégorie + nom (tous obligatoires)
```http
GET /api/produits/search/boutique-souscategorie-nom?boutiqueId=1&sousCategorieId=2&nom=chemise
Authorization: Bearer <token_jwt>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "boutiqueId": 1,
    "sousCategorieId": 2,
    "nom": "Chemise en coton",
    "description": "Chemise confortable en coton bio",
    "image": "https://example.com/chemise.jpg",
    "statut": "ACTIF",
    "createdAt": "2026-04-26T18:46:39"
  }
]
```

**Exemples d'utilisation :**
```http
# Recherche flexible (paramètres optionnels)
GET /api/produits/search/combined?boutiqueId=1&nom=chemise
GET /api/produits/search/combined?sousCategorieId=2&nom=chemise
GET /api/produits/search/combined?boutiqueId=1&sousCategorieId=2
GET /api/produits/search/combined?nom=chemise

# Recherche stricte (tous obligatoires)
GET /api/produits/search/boutique-souscategorie-nom?boutiqueId=1&sousCategorieId=2&nom=chemise
```

#### Activer/Désactiver un produit
```http
PUT /api/produits/1/activate
PUT /api/produits/1/deactivate
```

---

## Article Management APIs

### Article APIs

#### Créer un article
```http
POST /api/articles
Content-Type: application/json

{
  "produitId": 1,
  "sku": "CHM-COT-001",
  "prix": 29.99,
  "stockActuel": 50,
  "attributs": "{\"couleur\":\"bleu\",\"taille\":\"M\",\"matiere\":\"coton\"}",
  "image": "https://example.com/chemise-bleu.jpg"
}
```

#### Créer un article avec upload d'image
```http
POST /api/articles/with-image
Content-Type: multipart/form-data

produitId: 1
sku: "CHM-COT-001"
prix: 29.99
stockActuel: 50
attributs: "{\"couleur\":\"bleu\",\"taille\":\"M\",\"matiere\":\"coton\"}"
image: [fichier image]
```

#### Mettre à jour l'image d'un article
```http
POST /api/articles/{id}/image
Content-Type: multipart/form-data

image: [fichier image]
```

**Response (201 Created):**
```json
{
  "id": 1,
  "produitId": 1,
  "sku": "CHM-COT-001",
  "prix": 29.99,
  "stockActuel": 50,
  "attributs": "{\"couleur\":\"bleu\",\"taille\":\"M\",\"matiere\":\"coton\"}",
  "image": "https://example.com/chemise-bleu.jpg"
}
```

#### Gérer le stock
```http
# Mettre à jour le stock
PUT /api/articles/1/stock?newStock=45

# Ajouter du stock
PUT /api/articles/1/stock/add?quantity=10&motif=Réapprovisionnement

# Retirer du stock
PUT /api/articles/1/stock/remove?quantity=5&motif=Vente
```

#### Rechercher des articles
```http
GET /api/articles/produit/1
GET /api/articles/sku/CHM-COT-001
GET /api/articles/out-of-stock
GET /api/articles/price-range?min=20&max=50
GET /api/articles/search?keyword=bleu
```

#### Articles par stock
```http
GET /api/articles/stock/greater/10
GET /api/articles/stock/less/5
```

#### Statistiques sur les articles
```http
GET /api/articles/count/out-of-stock
GET /api/articles/price/min/1
GET /api/articles/price/max/1
GET /api/articles/stock/total/1
```

---

## Stock History APIs

### Historique de Stock APIs

#### Créer un mouvement de stock
```http
POST /api/historique-stock
Content-Type: application/json

{
  "articleId": 1,
  "quantite": 10,
  "type": "ENTREE",
  "motif": "Nouvelle livraison"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "articleId": 1,
  "quantite": 10,
  "type": "ENTREE",
  "motif": "Nouvelle livraison",
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Types de mouvements
- `ENTREE` - Entrée de stock
- `SORTIE` - Sortie de stock

#### Rechercher l'historique
```http
GET /api/historique-stock/article/1
GET /api/historique-stock/type/ENTREE
GET /api/historique-stock/article/1/type/ENTREE
GET /api/historique-stock/search/motif?keyword=livraison
```

#### Historique par plage de dates
```http
GET /api/historique-stock/date-range?startDate=2026-04-01T00:00:00&endDate=2026-04-30T23:59:59
GET /api/historique-stock/article/1/date-range?startDate=2026-04-01T00:00:00&endDate=2026-04-30T23:59:59
```

#### Derniers mouvements
```http
GET /api/historique-stock/latest
GET /api/historique-stock/latest/article/1
```

#### Statistiques sur les mouvements
```http
GET /api/historique-stock/total/entree/1
GET /api/historique-stock/total/sortie/1
GET /api/historique-stock/stats/type
```

---

## Exemples de Workflows Complets

### 1. Créer une boutique complète avec produits

```bash
# 1. Créer une personne
curl -X POST http://localhost:8081/api/personnes \
  -H "Content-Type: application/json" \
  -d '{"nom":"Seller","prenom":"John","email":"seller@example.com","telephone":"+221771234567","dateNaissance":"1985-05-15","adresse":"Dakar"}'

# 2. Créer son compte vendeur
curl -X POST http://localhost:8081/api/comptes \
  -H "Content-Type: application/json" \
  -d '{"personneId":1,"email":"seller@example.com","motDePasse":"password123","telephone":"+221771234567","role":"VENDEUR"}'

# 3. Créer une catégorie
curl -X POST http://localhost:8081/api/categories \
  -H "Content-Type: application/json" \
  -d '{"nom":"Électronique","description":"Appareils électroniques"}'

# 4. Créer une sous-catégorie
curl -X POST http://localhost:8081/api/sous-categories \
  -H "Content-Type: application/json" \
  -d '{"categorieId":1,"nom":"Smartphones","description":"Téléphones mobiles"}'

# 5. Créer la boutique
curl -X POST http://localhost:8081/api/boutiques \
  -H "Content-Type: application/json" \
  -d '{"vendeurId":1,"nom":"Tech Store","description":"Boutique de tech","addresse":"Dakar"}'

# 6. Valider la boutique
curl -X PUT http://localhost:8081/api/boutiques/1/validate

# 7. Créer un produit
curl -X POST http://localhost:8081/api/produits \
  -H "Content-Type: application/json" \
  -d '{"boutiqueId":1,"sousCategorieId":1,"nom":"iPhone 15","description":"Dernier iPhone","statut":"ACTIF"}'

# 8. Créer un article
curl -X POST http://localhost:8081/api/articles \
  -H "Content-Type: application/json" \
  -d '{"produitId":1,"sku":"IP15-128-BLK","prix":999.99,"stockActuel":25,"attributs":"{\"couleur\":\"noir\",\"capacite\":\"128GB\"}"}'
```

### 2. Gérer le stock d'un article

```bash
# Ajouter du stock
curl -X PUT "http://localhost:8081/api/articles/1/stock/add?quantity=10&motif=Réapprovisionnement"

# Retirer du stock (vente)
curl -X PUT "http://localhost:8081/api/articles/1/stock/remove?quantity=2&motif=Vente client"

# Vérifier l'historique
curl -X GET "http://localhost:8081/api/historique-stock/article/1"

# Vérifier le stock actuel
curl -X GET "http://localhost:8081/api/articles/1"
```

---

## Product Management APIs

### Produit APIs

#### Créer un produit
```http
POST /api/produits
Content-Type: application/json

{
  "nom": "iPhone 15 Pro",
  "description": "Dernier modèle d'iPhone avec écran OLED",
  "reference": "IP15-PRO-256",
  "categorieId": 1,
  "boutiqueId": 1,
  "image": "https://example.com/iphone15pro.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "nom": "iPhone 15 Pro",
  "description": "Dernier modèle d'iPhone avec écran OLED",
  "reference": "IP15-PRO-256",
  "categorieId": 1,
  "boutiqueId": 1,
  "image": "https://example.com/iphone15pro.jpg",
  "createdAt": "2026-04-13T01:50:00"
}
```

#### Lister les produits
```http
GET /api/produits
GET /api/produits/{id}/with-articles
```

#### Rechercher des produits
```http
GET /api/produits/search?keyword=iPhone
GET /api/produits/categorie/1
GET /api/produits/boutique/1
```

### Article APIs

#### Créer un article
```http
POST /api/articles
Content-Type: application/json

{
  "produitId": 1,
  "sku": "IP15-128-BLK",
  "prix": 999.99,
  "stockActuel": 25,
  "attributs": "{\"couleur\":\"noir\",\"capacite\":\"128GB\"}"
}
```

#### Modifier un article
```http
PUT /api/articles/{id}
Content-Type: application/json

{
  "produitId": 1,
  "sku": "IP15-128-BLK",
  "prix": 899.99,
  "stockActuel": 20,
  "attributs": "{\"couleur\":\"noir\",\"capacite\":\"128GB\"}"
}
```

#### Gérer le stock
```http
PUT /api/articles/{id}/stock/add?quantity=10&motif=Réapprovisionnement
PUT /api/articles/{id}/stock/remove?quantity=2&motif=Vente
```

#### Historique du stock
```http
GET /api/historique-stock/article/{id}
GET /api/historique-stock/produit/{id}
```

---

## Image Management APIs

### Sécurité et Autorisations

Le module de gestion des images utilise Spring Security avec des autorisations basées sur les rôles :

#### Rôles et Permissions
- **ADMIN** : Accès complet à toutes les fonctionnalités de gestion d'images
- **VENDEUR** : Peut uploader et supprimer ses propres images
- **CLIENT** : Peut valider des URLs d'images

#### Endpoints Sécurisés

**ADMIN et VENDEUR :**
- `POST /api/images/upload` - Uploader une image
- `DELETE /api/images/delete` - Supprimer une image

**Tous rôles authentifiés (ADMIN, VENDEUR, CLIENT) :**
- `GET /api/images/validate` - Valider une URL Cloudinary

#### Authentification Requise
Tous les endpoints nécessitent une authentification JWT valide.

### Image APIs

#### Uploader une image
```http
POST /api/images/upload
Content-Type: multipart/form-data

file: [fichier image]
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "Image uploadée avec succès",
  "data": {
    "url": "https://res.cloudinary.com/drrgj1x2a/image/upload/v1234567890/tissenza/xyz123.jpg",
    "message": "Image uploadée avec succès"
  }
}
```

#### Supprimer une image
```http
DELETE /api/images/delete?imageUrl=https://res.cloudinary.com/drrgj1x2a/image/upload/v1234567890/tissenza/xyz123.jpg
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Image supprimée avec succès",
  "data": {
    "deleted": true,
    "publicId": "tissenza/xyz123",
    "imageUrl": "https://res.cloudinary.com/drrgj1x2a/image/upload/v1234567890/tissenza/xyz123.jpg"
  }
}
```

#### Valider une URL Cloudinary
```http
GET /api/images/validate?imageUrl=https://res.cloudinary.com/drrgj1x2a/image/upload/v1234567890/tissenza/xyz123.jpg
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Validation de l'URL terminée",
  "data": {
    "isValid": true,
    "isCloudinary": true,
    "publicId": "tissenza/xyz123"
  }
}
```

### Configuration Cloudinary

Le système utilise Cloudinary pour le stockage des images avec les paramètres suivants :

- **Cloud Name** : drrgj1x2a
- **Dossier par défaut** : tissenza
- **Qualité automatique** : activée
- **Format optimisé** : activé
- **Types de fichiers supportés** : JPG, PNG, GIF, WEBP, etc.

### Contraintes et Validation

- **Taille maximale** : 10MB par fichier
- **Types MIME acceptés** : image/*
- **Format de sortie** : Optimisation automatique
- **Stockage** : Cloudinaire CDN global

---

## Module Paiement

### Sécurité et Autorisations

Le module paiement utilise Spring Security avec des autorisations basées sur les rôles :

#### Rôles et Permissions
- **ADMIN** : Accès complet à toutes les fonctionnalités
- **VENDEUR** : Gestion de ses propres moyens de paiement
- **CLIENT** : Visualisation et gestion de ses associations

#### Endpoints Sécurisés

**ADMIN uniquement :**
- `POST /api/paiement/moyens` - Créer un moyen de paiement
- `PUT /api/paiement/moyens/{id}` - Mettre à jour un moyen de paiement  
- `DELETE /api/paiement/moyens/{id}` - Supprimer un moyen de paiement
- `GET /api/paiement/associations/moyen/{moyenPaiementId}` - Lister les utilisateurs d'un moyen de paiement

**Tous rôles authentifiés (ADMIN, VENDEUR, CLIENT) :**
- `GET /api/paiement/moyens` - Lister tous les moyens de paiement
- `GET /api/paiement/moyens/{id}` - Détails d'un moyen de paiement
- `GET /api/paiement/moyens/search` - Rechercher des moyens de paiement
- `POST /api/paiement/associations` - Associer un moyen de paiement
- `GET /api/paiement/associations/user/{userId}` - Moyens de paiement d'un utilisateur
- `GET /api/paiement/associations/user/{userId}/actifs` - Moyens actifs d'un utilisateur
- `PUT /api/paiement/associations/{userId}/{moyenPaiementId}/activer` - Activer une association
- `PUT /api/paiement/associations/{userId}/{moyenPaiementId}/desactiver` - Désactiver une association
- `DELETE /api/paiement/associations/{userId}/{moyenPaiementId}` - Supprimer une association
- `GET /api/paiement/associations/{userId}/{moyenPaiementId}/check` - Vérifier une association
- `GET /api/paiement/associations/user/{userId}/count` - Compter les moyens actifs

#### Authentification Requise
Tous les endpoints nécessitent une authentification JWT valide sauf indication contraire.

### Gestion des Moyens de Paiement

#### Créer un moyen de paiement
```http
POST /api/paiement/moyens
Content-Type: application/json

{
  "nom": "Wave",
  "photo": "https://example.com/wave-logo.png"
}
```

#### Créer un moyen de paiement avec upload de photo
```http
POST /api/paiement/moyens/with-photo
Content-Type: multipart/form-data

nom: "Wave"
photo: [fichier image]
```

**Réponse:**
```json
{
  "success": true,
  "message": "Moyen de paiement créé avec succès",
  "data": {
    "id": 1,
    "nom": "Wave",
    "photo": "https://example.com/wave-logo.png",
    "createdAt": "2026-04-20T12:00:00"
  }
}
```

#### Lister tous les moyens de paiement
```http
GET /api/paiement/moyens
```

#### Récupérer un moyen de paiement par ID
```http
GET /api/paiement/moyens/{id}
```

#### Mettre à jour un moyen de paiement
```http
PUT /api/paiement/moyens/{id}
Content-Type: application/json

{
  "nom": "Orange Money",
  "photo": "https://example.com/orange-logo.png"
}
```

#### Supprimer un moyen de paiement
```http
DELETE /api/paiement/moyens/{id}
```

#### Rechercher des moyens de paiement
```http
GET /api/paiement/moyens/search?keyword=wave
```

### Gestion des Associations Utilisateur-Moyen de Paiement

#### Associer un moyen de paiement à un utilisateur
```http
POST /api/paiement/associations?userId=1&moyenPaiementId=2&actif=true&numero=771234567
```

**Réponse:**
```json
{
  "success": true,
  "message": "Association créée avec succès",
  "data": {
    "id": 1,
    "userId": 1,
    "userEmail": "user@example.com",
    "userNom": "John Doe",
    "moyenPaiementId": 2,
    "moyenPaiementNom": "Wave",
    "moyenPaiementPhoto": "https://example.com/wave-logo.png",
    "actif": true,
    "numero": "771234567",
    "createdAt": "2026-04-20T12:00:00"
  }
}
```

#### Lister les moyens de paiement d'un utilisateur
```http
GET /api/paiement/associations/user/{userId}
```

#### Lister les moyens de paiement actifs d'un utilisateur
```http
GET /api/paiement/associations/user/{userId}/actifs
```

#### Lister les utilisateurs ayant un moyen de paiement spécifique
```http
GET /api/paiement/associations/moyen/{moyenPaiementId}
```

#### Activer/Désactiver un moyen de paiement pour un utilisateur
```http
PUT /api/paiement/associations/{userId}/{moyenPaiementId}/activer
PUT /api/paiement/associations/{userId}/{moyenPaiementId}/desactiver
```

#### Supprimer une association
```http
DELETE /api/paiement/associations/{userId}/{moyenPaiementId}
```

#### Vérifier si un utilisateur a un moyen de paiement actif
```http
GET /api/paiement/associations/{userId}/{moyenPaiementId}/check
```

**Réponse:**
```json
{
  "success": true,
  "message": "Vérification terminée",
  "data": true
}
```

#### Compter les moyens de paiement actifs d'un utilisateur
```http
GET /api/paiement/associations/user/{userId}/count
```

**Réponse:**
```json
{
  "success": true,
  "message": "Nombre de moyens de paiement actifs",
  "data": 3
}
```

### Structure des Données

#### MoyenPaiement
```json
{
  "id": 1,
  "nom": "Wave",
  "photo": "https://example.com/wave-logo.png",
  "createdAt": "2026-04-20T12:00:00"
}
```

#### UserMoyenPaiement
```json
{
  "id": 1,
  "userId": 1,
  "userEmail": "user@example.com",
  "userNom": "John Doe",
  "moyenPaiementId": 2,
  "moyenPaiementNom": "Wave",
  "moyenPaiementPhoto": "https://example.com/wave-logo.png",
  "actif": true,
  "numero": "771234567",
  "createdAt": "2026-04-20T12:00:00"
}
```

### Contraintes et Validation

#### MoyenPaiement
- `nom`: obligatoire, max 100 caractères, unique
- `photo`: optionnel, max 255 caractères

#### UserMoyenPaiement
- `userId` et `moyenPaiementId`: obligatoires
- `actif`: défaut `true`
- `numero`: optionnel, max 50 caractères
- Contrainte unique sur `(userId, moyenPaiementId)`

---

## Codes d'Erreur Communs

- **400 Bad Request** - Données invalides ou manquantes
- **404 Not Found** - Ressource non trouvée
- **409 Conflict** - Conflit de données (ex: SKU déjà existant)
- **500 Internal Server Error** - Erreur serveur

---

## Notes importantes

1. **Authentication**: Actuellement tous les endpoints sont publics (`permitAll()`)
2. **Database**: PostgreSQL configuré pour le développement
3. **Enums**: Utilisent `VARCHAR` pour compatibilité PostgreSQL
4. **JSON**: Les attributs des articles sont stockés en JSON
5. **Timestamps**: Gérés automatiquement avec `@CreationTimestamp`
6. **Contraintes d'unicité**: 
   - `Compte.email` doit être unique
   - `Compte.telephone` doit être unique
   - `Article.sku` doit être unique

---

## **APIs de Panier**

### Gestion des Paniers

#### Récupérer le panier actif d'un client
```http
GET /api/paniers/client/{clientId}/actif
```

**Response (200 OK):**
```json
{
  "id": 1,
  "clientId": 1,
  "dateCreation": "2026-05-01 10:00:00",
  "updatedDate": "2026-05-01 10:30:00",
  "status": "EN_ATTENTE",
  "total": 149.97,
  "items": [
    {
      "id": 1,
      "panierId": 1,
      "articleId": 1,
      "quantite": 2,
      "prixUnitaire": 29.99,
      "sousTotal": 59.98,
      "date": "2026-05-01 10:15:00",
      "articleSku": "CHEMISE-ROUGE-M",
      "articleNom": "Chemise en coton",
      "articleImage": "/uploads/produit/chemise.jpg"
    },
    {
      "id": 2,
      "panierId": 1,
      "articleId": 2,
      "quantite": 3,
      "prixUnitaire": 29.99,
      "sousTotal": 89.97,
      "date": "2026-05-01 10:20:00",
      "articleSku": "PANTON-BLEU-L",
      "articleNom": "Pantalon en denim",
      "articleImage": "/uploads/produit/pantalon.jpg"
    }
  ]
}
```

#### Ajouter un article au panier
```http
POST /api/paniers/client/{clientId}/ajouter
Content-Type: application/json

{
  "articleId": 1,
  "quantite": 2,
  "prixUnitaire": 29.99
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "clientId": 1,
  "dateCreation": "2026-05-01 10:00:00",
  "updatedDate": "2026-05-01 10:30:00",
  "status": "EN_ATTENTE",
  "total": 149.97,
  "items": [...]
}
```

#### Mettre à jour la quantité d'un article
```http
PUT /api/paniers/{panierId}/article/{articleId}/quantite?quantite=3
```

#### Supprimer un article du panier
```http
DELETE /api/paniers/{panierId}/article/{articleId}
```

#### Vider le panier
```http
DELETE /api/paniers/{panierId}/vider
```

#### Valider le panier
```http
POST /api/paniers/{panierId}/valider
```

**Response (200 OK):**
```json
{
  "id": 1,
  "clientId": 1,
  "dateCreation": "2026-05-01 10:00:00",
  "updatedDate": "2026-05-01 10:30:00",
  "status": "VALIDE",
  "total": 149.97,
  "items": [...]
}
```

#### Récupérer un panier par ID
```http
GET /api/paniers/{panierId}
```

#### Récupérer tous les paniers d'un client
```http
GET /api/paniers/client/{clientId}
```

---

## **APIs de Commande**

### Gestion des Commandes

#### Créer une commande à partir d'un panier
```http
POST /api/commandes/creer/{panierId}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "clientId": 1,
  "panierId": 1,
  "date": "2026-05-01 11:00:00",
  "status": "EN_ATTENTE",
  "total": 149.97,
  "statusPaiement": "EN_ATTENTE",
  "details": [
    {
      "id": 1,
      "commandeId": 1,
      "articleId": 1,
      "quantite": 2,
      "prixUnitaire": 29.99,
      "sousTotal": 59.98,
      "date": "2026-05-01 11:00:00",
      "articleSku": "CHEMISE-ROUGE-M",
      "articleNom": "Chemise en coton",
      "articleImage": "/uploads/produit/chemise.jpg"
    },
    {
      "id": 2,
      "commandeId": 1,
      "articleId": 2,
      "quantite": 3,
      "prixUnitaire": 29.99,
      "sousTotal": 89.97,
      "date": "2026-05-01 11:00:00",
      "articleSku": "PANTON-BLEU-L",
      "articleNom": "Pantalon en denim",
      "articleImage": "/uploads/produit/pantalon.jpg"
    }
  ]
}
```

#### Récupérer une commande par ID
```http
GET /api/commandes/{commandeId}
```

#### Récupérer toutes les commandes d'un client
```http
GET /api/commandes/client/{clientId}
```

#### Récupérer les commandes par statut
```http
GET /api/commandes/statut/EN_ATTENTE
GET /api/commandes/statut/CONFIRMEE
GET /api/commandes/statut/EN_PREPARATION
GET /api/commandes/statut/ENVOYEE
GET /api/commandes/statut/LIVREE
GET /api/commandes/statut/ANNULEE
```

#### Récupérer les commandes par statut de paiement
```http
GET /api/commandes/paiement/EN_ATTENTE
GET /api/commandes/paiement/PAYEE
GET /api/commandes/paiement/REMBOURSEE
GET /api/commandes/paiement/ECHOUE
```

#### Récupérer toutes les commandes
```http
GET /api/commandes
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "client": {
      "id": 1,
      "nom": "Sow",
      "prenom": "Abdou"
    },
    "statut": "EN_PREPARATION",
    "statutPaiement": "PAYEE",
    "total": 25000.00,
    "date": "2026-05-02T10:30:00",
    "details": [
      {
        "article": {
          "id": 1,
          "nom": "Élégant Chemise 1",
          "prix": 15000.00
        },
        "quantite": 1,
        "prixUnitaire": 15000.00,
        "sousTotal": 15000.00
      }
    ]
  }
]
```

#### Récupérer les commandes par boutique
```http
GET /api/commandes/boutique/{boutiqueId}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "client": {
      "id": 1,
      "nom": "Sow",
      "prenom": "Abdou"
    },
    "statut": "LIVREE",
    "statutPaiement": "PAYEE",
    "total": 45000.00,
    "date": "2026-05-02T10:30:00"
  }
]
```

#### Récupérer les commandes par statut de paiement
```http
GET /api/commandes/paiement/{statutPaiement}
```

#### Mettre à jour le statut d'une commande
```http
PUT /api/commandes/{commandeId}/statut?statut=CONFIRMEE
```

#### Mettre à jour le statut de paiement d'une commande
```http
PUT /api/commandes/{commandeId}/paiement?statutPaiement=PAYEE
```

#### Annuler une commande
```http
POST /api/commandes/{commandeId}/annuler
```

#### Calculer le chiffre d'affaires total
```http
GET /api/commandes/chiffre-affaires
```

**Response (200 OK):**
```json
15456.78
```

#### Supprimer une commande (administrateur)
```http
DELETE /api/commandes/{commandeId}
```

---

### **Statuts possibles**

**Panier :**
- `EN_ATTENTE` : Panier actif, en cours de modification
- `VALIDE` : Panier validé, transformé en commande
- `ANNULE` : Panier annulé

**Commande :**
- `EN_ATTENTE` : Commande en attente de confirmation
- `CONFIRMEE` : Commande confirmée, en préparation
- `EN_PREPARATION` : Commande en cours de préparation
- `ENVOYEE` : Commande envoyée au client
- `LIVREE` : Commande livrée avec succès
- `ANNULEE` : Commande annulée

**Paiement :**
- `EN_ATTENTE` : Paiement en attente
- `PAYEE` : Paiement effectué
- `REMBOURSEE` : Paiement remboursé
- `ECHOUE` : Paiement échoué

---

### **Workflow complet**

1. **Créer/Récupérer le panier actif** : `GET /api/paniers/client/{clientId}/actif`
2. **Ajouter des articles** : `POST /api/paniers/client/{clientId}/ajouter`
3. **Modifier les quantités** : `PUT /api/paniers/{panierId}/article/{articleId}/quantite`
4. **Valider le panier** : `POST /api/paniers/{panierId}/valider`
5. **Créer la commande** : `POST /api/commandes/creer/{panierId}`
6. **Gérer la commande** : Mettre à jour statut, paiement, etc.

---

*Dernière mise à jour: 1 Mai 2026*
