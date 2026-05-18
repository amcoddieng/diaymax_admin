# 📚 Référence Complète des APIs - Diaymax Admin

## Table des Matières
1. [Configuration](#configuration)
2. [Authentification](#authentification)
3. [Utilisateurs](#utilisateurs)
4. [Boutiques](#boutiques)
5. [Catégories & Sous-catégories](#catégories--sous-catégories)
6. [Produits](#produits)
7. [Articles](#articles)
8. [Commandes](#commandes)
9. [Paniers](#paniers)
10. [Documents](#documents)

---

## Configuration

### Base URL
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  "http://10.153.46.247:8080"
```

### Headers par défaut
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'  // Ajouté automatiquement
}
```

### Intercepteurs
- **Request**: Ajoute le token d'authentification depuis `localStorage` (clé: `admin_token`)
- **Response**: En cas d'erreur 401, supprime les données et redirige vers `/login`

---

## Authentification

### 🔐 POST `/api/auth/login`
Connecte un utilisateur et retourne un JWT token.

**Body:**
```json
{
  "email": "user@example.com",
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
    "email": "user@example.com",
    "username": "John Doe",
    "role": "ADMIN",
    "photoProfil": "/uploads/image.jpeg",
    "expiresIn": 86400000
  }
}
```

**Utilisation:**
```javascript
import { authService } from '@/services/authService'

const login = async () => {
  try {
    const response = await authService.login('user@example.com', 'password123')
    localStorage.setItem('admin_token', response.data.data.token)
    localStorage.setItem('admin_user', JSON.stringify(response.data.data))
  } catch (error) {
    console.error('Erreur de connexion:', error)
  }
}
```

### 🚪 POST `/api/auth/logout`
Déconnecte l'utilisateur.

**Utilisation:**
```javascript
const logout = async () => {
  await authService.logout()
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}
```

### 👤 GET `/api/auth/me`
Récupère l'utilisateur courant.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "role": "ADMIN",
    "username": "John Doe"
  }
}
```

**Utilisation:**
```javascript
const getCurrentUser = async () => {
  const response = await authService.getCurrentUser()
  return response.data.data
}
```

---

## Utilisateurs

### 👥 GET `/api/personnes`
Récupère tous les utilisateurs.

**Utilisation:**
```javascript
import { userService } from '@/services/userService'

const getUsers = async () => {
  const response = await userService.getPersons()
  return response.data
}
```

### 👤 GET `/api/personnes/{id}`
Récupère un utilisateur par ID.

**Utilisation:**
```javascript
const getUser = async (userId: number) => {
  const response = await userService.getPersonById(userId)
  return response.data
}
```

### 🔍 GET `/api/personnes/search/nom?nom={nom}`
Recherche les utilisateurs par nom (LIKE).

**Query Parameters:**
- `nom` (string): Nom ou partie du nom

**Utilisation:**
```javascript
const searchUsers = async (nom: string) => {
  const response = await userService.searchPersons(nom)
  return response.data
}
```

### 📊 GET `/api/personnes/count`
Compte total des utilisateurs.

**Utilisation:**
```javascript
const countUsers = async () => {
  const response = await userService.countPersons()
  return response.data.data // Nombre
}
```

### 📸 POST `/api/personnes/{id}/photo-profil`
Upload une photo de profil.

**Content-Type:** `multipart/form-data`

**Utilisation:**
```javascript
const uploadProfilePhoto = async (userId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await userService.updateProfilePhoto(userId, formData)
  return response.data
}
```

### 🏦 GET `/api/comptes`
Récupère tous les comptes.

**Utilisation:**
```javascript
const getAccounts = async () => {
  const response = await userService.getAccounts()
  return response.data
}
```

### ✅ POST `/api/comptes`
Crée un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John",
  "role": "CLIENT"
}
```

**Utilisation:**
```javascript
const createAccount = async (data: any) => {
  const response = await userService.createAccount(data)
  return response.data
}
```

### 🔄 PUT `/api/comptes/{id}/activate`
Active un compte utilisateur.

**Utilisation:**
```javascript
const activateAccount = async (accountId: number) => {
  const response = await userService.updateAccountStatus(accountId, 'activate')
  return response.data
}
```

### 🔄 PUT `/api/comptes/{id}/deactivate`
Désactive un compte utilisateur.

**Utilisation:**
```javascript
const deactivateAccount = async (accountId: number) => {
  const response = await userService.updateAccountStatus(accountId, 'deactivate')
  return response.data
}
```

### ✔️ PUT `/api/comptes/{id}/verify`
Vérifie (valide) un compte utilisateur.

**Utilisation:**
```javascript
const verifyAccount = async (accountId: number) => {
  const response = await userService.verifyAccount(accountId)
  return response.data
}
```

### 📝 PUT `/api/comptes/{id}/with-personne`
Met à jour le compte et les données de la personne.

**Body:**
```json
{
  "email": "newemail@example.com",
  "nom": "Doe",
  "prenom": "Jane"
}
```

**Utilisation:**
```javascript
const updateAccountAndPerson = async (accountId: number, data: any) => {
  const response = await userService.updateCompteAndPersonne(accountId, data)
  return response.data
}
```

---

## Boutiques

### 🏪 GET `/api/boutiques`
Récupère toutes les boutiques.

**Utilisation:**
```javascript
import { boutiqueService } from '@/services/boutiqueService'

const getBoutiques = async () => {
  const response = await boutiqueService.getBoutiques()
  return response.data
}
```

### 🏪 GET `/api/boutiques/{id}`
Récupère une boutique par ID.

**Utilisation:**
```javascript
const getBoutique = async (boutiqueId: number) => {
  const response = await boutiqueService.getBoutiqueById(boutiqueId)
  return response.data
}
```

### ➕ POST `/api/boutiques/with-logo`
Crée une nouvelle boutique avec logo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `nom` (string): Nom de la boutique
- `description` (string): Description
- `adresse` (string): Adresse
- `telephone` (string): Téléphone
- `email` (string): Email
- `logo` (file): Fichier du logo

**Utilisation:**
```javascript
const createBoutique = async (formData: FormData) => {
  const response = await boutiqueService.createBoutique(formData)
  return response.data
}
```

### ✏️ PUT `/api/boutiques/{id}`
Met à jour les informations de la boutique.

**Body:**
```json
{
  "nom": "New Boutique Name",
  "description": "New description",
  "adresse": "New address"
}
```

**Utilisation:**
```javascript
const updateBoutique = async (boutiqueId: number, data: any) => {
  const response = await boutiqueService.updateBoutique(boutiqueId, data)
  return response.data
}
```

### 📸 POST `/api/boutiques/{id}/logo`
Change le logo de la boutique.

**Content-Type:** `multipart/form-data`

**Utilisation:**
```javascript
const updateLogo = async (boutiqueId: number, file: File) => {
  const formData = new FormData()
  formData.append('logo', file)
  
  const response = await boutiqueService.updateBoutiqueLogo(boutiqueId, formData)
  return response.data
}
```

### ⭐ PUT `/api/boutiques/{id}/note?note={note}`
Met à jour la note (rating) de la boutique.

**Query Parameters:**
- `note` (number): Note de 1 à 5

**Utilisation:**
```javascript
const updateNote = async (boutiqueId: number, note: number) => {
  const response = await boutiqueService.updateBoutiqueNote(boutiqueId, note)
  return response.data
}
```

### 🔄 PUT `/api/boutiques/{id}/statut?statut={statut}`
Change le statut de la boutique.

**Query Parameters:**
- `statut` (string): ACTIF, INACTIF, SUSPENDUE, FERMEE

**Utilisation:**
```javascript
const updateStatus = async (boutiqueId: number, statut: string) => {
  const response = await boutiqueService.updateBoutiqueStatus(boutiqueId, statut)
  return response.data
}
```

### 🔍 GET `/api/boutiques/vendeur/{vendeurId}`
Récupère les boutiques d'un vendeur spécifique.

**Utilisation:**
```javascript
const getBoutiquesByVendeur = async (vendeurId: number) => {
  const response = await boutiqueService.getBoutiquesByVendeur(vendeurId)
  return response.data
}
```

### 🔎 GET `/api/boutiques/search?keyword={keyword}`
Recherche les boutiques par mot-clé.

**Query Parameters:**
- `keyword` (string): Mot-clé de recherche

**Utilisation:**
```javascript
const searchBoutiques = async (keyword: string) => {
  const response = await boutiqueService.searchBoutiques(keyword)
  return response.data
}
```

### 📋 GET `/api/boutiques/statut/{statut}`
Récupère les boutiques par statut.

**Utilisation:**
```javascript
const getBoutiquesByStatus = async (statut: string) => {
  const response = await boutiqueService.getBoutiquesByStatus(statut)
  return response.data
}
```

### 👨‍💼 GET `/api/boutiques/mes-boutiques`
Récupère les boutiques de l'utilisateur vendeur actuel.

**Utilisation:**
```javascript
const getMyBoutiques = async () => {
  const response = await boutiqueService.getVendeurBoutiques()
  return response.data
}
```

### 👨‍💼 GET `/api/boutiques/ma-boutique`
Récupère la boutique principale du vendeur actuel.

**Utilisation:**
```javascript
const getMyBoutique = async () => {
  const response = await boutiqueService.getVendeurBoutique()
  return response.data
}
```

---

## Catégories & Sous-catégories

### 📂 GET `/api/categories`
Récupère toutes les catégories.

**Utilisation:**
```javascript
import { categoryService } from '@/services/categoryService'

const getCategories = async () => {
  const response = await categoryService.getCategories()
  return response.data
}
```

### 📂 GET `/api/categories/with-sous-categories`
Récupère toutes les catégories avec leurs sous-catégories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Vêtements",
      "description": "Tous les vêtements",
      "sousCategories": [
        {
          "id": 1,
          "nom": "Chemises",
          "description": "Chemises formelles"
        }
      ]
    }
  ]
}
```

**Utilisation:**
```javascript
const getCategoriesWithSubCategories = async () => {
  const response = await categoryService.getCategoriesWithSubCategories()
  return response.data
}
```

### ➕ POST `/api/categories`
Crée une nouvelle catégorie.

**Body:**
```json
{
  "nom": "Vêtements",
  "description": "Tous les vêtements pour hommes et femmes"
}
```

**Utilisation:**
```javascript
const createCategory = async (data: any) => {
  const response = await categoryService.createCategory(data)
  return response.data
}
```

### ✏️ PUT `/api/categories/{id}`
Met à jour une catégorie.

**Utilisation:**
```javascript
const updateCategory = async (categoryId: number, data: any) => {
  const response = await categoryService.updateCategory(categoryId, data)
  return response.data
}
```

### 🗑️ DELETE `/api/categories/{id}`
Supprime une catégorie.

**Utilisation:**
```javascript
const deleteCategory = async (categoryId: number) => {
  const response = await categoryService.deleteCategory(categoryId)
  return response.data
}
```

### 🔎 GET `/api/categories/search?keyword={keyword}`
Recherche les catégories par mot-clé.

**Utilisation:**
```javascript
const searchCategories = async (keyword: string) => {
  const response = await categoryService.searchCategories(keyword)
  return response.data
}
```

---

### 📑 GET `/api/sous-categories`
Récupère toutes les sous-catégories.

**Utilisation:**
```javascript
import { subCategoryService } from '@/services/categoryService'

const getSubCategories = async () => {
  const response = await subCategoryService.getSubCategories()
  return response.data
}
```

### 📑 GET `/api/sous-categories/with-categorie`
Récupère toutes les sous-catégories avec les infos de leur catégorie.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categorieId": 1,
      "nom": "Chemises",
      "description": "Chemises formelles",
      "categorieNom": "Vêtements",
      "categorieDescription": "Collection complète"
    }
  ]
}
```

**Utilisation:**
```javascript
const getSubCategoriesWithInfo = async () => {
  const response = await subCategoryService.getSubCategoriesWithCategory()
  return response.data
}
```

### 📑 GET `/api/sous-categories/categorie/{categoryId}`
Récupère les sous-catégories d'une catégorie spécifique.

**Utilisation:**
```javascript
const getSubCategoriesByCategory = async (categoryId: number) => {
  const response = await subCategoryService.getSubCategoriesByCategory(categoryId)
  return response.data
}
```

### 📑 GET `/api/sous-categories/categorie/{categoryId}/with-categorie-info`
Récupère les sous-catégories d'une catégorie avec les infos détaillées.

**Utilisation:**
```javascript
const getSubCategoriesWithCategoryInfo = async (categoryId: number) => {
  const response = await subCategoryService.getSubCategoriesByCategoryWithInfo(categoryId)
  return response.data
}
```

### ➕ POST `/api/sous-categories`
Crée une nouvelle sous-catégorie.

**Body:**
```json
{
  "categorieId": 1,
  "nom": "Chemises",
  "description": "Chemises formelles et casual"
}
```

**Utilisation:**
```javascript
const createSubCategory = async (data: any) => {
  const response = await subCategoryService.createSubCategory(data)
  return response.data
}
```

### ✏️ PUT `/api/sous-categories/{id}`
Met à jour une sous-catégorie.

**Utilisation:**
```javascript
const updateSubCategory = async (subCategoryId: number, data: any) => {
  const response = await subCategoryService.updateSubCategory(subCategoryId, data)
  return response.data
}
```

### 🗑️ DELETE `/api/sous-categories/{id}`
Supprime une sous-catégorie.

**Utilisation:**
```javascript
const deleteSubCategory = async (subCategoryId: number) => {
  const response = await subCategoryService.deleteSubCategory(subCategoryId)
  return response.data
}
```

### 🔎 GET `/api/sous-categories/search/with-categorie?keyword={keyword}`
Recherche les sous-catégories avec infos catégorie.

**Utilisation:**
```javascript
const searchSubCategories = async (keyword: string) => {
  const response = await subCategoryService.searchSubCategories(keyword)
  return response.data
}
```

### 🔎 GET `/api/sous-categories/search/nom/with-categorie?nom={nom}`
Recherche les sous-catégories par nom (LIKE) avec infos catégorie.

**Utilisation:**
```javascript
const searchSubCategoriesByName = async (nom: string) => {
  const response = await subCategoryService.searchSubCategoriesByName(nom)
  return response.data
}
```

### 🔎 GET `/api/sous-categories/categorie/{categoryId}/search/nom?nom={nom}`
Recherche les sous-catégories dans une catégorie par nom.

**Utilisation:**
```javascript
const searchInCategory = async (categoryId: number, nom: string) => {
  const response = await subCategoryService.searchSubCategoriesByCategoryAndName(categoryId, nom)
  return response.data
}
```

---

## Produits

### 📦 GET `/api/produits`
Récupère tous les produits.

**Utilisation:**
```javascript
import { productService } from '@/services/productService'

const getProducts = async () => {
  const response = await productService.getProducts()
  return response.data
}
```

### 📦 GET `/api/produits/{id}`
Récupère un produit par ID.

**Utilisation:**
```javascript
const getProduct = async (productId: number) => {
  const response = await productService.getProductById(productId)
  return response.data
}
```

### ➕ POST `/api/produits/with-image`
Crée un nouveau produit avec image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `nom` (string): Nom du produit
- `description` (string): Description
- `sousCategorieId` (number): ID de la sous-catégorie
- `boutiqueId` (number): ID de la boutique
- `image` (file): Fichier de l'image

**Utilisation:**
```javascript
const createProduct = async (formData: FormData) => {
  const response = await productService.createProduct(formData)
  return response.data
}
```

### ✏️ PUT `/api/produits/{id}`
Met à jour un produit.

**Body:**
```json
{
  "nom": "New Product Name",
  "description": "New description",
  "sousCategorieId": 2
}
```

**Utilisation:**
```javascript
const updateProduct = async (productId: number, data: any) => {
  const response = await productService.updateProduct(productId, data)
  return response.data
}
```

### 🗑️ DELETE `/api/produits/{id}`
Supprime un produit.

**Utilisation:**
```javascript
const deleteProduct = async (productId: number) => {
  const response = await productService.deleteProduct(productId)
  return response.data
}
```

### 🔎 GET `/api/produits/search/combined`
Recherche flexible de produits (paramètres optionnels).

**Query Parameters:**
- `boutiqueId` (number, optional): ID de la boutique
- `sousCategorieId` (number, optional): ID de la sous-catégorie
- `nom` (string, optional): Nom du produit

**Utilisation:**
```javascript
const searchProducts = async (params: any) => {
  const response = await productService.searchProducts(params)
  return response.data
}

// Exemple:
searchProducts({
  boutiqueId: 1,
  sousCategorieId: 2,
  nom: 'chemise'
})
```

### 🔎 GET `/api/produits/search/boutique-souscategorie-nom`
Recherche stricte de produits (tous les paramètres obligatoires).

**Query Parameters:**
- `boutiqueId` (number): ID de la boutique
- `sousCategorieId` (number): ID de la sous-catégorie
- `nom` (string): Nom du produit

**Utilisation:**
```javascript
const searchProductsStrict = async (params: any) => {
  const response = await productService.searchProductsByBoutiqueAndCategory(params)
  return response.data
}
```

---

## Articles

### 📋 POST `/api/articles`
Crée un nouvel article (variant de produit).

**Body:**
```json
{
  "produitId": 1,
  "sku": "SKU-001",
  "prix": 25000,
  "stockActuel": 50,
  "attributs": "Taille: M, Couleur: Bleu"
}
```

**Utilisation:**
```javascript
import { articleService } from '@/services/articleService'

const createArticle = async (data: any) => {
  const response = await articleService.createArticle(data)
  return response.data
}
```

### 📋 POST `/api/articles/with-image?produitId={produitId}`
Crée un article avec image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `sku` (string): Code SKU unique
- `prix` (number): Prix de l'article
- `stockActuel` (number): Quantité en stock
- `attributs` (string): Attributs (ex: Taille, Couleur)
- `image` (file): Fichier de l'image

**Utilisation:**
```javascript
const createArticleWithImage = async (productId: number, formData: FormData) => {
  const response = await articleService.createArticleWithImage(productId, formData)
  return response.data
}
```

### 📋 GET `/api/articles/produit/{produitId}`
Récupère tous les articles (variants) d'un produit.

**Utilisation:**
```javascript
const getArticlesByProduct = async (productId: number) => {
  const response = await articleService.getArticlesByProduct(productId)
  return response.data
}
```

### 📋 GET `/api/articles/sku/{sku}`
Récupère un article par son SKU.

**Utilisation:**
```javascript
const getArticleBySku = async (sku: string) => {
  const response = await articleService.getArticleBySku(sku)
  return response.data
}
```

### ✏️ PUT `/api/articles/{id}`
Met à jour un article.

**Body:**
```json
{
  "sku": "SKU-001",
  "prix": 27000,
  "stockActuel": 45,
  "attributs": "Taille: L, Couleur: Rouge"
}
```

**Utilisation:**
```javascript
const updateArticle = async (articleId: number, data: any) => {
  const response = await articleService.updateArticle(articleId, data)
  return response.data
}
```

### 🗑️ DELETE `/api/articles/{id}`
Supprime un article.

**Utilisation:**
```javascript
const deleteArticle = async (articleId: number) => {
  const response = await articleService.deleteArticle(articleId)
  return response.data
}
```

### 📸 POST `/api/articles/{id}/image`
Change l'image d'un article.

**Content-Type:** `multipart/form-data`

**Utilisation:**
```javascript
const updateArticleImage = async (articleId: number, file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await articleService.updateArticleImage(articleId, formData)
  return response.data
}
```

### 📊 PUT `/api/articles/{id}/stock?newStock={newStock}`
Définit le stock d'un article.

**Query Parameters:**
- `newStock` (number): Nouvelle quantité en stock

**Utilisation:**
```javascript
const setStock = async (articleId: number, newStock: number) => {
  const response = await articleService.updateStock(articleId, newStock)
  return response.data
}
```

### ➕ PUT `/api/articles/{id}/stock/add?quantity={quantity}&motif={motif}`
Ajoute du stock (entrée).

**Query Parameters:**
- `quantity` (number): Quantité à ajouter
- `motif` (string): Raison (ex: "Réapprovisionement")

**Utilisation:**
```javascript
const addStock = async (articleId: number, quantity: number, motif: string) => {
  const response = await articleService.addStock(articleId, quantity, motif)
  return response.data
}
```

### ➖ PUT `/api/articles/{id}/stock/remove?quantity={quantity}&motif={motif}`
Retire du stock (sortie).

**Query Parameters:**
- `quantity` (number): Quantité à retirer
- `motif` (string): Raison (ex: "Vente", "Retour client")

**Utilisation:**
```javascript
const removeStock = async (articleId: number, quantity: number, motif: string) => {
  const response = await articleService.removeStock(articleId, quantity, motif)
  return response.data
}
```

### 🚫 GET `/api/articles/out-of-stock`
Récupère tous les articles en rupture de stock.

**Utilisation:**
```javascript
const getOutOfStockArticles = async () => {
  const response = await articleService.getOutOfStockArticles()
  return response.data
}
```

### 💰 GET `/api/articles/price-range?min={min}&max={max}`
Récupère les articles dans une gamme de prix.

**Query Parameters:**
- `min` (number): Prix minimum
- `max` (number): Prix maximum

**Utilisation:**
```javascript
const getArticlesByPriceRange = async (min: number, max: number) => {
  const response = await articleService.getArticlesByPriceRange(min, max)
  return response.data
}
```

### 🔎 GET `/api/articles/search?keyword={keyword}`
Recherche les articles par mot-clé.

**Utilisation:**
```javascript
const searchArticles = async (keyword: string) => {
  const response = await articleService.searchArticles(keyword)
  return response.data
}
```

### 📊 GET `/api/articles/stock/greater/{stock}`
Récupère les articles avec un stock supérieur à.

**Utilisation:**
```javascript
const getArticlesWithHighStock = async (minStock: number) => {
  const response = await articleService.getArticlesWithStockGreaterThan(minStock)
  return response.data
}
```

### 📊 GET `/api/articles/stock/less/{stock}`
Récupère les articles avec un stock inférieur à.

**Utilisation:**
```javascript
const getArticlesWithLowStock = async (maxStock: number) => {
  const response = await articleService.getArticlesWithStockLessThan(maxStock)
  return response.data
}
```

### 📈 GET `/api/articles/count/out-of-stock`
Compte le nombre d'articles en rupture.

**Utilisation:**
```javascript
const countOutOfStock = async () => {
  const response = await articleService.getOutOfStockCount()
  return response.data.data
}
```

### 💰 GET `/api/articles/price/min/{produitId}`
Récupère le prix minimum d'un produit (tous les articles).

**Utilisation:**
```javascript
const getMinPrice = async (productId: number) => {
  const response = await articleService.getMinPriceByProduct(productId)
  return response.data.data
}
```

### 💰 GET `/api/articles/price/max/{produitId}`
Récupère le prix maximum d'un produit.

**Utilisation:**
```javascript
const getMaxPrice = async (productId: number) => {
  const response = await articleService.getMaxPriceByProduct(productId)
  return response.data.data
}
```

### 📊 GET `/api/articles/stock/total/{produitId}`
Récupère le stock total d'un produit.

**Utilisation:**
```javascript
const getTotalStock = async (productId: number) => {
  const response = await articleService.getTotalStockByProduct(productId)
  return response.data.data
}
```

### 📋 GET `/api/articles`
Récupère tous les articles.

**Utilisation:**
```javascript
const getAllArticles = async () => {
  const response = await articleService.getAllArticles()
  return response.data
}
```

---

## Commandes

### 📦 GET `/api/commandes`
Récupère toutes les commandes.

**Utilisation:**
```javascript
import { orderService } from '@/services/orderService'

const getOrders = async () => {
  const response = await orderService.getOrders()
  return response.data
}
```

### 📦 GET `/api/commandes/{id}`
Récupère une commande par ID.

**Utilisation:**
```javascript
const getOrder = async (orderId: number) => {
  const response = await orderService.getOrderById(orderId)
  return response.data
}
```

### 👤 GET `/api/commandes/client/{clientId}`
Récupère les commandes d'un client spécifique.

**Utilisation:**
```javascript
const getOrdersByClient = async (clientId: number) => {
  const response = await orderService.getOrdersByClient(clientId)
  return response.data
}
```

### 🏪 GET `/api/commandes/boutique/{boutiqueId}`
Récupère les commandes d'une boutique spécifique.

**Utilisation:**
```javascript
const getOrdersByBoutique = async (boutiqueId: number) => {
  const response = await orderService.getOrdersByBoutique(boutiqueId)
  return response.data
}
```

### 🏷️ GET `/api/commandes/statut/{status}`
Récupère les commandes par statut.

**Statuts disponibles:** `EN_ATTENTE`, `CONFIRMEE`, `EXPEDIEE`, `LIVREE`, `ANNULEE`

**Utilisation:**
```javascript
const getOrdersByStatus = async (status: string) => {
  const response = await orderService.getOrdersByStatus(status)
  return response.data
}
```

### 💳 GET `/api/commandes/paiement/{status}`
Récupère les commandes par statut de paiement.

**Statuts:** `EN_ATTENTE`, `PAYEE`, `REMBOURSEE`

**Utilisation:**
```javascript
const getOrdersByPaymentStatus = async (status: string) => {
  const response = await orderService.getOrdersByPaymentStatus(status)
  return response.data
}
```

### ✏️ PUT `/api/commandes/{orderId}/statut?statut={statut}`
Change le statut d'une commande.

**Query Parameters:**
- `statut` (string): Nouveau statut

**Utilisation:**
```javascript
const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await orderService.updateOrderStatus(orderId, status)
  return response.data
}
```

### 💳 PUT `/api/commandes/{orderId}/paiement?statutPaiement={statutPaiement}`
Change le statut du paiement.

**Query Parameters:**
- `statutPaiement` (string): Nouveau statut de paiement

**Utilisation:**
```javascript
const updatePaymentStatus = async (orderId: number, status: string) => {
  const response = await orderService.updatePaymentStatus(orderId, status)
  return response.data
}
```

### ❌ POST `/api/commandes/{orderId}/annuler`
Annule une commande.

**Utilisation:**
```javascript
const cancelOrder = async (orderId: number) => {
  const response = await orderService.cancelOrder(orderId)
  return response.data
}
```

### 🗑️ DELETE `/api/commandes/{orderId}`
Supprime une commande (admin uniquement).

**Utilisation:**
```javascript
const deleteOrder = async (orderId: number) => {
  const response = await orderService.deleteOrder(orderId)
  return response.data
}
```

### 💰 GET `/api/commandes/chiffre-affaires`
Récupère le chiffre d'affaires total.

**Utilisation:**
```javascript
const getTotalRevenue = async () => {
  const response = await orderService.getTotalRevenue()
  return response.data.data
}
```

### ➕ POST `/api/commandes/creer/{cartId}`
Crée une commande à partir d'un panier.

**Utilisation:**
```javascript
const createOrderFromCart = async (cartId: number) => {
  const response = await orderService.createOrderFromCart(cartId)
  return response.data
}
```

---

## Paniers

### 🛒 POST `/api/paniers`
Crée un nouveau panier.

**Body:**
```json
{
  "clientId": 1
}
```

**Utilisation:**
```javascript
import { cartService } from '@/services/cartService'

const createCart = async (clientId: number) => {
  const response = await cartService.createCart(clientId)
  return response.data
}
```

### 🛒 GET `/api/paniers/{cartId}`
Récupère un panier avec ses articles.

**Utilisation:**
```javascript
const getCart = async (cartId: number) => {
  const response = await cartService.getCartById(cartId)
  return response.data
}
```

### ✏️ PUT `/api/paniers/{cartId}`
Met à jour un panier.

**Body:**
```json
{
  "statut": "VALIDE"
}
```

**Utilisation:**
```javascript
const updateCart = async (cartId: number, data: any) => {
  const response = await cartService.updateCart(cartId, data)
  return response.data
}
```

### 🗑️ DELETE `/api/paniers/{cartId}`
Supprime un panier.

**Utilisation:**
```javascript
const deleteCart = async (cartId: number) => {
  const response = await cartService.deleteCart(cartId)
  return response.data
}
```

### ➕ POST `/api/paniers/client/{clientId}/ajouter`
Ajoute un article au panier.

**Body:**
```json
{
  "articleId": 1,
  "quantite": 2,
  "prixUnitaire": 25000
}
```

**Utilisation:**
```javascript
const addItemToCart = async (
  clientId: number,
  articleId: number,
  quantite: number,
  prixUnitaire: number
) => {
  const response = await cartService.addItemToCart(
    clientId,
    articleId,
    quantite,
    prixUnitaire
  )
  return response.data
}
```

### ✏️ PUT `/api/paniers/{cartId}/article/{articleId}/quantite?quantite={quantite}`
Modifie la quantité d'un article dans le panier.

**Query Parameters:**
- `quantite` (number): Nouvelle quantité

**Utilisation:**
```javascript
const updateCartItemQuantity = async (
  cartId: number,
  articleId: number,
  quantite: number
) => {
  const response = await cartService.updateCartItem(cartId, articleId, quantite)
  return response.data
}
```

### 🗑️ DELETE `/api/paniers/{cartId}/article/{articleId}`
Retire un article du panier.

**Utilisation:**
```javascript
const removeItemFromCart = async (cartId: number, articleId: number) => {
  const response = await cartService.deleteCartItem(cartId, articleId)
  return response.data
}
```

### ✅ POST `/api/paniers/{cartId}/valider`
Valide le panier.

**Utilisation:**
```javascript
const validateCart = async (cartId: number) => {
  const response = await cartService.validateCart(cartId)
  return response.data
}
```

### 👤 GET `/api/paniers/client/{clientId}`
Récupère tous les paniers d'un client.

**Utilisation:**
```javascript
const getClientCarts = async (clientId: number) => {
  const response = await cartService.getCartsByClient(clientId)
  return response.data
}
```

### 📋 GET `/api/paniers`
Récupère tous les paniers.

**Utilisation:**
```javascript
const getAllCarts = async () => {
  const response = await cartService.getAllCarts()
  return response.data
}
```

### 📋 GET `/api/paniers/client/{clientId}/actif`
Récupère le panier actif d'un client.

**Utilisation:**
```javascript
const getActiveCart = async (clientId: number) => {
  const response = await cartService.getActiveCartByClient(clientId)
  return response.data
}
```

### 🗑️ DELETE `/api/paniers/{cartId}/vider`
Vide entièrement le panier.

**Utilisation:**
```javascript
const clearCart = async (cartId: number) => {
  const response = await cartService.clearCart(cartId)
  return response.data
}
```

---

## Documents

### 📄 GET `/api/documents`
Récupère tous les documents.

**Utilisation:**
```javascript
import { documentService } from '@/services/documentService'

const getDocuments = async () => {
  const response = await documentService.getDocuments()
  return response.data
}
```

### 📄 GET `/api/documents/personne/{personneId}`
Récupère les documents d'une personne.

**Utilisation:**
```javascript
const getDocumentsByPerson = async (personneId: number) => {
  const response = await documentService.getDocumentsByPerson(personneId)
  return response.data
}
```

### 📄 GET `/api/documents/type/{type}`
Récupère les documents par type.

**Types disponibles:** `CARTE_IDENTITE`, `NINEA`, `PASSPORT`, `RCCM`

**Utilisation:**
```javascript
const getDocumentsByType = async (type: string) => {
  const response = await documentService.getDocumentsByType(type)
  return response.data
}
```

### 📄 GET `/api/documents/validated/{validated}`
Récupère les documents par statut de validation.

**Query Parameters:**
- `validated` (boolean): true ou false

**Utilisation:**
```javascript
const getDocumentsByValidation = async (validated: boolean) => {
  const response = await documentService.getDocumentsByValidation(validated)
  return response.data
}
```

### ➕ POST `/api/documents/with-file`
Crée un document avec fichier.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `personneId` (number): ID de la personne
- `type` (string): Type de document
- `file` (file): Fichier du document

**Utilisation:**
```javascript
const createDocument = async (
  personneId: number,
  type: string,
  file: File
) => {
  const response = await documentService.createDocument(personneId, type, file)
  return response.data
}
```

### ✏️ PUT `/api/documents/{id}`
Met à jour un document.

**Body:**
```json
{
  "type": "NINEA",
  "description": "Numéro d'identification national pour exercer une activité"
}
```

**Utilisation:**
```javascript
const updateDocument = async (documentId: number, data: any) => {
  const response = await documentService.updateDocument(documentId, data)
  return response.data
}
```

### ✅ PUT `/api/documents/{id}/validate`
Valide un document.

**Utilisation:**
```javascript
const validateDocument = async (documentId: number) => {
  const response = await documentService.validateDocument(documentId)
  return response.data
}
```

### 📸 POST `/api/documents/{id}/file`
Remplace le fichier d'un document.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file): Nouveau fichier

**Utilisation:**
```javascript
const updateDocumentFile = async (documentId: number, file: File) => {
  const response = await documentService.updateDocumentFile(documentId, file)
  return response.data
}
```

### 🗑️ DELETE `/api/documents/{id}`
Supprime un document.

**Utilisation:**
```javascript
const deleteDocument = async (documentId: number) => {
  const response = await documentService.deleteDocument(documentId)
  return response.data
}
```

---

## 🚀 Exemples Complets

### Exemple 1: Authentification et récupération du profil
```javascript
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'

const loginAndGetProfile = async () => {
  try {
    // 1. Se connecter
    const loginResponse = await authService.login(
      'user@example.com',
      'password123'
    )
    const token = loginResponse.data.data.token
    const userId = loginResponse.data.data.userId
    
    // 2. Sauvegarder le token
    localStorage.setItem('admin_token', token)
    
    // 3. Récupérer le profil
    const profileResponse = await userService.getPersonById(userId)
    console.log('Profil:', profileResponse.data)
    
    return profileResponse.data
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### Exemple 2: Créer un produit avec articles
```javascript
import { productService } from '@/services/productService'
import { articleService } from '@/services/articleService'

const createProductWithArticles = async () => {
  try {
    // 1. Créer le produit
    const productFormData = new FormData()
    productFormData.append('nom', 'Chemise Formelle')
    productFormData.append('description', 'Chemise blanche formelle 100% coton')
    productFormData.append('sousCategorieId', '1')
    productFormData.append('boutiqueId', '1')
    productFormData.append('image', imageFile)
    
    const productResponse = await productService.createProduct(productFormData)
    const productId = productResponse.data.data.id
    
    // 2. Créer les articles (variantes)
    const articles = [
      { sku: 'CHEMISE-S', taille: 'S', prix: 25000, stock: 50 },
      { sku: 'CHEMISE-M', taille: 'M', prix: 25000, stock: 75 },
      { sku: 'CHEMISE-L', taille: 'L', prix: 25000, stock: 60 }
    ]
    
    for (const article of articles) {
      await articleService.createArticle({
        produitId: productId,
        sku: article.sku,
        prix: article.prix,
        stockActuel: article.stock,
        attributs: `Taille: ${article.taille}`
      })
    }
    
    console.log('Produit créé avec succès!')
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### Exemple 3: Gérer un panier et créer une commande
```javascript
import { cartService } from '@/services/cartService'
import { orderService } from '@/services/orderService'

const createOrderFromCart = async (clientId: number) => {
  try {
    // 1. Créer un panier
    const cartResponse = await cartService.createCart(clientId)
    const cartId = cartResponse.data.data.id
    
    // 2. Ajouter des articles
    await cartService.addItemToCart(clientId, 1, 2, 25000) // 2x article 1 à 25000
    await cartService.addItemToCart(clientId, 2, 1, 35000) // 1x article 2 à 35000
    
    // 3. Valider le panier
    await cartService.validateCart(cartId)
    
    // 4. Créer la commande
    const orderResponse = await orderService.createOrderFromCart(cartId)
    console.log('Commande créée:', orderResponse.data)
    
    return orderResponse.data
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

---

## 📝 Notes Importantes

### Authentification
- Le token JWT est automatiquement ajouté à toutes les requêtes via l'intercepteur
- Le token est stocké dans `localStorage` sous la clé `admin_token`
- En cas d'erreur 401, l'utilisateur est redirigé vers `/login`

### Gestion des fichiers
- Utilisez `FormData` pour les requêtes avec fichiers
- Définissez le header `Content-Type: multipart/form-data`

### Gestion des erreurs
- Les réponses contiennent un `success` booléen
- Les erreurs incluent un `message` descriptif
- Consultez les codes HTTP pour le statut

### Endpoints de recherche
- Les recherches LIKE sont partielles (ex: "chem" trouvera "chemise")
- Les recherches peuvent être combinées avec des paramètres optionnels
