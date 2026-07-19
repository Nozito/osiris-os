# Design notes — montée en gamme Osiris OS

Notes de référence pour sortir du pattern "template admin". Chaque changement de composant/page doit pouvoir se justifier par une de ces règles.

## Constat de départ
- `AppTopbar` affiche déjà un fil `Groupe / Titre` (voir `components/layout/app-topbar.tsx`). Chaque page répète pourtant un second titre (`h2.page-title` + `page-subtitle`) juste en dessous → double en-tête redondant, la première cause du côté "template". **Règle : le corps de page ne doit plus jamais répéter le titre déjà affiché dans le topbar.** Le nouveau `PageHeader` sert à porter le sous-texte, les stats inline, les actions et les tabs — pas un titre dupliqué.
- Le dashboard répète 3 fois la même carte "icône ronde + label + chiffre" (`app/(app)/dashboard/page.tsx:58-81`). Référence Linear/Stripe : valeurs alignées horizontalement, séparateurs fins verticaux, tailles de police différenciées (une valeur dominante, les autres secondaires), pas d'icône systématique.
- Le login est un card centré seul sur fond noir (`app/(auth)/login/page.tsx`) — pattern générique de starter. Référence Vercel/Linear auth : composition asymétrique (marque/contexte d'un côté, formulaire de l'autre) ou fond signature travaillé (grain + glow bleu `--primary`), jamais juste un card flottant.
- Les tables (`clients`, futures `quotes`/`invoices`) sont bien faites techniquement (desktop table + mobile list) mais visuellement identiques d'une section à l'autre : mêmes types de colonnes texte + avatar + chevron. Référence Stripe Dashboard : une colonne "principale" plus riche (avatar/statut combinés), une colonne de statut avec badge coloré, alignement numérique à droite, densité de ligne réduite.
- `Card` (`components/ui/card.tsx`) est déjà bien construit (bordure fine, pas d'ombre lourde) — le problème n'est pas le composant mais son usage systématique pour tout (KPI, formulaires, listes). **Règle : varier — table brute sans card autour, stat en ligne sans card, card réservée aux blocs qui ont vraiment un contenu composite.**
- `RevenueChart` (`components/dashboard/revenue-chart.tsx`) et `.glass` (topbar, dropdowns, command palette, sheets) sont déjà au niveau premium visé — ne pas retoucher, juste réutiliser comme référence de qualité.
- `EmptyState` (`components/ui/empty-state.tsx`) est correct dans son principe (icône ronde discrète + texte court) — à décliner par page plutôt qu'à remplacer.
- `KanbanBoard` (CRM) est déjà le composant le plus différenciant du projet — priorité : ne pas l'aligner sur le moule des autres pages, au contraire s'en inspirer pour les autres (mise en page non linéaire, cards riches).

## Cibles par famille de composant
| Famille | Pattern actuel | Pattern cible |
|---|---|---|
| Page header | `h2.page-title` + `p.page-subtitle` répété partout, redondant avec topbar | `PageHeader` : contexte/description + actions, jamais de titre dupliqué ; variante avec stats inline pour dashboard, variante avec tabs pour settings |
| KPI/stats | 3 cards identiques icône ronde | Ligne de stats avec séparateurs fins, hiérarchie de taille, une valeur dominante mise en avant (déjà le cas pour le CA signé — à étendre, pas 3 clones en dessous) |
| Tables | Table uniforme colonnes texte | Colonne principale riche (avatar+statut combinés), badges de statut colorés, alignement numérique, densité variable selon la page (finance = dense, clients = confortable) |
| Auth | Card centré seul | Layout asymétrique ou fond signature (glow bleu, grain), formulaire non flottant au milieu du vide |
| Settings | Une fiche card isolée | Layout à sections (nav latérale ou tabs), prêt à accueillir plus de blocs sans réempiler des cards |
| Kanban CRM | Déjà différenciant | Garder, améliorer densité des cards de lead |
| Empty states | Correct | Garder le composant, varier le texte/contexte par page |
