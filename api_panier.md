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