// ============================================================
// RAILREADY — Plans (DÉSACTIVÉ en V1 Bêta)
// Stripe hors scope de la phase bêta.
// ============================================================

export type PlanId = 'beta'

export const BETA_PLAN = {
  id: 'beta' as PlanId,
  name: 'Accès bêta gratuit',
  price: 0,
  features: ['Toutes les fonctionnalités', 'Accès complet pendant la bêta'],
}
