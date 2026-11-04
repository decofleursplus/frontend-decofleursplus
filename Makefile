.DEFAULT_GOAL := help
.PHONY: help dev build start lint typecheck health test test-api test-e2e test-live test-all-visual test-interactive test-ui test-report clean install

# ==============================================================================
# 🌸 DécoFleur Plus — Commandes Utiles & Suite de Tests QA
# ==============================================================================

help: ## Affiche cette aide interactive
	@echo ""
	@echo "🌸 \033[1;32mDécoFleur Plus\033[0m — Commandes de Développement & Tests QA"
	@echo "=================================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ------------------------------------------------------------------------------
# 💻 Développement & Build
# ------------------------------------------------------------------------------

dev: ## Démarre le serveur local de développement Next.js (port 3000)
	pnpm run dev

build: ## Compile l'application Next.js pour la production
	pnpm run build

start: ## Lance le serveur Next.js en mode production après le build
	pnpm run start

lint: ## Analyse statique du code source avec ESLint
	pnpm run lint

typecheck: ## Vérifie la conformité des types TypeScript sans émission de fichiers
	pnpm exec tsc --noEmit

install: ## Installe les dépendances pnpm et les navigateurs Playwright
	pnpm install
	pnpm exec playwright install chromium

# ------------------------------------------------------------------------------
# 🧪 Tests d'Assurance Qualité (QA & E2E)
# ------------------------------------------------------------------------------

health: ## Vérifie la disponibilité et le statut de santé du backend Staging
	@echo "🔍 Vérification du healthcheck Staging Railway..."
	@curl -s https://backend-decofleursplus-staging.up.railway.app/api/v1/health | jq . || curl -s https://backend-decofleursplus-staging.up.railway.app/api/v1/health

test: ## Exécute la suite de tests E2E réels (Playwright Chromium)
	pnpm exec playwright test

test-e2e: ## Exécute les tests E2E (Chromium headless)
	pnpm exec playwright test tests/e2e/e2e.spec.ts --reporter=list

test-headed: ## Exécute les tests E2E avec navigateur visible
	pnpm exec playwright test tests/e2e/e2e.spec.ts --headed

test-ui: ## Ouvre l'interface interactive graphique Playwright (Timeline, DOM, Rejeu)
	pnpm exec playwright test --ui

test-report: ## Ouvre le rapport HTML interactif complet avec captures et vidéos
	pnpm exec playwright show-report

# ------------------------------------------------------------------------------
# 🧹 Maintenance & Nettoyage
# ------------------------------------------------------------------------------

clean: ## Supprime les dossiers de résultats de tests et de build temporaires
	rm -rf test-results playwright-report .next
	@echo "✨ Dossiers temporaires nettoyés avec succès."

