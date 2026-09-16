import { requestClient } from '../request'

const BASE_URL = '/api/sso/saml/config'
const SSO_BASE_URL = '/api/sso/saml'

/** Same-origin hash route the IdP redirects back to after a successful login. */
const SSO_CALLBACK_RELAY_STATE = '/#/sso-callback'
/** Same-origin hash route to land on after logout completes. */
const SSO_LOGOUT_RELAY_STATE = '/#/login'

/** Whether SAML SSO login is enabled (drives the login-page button visibility). */
export function checkSamlLoginEnable() {
  return requestClient.get<boolean>(`${SSO_BASE_URL}/enabled`, {
    skipErrorHandler: true,
  })
}

/**
 * Absolute URL that starts SP-initiated SAML login. The browser must navigate
 * to it directly (window.location) so the IdP redirect chain runs in the tab;
 * on success the backend redirects back to the SSO_CALLBACK_RELAY_STATE route
 * with an access_token query param appended.
 */
export function getSamlLoginUrl() {
  return `${SSO_BASE_URL}/login?relayState=${encodeURIComponent(
    SSO_CALLBACK_RELAY_STATE,
  )}`
}

/**
 * Absolute URL for SP-initiated Single Logout. The browser must navigate to it
 * directly; the backend terminates the local session, then redirects to the IdP
 * SLO endpoint (or straight to the login page when SLO is not configured).
 */
export function getSamlLogoutUrl(accessToken?: string) {
  const relay = `relayState=${encodeURIComponent(SSO_LOGOUT_RELAY_STATE)}`
  return accessToken
    ? `${SSO_BASE_URL}/logout?access_token=${encodeURIComponent(accessToken)}&${relay}`
    : `${SSO_BASE_URL}/logout?${relay}`
}

/** IdP fields extracted from an imported IdP SAML metadata document. */
export interface SamlIdpMetadata {
  idpEntityId: string | null
  idpSsoUrl: string | null
  idpSloUrl: string | null
  idpSigningCertificate: string | null
}

/** Result of validating the SAML configuration before it is enabled. */
export interface SamlValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  details: string[]
}

/** Run static SAML configuration validation without saving or enabling it. */
export function testSamlConfig(config: Record<string, unknown>) {
  return requestClient.post<SamlValidationResult>(`${BASE_URL}/test`, config)
}

/**
 * Generate and store a new SP signing/decryption key pair. The private key is
 * encrypted and stored server-side; only the certificate (PEM) is returned.
 */
export function generateSamlKeyPair() {
  return requestClient.post<{ spCertificate: string }>(
    `${BASE_URL}/generate-keypair`,
  )
}

/** Export the TapData SP metadata XML for import into the IdP. */
export function exportSpMetadata() {
  return requestClient.get<string>(`${BASE_URL}/export-sp-metadata`)
}

/** Parse an IdP metadata XML document to prefill the IdP-side fields. */
export function importIdpMetadata(metadataXml: string) {
  return requestClient.post<SamlIdpMetadata>(
    `${BASE_URL}/import-idp-metadata`,
    {
      metadataXml,
    },
  )
}

/** Import behaviour for existing users when a row matches an existing account. */
export type SsoUserImportMode = 'SKIP' | 'UPDATE'

/** Per-row outcome of a batch user import (dry-run preview or confirmed apply). */
export interface SsoImportRowResult {
  /** 1-based data-row index in the uploaded file. */
  row: number
  email: string
  username: string
  roleNames: string[]
  status: 'CREATE' | 'UPDATE' | 'SKIP' | 'FAILED'
  /** Human-readable reason, primarily for FAILED rows. */
  message: string
}

/** Aggregate result of a batch user import. */
export interface SsoImportPreviewResult {
  /** True when this is a dry-run (no writes performed). */
  dryRun: boolean
  total: number
  createCount: number
  updateCount: number
  skipCount: number
  failedCount: number
  rows: SsoImportRowResult[]
}

/**
 * Download the SSO batch user import template (.xlsx). Returns the raw axios
 * response so the caller can hand it to downloadBlob.
 */
export function downloadSsoUserImportTemplate() {
  return requestClient.get(`${BASE_URL}/user-import/template`, {
    responseType: 'blob',
    responseReturn: 'raw',
    skipErrorHandler: true,
  })
}

/**
 * Validate an SSO batch user import file (dry-run, no writes). Returns a
 * per-row preview of what would happen.
 */
export function validateSsoUserImport(
  file: File,
  mode: SsoUserImportMode = 'SKIP',
) {
  const formData = new FormData()
  formData.append('file', file)

  return requestClient.post<SsoImportPreviewResult>(
    `${BASE_URL}/user-import/validate`,
    formData,
    {
      params: { mode },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}

/** Apply an SSO batch user import file. */
export function confirmSsoUserImport(
  file: File,
  mode: SsoUserImportMode = 'SKIP',
) {
  const formData = new FormData()
  formData.append('file', file)

  return requestClient.post<SsoImportPreviewResult>(
    `${BASE_URL}/user-import/confirm`,
    formData,
    {
      params: { mode },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}
