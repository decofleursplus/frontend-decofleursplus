# Décofleur Plus

Frontend desktop de la boutique Décofleur Plus, construit avec Next.js App Router, React, TypeScript et Tailwind CSS.

## Démarrer

```bash
pnpm install
pnpm dev
```

Ouvrir ensuite `http://localhost:3000`.

## API backend

Le backend ([backend-decofleursplus](https://github.com/decofleursplus/backend-decofleursplus)) est déployé sur Railway. Toutes les routes sont préfixées par `/api/v1`.

| Environnement | URL de base                                              |
| ------------- | -------------------------------------------------------- |
| Staging       | https://backend-decofleursplus-staging.up.railway.app    |
| Production    | https://backend-decofleursplus-production.up.railway.app |
| Local         | http://localhost:5000                                    |

Pour relier le frontend à une API, définir l’URL dans `.env.local` :

```bash
NEXT_PUBLIC_API_URL=https://backend-decofleursplus-staging.up.railway.app/api/v1
```

Le backend n’accepte qu’une seule origine, définie par sa variable `CORS_ORIGIN` : y renseigner l’URL du frontend (staging ou production) dans les variables Railway de l’environnement correspondant.

## Vérifications

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## État du projet

- [Plan d’implémentation](docs/IMPLEMENTATION_PLAN.md)
- [État détaillé](docs/IMPLEMENTATION_STATUS.md)

Les interfaces de démonstration utilisent les produits et photos visibles dans les maquettes. Le compte client et le panier sont locaux au navigateur ; aucune authentification, donnée de commande ou transaction réelle n’est reliée.
