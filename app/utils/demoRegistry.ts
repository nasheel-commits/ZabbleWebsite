// Single source of truth for system → demo component mapping.
// Used by:
//   - DemoSlot.vue       (renders the live demo on /systems/[slug])
//   - SystemDemoThumbnail.vue (renders a scaled, non-interactive snapshot
//                              of the same demo as the card thumbnail on /systems)

import { defineAsyncComponent, type Component } from 'vue'

export const demoRegistry: Record<string, Component> = {
  'accounting-engine': defineAsyncComponent(
    () => import('~/components/demos/accounting-engine.vue'),
  ),
  'analytics-suite': defineAsyncComponent(
    () => import('~/components/demos/analytics-suite.vue'),
  ),
  'approval-workflow': defineAsyncComponent(
    () => import('~/components/demos/approval-workflow.vue'),
  ),
  'bespoke-crm': defineAsyncComponent(
    () => import('~/components/demos/bespoke-crm.vue'),
  ),
  'case-management': defineAsyncComponent(
    () => import('~/components/demos/case-management.vue'),
  ),
  'client-onboarding': defineAsyncComponent(
    () => import('~/components/demos/client-onboarding.vue'),
  ),
  'compliance-reporting': defineAsyncComponent(
    () => import('~/components/demos/compliance-reporting.vue'),
  ),
  'continuous-assurance': defineAsyncComponent(
    () => import('~/components/demos/continuous-assurance.vue'),
  ),
  'cross-system-sync': defineAsyncComponent(
    () => import('~/components/demos/cross-system-sync.vue'),
  ),
  'customer-360': defineAsyncComponent(
    () => import('~/components/demos/customer-360.vue'),
  ),
  'data-routing': defineAsyncComponent(
    () => import('~/components/demos/data-routing.vue'),
  ),
  'decision-engine': defineAsyncComponent(
    () => import('~/components/demos/decision-engine.vue'),
  ),
  'document-assembly': defineAsyncComponent(
    () => import('~/components/demos/document-assembly.vue'),
  ),
  'document-intelligence': defineAsyncComponent(
    () => import('~/components/demos/document-intelligence.vue'),
  ),
  'field-ops-app': defineAsyncComponent(
    () => import('~/components/demos/field-ops-app.vue'),
  ),
  'forecasting': defineAsyncComponent(
    () => import('~/components/demos/forecasting.vue'),
  ),
  'integration-hub': defineAsyncComponent(
    () => import('~/components/demos/integration-hub.vue'),
  ),
  'master-data-hub': defineAsyncComponent(
    () => import('~/components/demos/master-data-hub.vue'),
  ),
  'multi-channel-inbox': defineAsyncComponent(
    () => import('~/components/demos/multi-channel-inbox.vue'),
  ),
  'inventory-clarity': defineAsyncComponent(
    () => import('~/components/demos/inventory-clarity.vue'),
  ),
  'kairos': defineAsyncComponent(
    () => import('~/components/demos/kairos.vue'),
  ),
  'knowledge-assistant': defineAsyncComponent(
    () => import('~/components/demos/knowledge-assistant.vue'),
  ),
  'lead-qualifier': defineAsyncComponent(
    () => import('~/components/demos/lead-qualifier.vue'),
  ),
  'legacy-bridge': defineAsyncComponent(
    () => import('~/components/demos/legacy-bridge.vue'),
  ),
  'notification-orchestration': defineAsyncComponent(
    () => import('~/components/demos/notification-orchestration.vue'),
  ),
  'predictive-maintenance': defineAsyncComponent(
    () => import('~/components/demos/predictive-maintenance.vue'),
  ),
  'pricing-engine': defineAsyncComponent(
    () => import('~/components/demos/pricing-engine.vue'),
  ),
  'reconciliation-engine': defineAsyncComponent(
    () => import('~/components/demos/reconciliation-engine.vue'),
  ),
  'task-management': defineAsyncComponent(
    () => import('~/components/demos/task-management.vue'),
  ),
  'workflow-orchestrator': defineAsyncComponent(
    () => import('~/components/demos/workflow-orchestrator.vue'),
  ),
}

export function resolveDemoComponent(slug: string, override?: string): Component | null {
  const key = override ?? slug
  return demoRegistry[key] ?? null
}
