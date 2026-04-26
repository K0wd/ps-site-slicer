# Non-Functional Testing & Test Lifecycle
> Performance, accessibility, security, usability, compatibility + smoke/sanity/regression/confirmation.

---

## NON-FUNCTIONAL TESTING

---

### Performance Testing

**Types:**

| Type | Purpose |
|------|---------|
| **Load Testing** | Behavior under expected normal load |
| **Stress Testing** | Behavior beyond normal capacity — find the breaking point |
| **Soak / Endurance** | Stability over extended time — find memory leaks, slow degradation |
| **Spike Testing** | Behavior under sudden extreme load increase |
| **Volume Testing** | Behavior with large amounts of data |
| **Scalability Testing** | How well the system scales with increasing load |

**Behavior rules:**
- Define performance baselines and SLAs BEFORE testing
- Common web application thresholds:
  - Page load on 4G: < 3 seconds
  - API response (list endpoints): < 500ms at p95
  - API response (detail endpoints): < 1s at p95
  - Error rate under load: < 1%
- Tools: k6 · Gatling · JMeter · Locust · Artillery
- Test in an environment mirroring production as closely as possible
- Profile before optimizing — never guess at bottlenecks

---

### Accessibility Testing

**What it is:** Verifying the application can be used by people with disabilities, including visual, auditory, motor, and cognitive impairments.

**Behavior rules:**
- Target: **WCAG 2.1 Level AA** as the minimum standard
- Automate with: `axe-core` · `@axe-core/playwright` · `pa11y`
- Zero critical or serious axe violations allowed to ship
- Manual checks automation cannot cover:
  - Keyboard-only navigation through all interactive elements
  - Screen reader compatibility (NVDA · JAWS · VoiceOver · TalkBack)
  - Logical focus order matches visual reading order
  - Color contrast: 4.5:1 for normal text · 3:1 for large text
  - Touch targets: ≥ 44×44px on mobile interfaces
  - All images have meaningful alt text
  - All form inputs have proper label associations
  - Error messages are announced to screen readers

```typescript
import { checkA11y } from 'axe-playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/your-page');
  await checkA11y(page);
});
```

---

### Security Testing (OWASP Top 10 — 2021)

For every form input and API endpoint, verify protection against:

```
A01 Broken Access Control
  □ Users cannot access resources belonging to other users
  □ Unauthenticated requests to protected routes are rejected (401/403)
  □ Privilege escalation attempts are blocked

A02 Cryptographic Failures
  □ Sensitive data encrypted at rest and in transit (HTTPS enforced)
  □ No sensitive data in URL parameters or application logs
  □ Strong current algorithms used (no MD5, SHA1, DES)

A03 Injection
  □ SQL injection:     ' OR '1'='1; DROP TABLE users; --
  □ NoSQL injection:   { "$gt": "" }
  □ Command injection: ; ls -la | rm -rf /
  □ LDAP injection, XPath injection

A04 Insecure Design
  □ Rate limiting on authentication endpoints
  □ Account lockout after N failed attempts
  □ Sensitive operations require re-authentication

A05 Security Misconfiguration
  □ Debug mode disabled in production
  □ Default credentials changed
  □ Unnecessary features/endpoints disabled
  □ Security headers present: CSP · HSTS · X-Frame-Options · X-Content-Type-Options

A06 Vulnerable Components
  □ No known CVEs in dependencies (npm audit / composer audit / pip-audit)
  □ Dependencies regularly updated and monitored

A07 Authentication Failures
  □ Passwords hashed with bcrypt or Argon2 (never MD5/SHA1/plain)
  □ Session tokens invalidated on logout
  □ Session fixation attacks prevented
  □ Brute force protection active on login endpoint

A08 Software and Data Integrity
  □ Subresource Integrity (SRI) on externally loaded scripts
  □ CI/CD pipeline cannot be hijacked by untrusted code contributions

A09 Logging and Monitoring Failures
  □ Failed login attempts are logged
  □ No sensitive data (passwords, tokens, PII) appears in logs
  □ Logs are tamper-evident and monitored

A10 Server-Side Request Forgery (SSRF)
  □ User-supplied URLs are validated and allowlisted
  □ Internal network not reachable via user-controlled input
```

Reference: https://owasp.org/www-project-top-ten/

---

### Usability Testing

**What it is:** Evaluating a product by observing real users attempting real tasks — identifying usability problems and areas of confusion before they reach production.

**Behavior rules:**
- Test with representative users — not developers or testers
- Give users realistic TASKS, not instructions on HOW to complete them
- Observe silently — do not guide or help during the session
- Record: task completion rate · time-on-task · errors made · satisfaction score
- Five users typically reveal 80% of usability issues (Nielsen's Law)
- Conduct early — wireframes and prototypes are cheaper to change than shipped code

---

### Compatibility Testing

**What it is:** Verifying the application works correctly across different browsers, operating systems, devices, screen sizes, and network conditions.

**Behavior rules:**
- Maintain an explicit compatibility matrix for every project
- Test on real devices in addition to emulators for mobile coverage
- Minimum browser coverage: latest Chrome · Firefox · Safari · Edge
- Mobile coverage: iOS Safari · Android Chrome
- Viewport widths to test: 375px · 768px · 1024px · 1440px
- Network conditions to simulate: 4G · 3G slow · offline / no connection

---

## TEST LIFECYCLE & PROCESS

---

### Smoke Testing

**What it is:** A fast, broad pass verifying the build is stable enough for deeper testing. "Does it start? Does it catch fire?"

**Behavior rules:**
- Maximum runtime: **5 minutes** — if longer, it is not a smoke test
- Critical-path happy flows ONLY — no edge cases or negative paths
- Run BEFORE any other test suite — failing smoke stops all further testing
- Tag all smoke tests with `@smoke`
- Automate smoke in CI — it runs on every deployment to any environment

**Smoke test checklist:**
```
□ Application loads without errors
□ Authentication flow completes successfully
□ Primary navigation functions correctly
□ Core feature is accessible and renders
□ User can log out and session is cleared
```

---

### Sanity Testing

**What it is:** Narrow, targeted testing of a specific bug fix or new feature to confirm it works before investing in full regression.

**Behavior rules:**
- Run after a specific fix is deployed to the test environment
- Test ONLY the changed area and its immediate functional neighbors
- If sanity fails → do NOT proceed to full regression — fix first
- Document: what was changed · what was tested · pass or fail result

---

### Regression Testing

**What it is:** Re-running previously passing tests after any code change to verify nothing previously working has been broken.

**Behavior rules:**
- The full automated test suite IS the regression suite — run it on every merge
- Maintain a `@smoke` subset for fast per-commit checks; full suite on merge
- Any test that catches a regression → add a comment referencing the related bug
- Never delete a regression test without team discussion and approval
- The suite must be deterministic — flaky tests destroy trust in the entire suite

---

### Confirmation Testing (Re-testing)

**What it is:** Verifying that a specific reported defect has been fixed. Distinct from regression — confirmation targets the exact defect; regression checks for unintended side effects.

**Behavior rules:**
- Execute the exact steps that originally reproduced the defect
- Verify the defect no longer reproduces in the fixed build
- Add the reproduction steps as a permanent automated test to prevent recurrence
- Only after confirmation passes should regression testing be run

---

*See also: `qa-fundamentals.md` for testing levels and pyramid, `test-design-defects-metrics.md` for test case design and reporting.*
