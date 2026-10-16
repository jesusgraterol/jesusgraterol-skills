## Form state and validation

Before creating or materially changing a form, inspect existing forms, shared components, hooks, schemas, dependencies, and tests for the established form-state/validation system.

- Use an existing application-owned system consistently for registration, state, validation, errors, submission state, and schema/resolver integration. Do not bypass/replace it with browser-only validation, ad hoc component state, or parallel application validation.
- Without an established application-owned form-validation system, native HTML constraint validation is an acceptable client fallback. Add no form library merely to avoid it unless requested behavior or non-trivial application-owned validation justifies one.
- Preserve accurate native attributes for semantics, accessibility, autofill, mobile input, and progressive enhancement. When the application-owned system controls validation feedback/submission, prevent competing browser validation UI, normally with `noValidate` on `<form>`.
- Align client validation with authoritative application/server contracts; it improves UX but never replaces trusted-server validation.
- Set `autocomplete` tokens, `inputmode`, and `enterkeyhint` on inputs, so browsers can autofill them and mobile keyboards match the field. Set `autocapitalize="none"`, `autocorrect="off"`, and `spellcheck="false"` on usernames, codes, and other fields that aren't prose.
- (4.1+) Prefer the `user-invalid:` variant over `invalid:` for error styling, so a field shows its error only after the user has interacted with it.

## Form placeholder guidance

Every user-editable frontend form field supporting placeholders must include a realistic example value.

Placeholders must:

- start with `e.g.`
- show the expected input format or kind of value
- use safe generic data, never real user data, secrets, tokens, private URLs, or credentials
- match the field purpose, validation rules, and locale expectations
- remain concise enough to fit on small screens without harming usability

Examples:

- email fields: `e.g. jane@example.com`
- age fields: `e.g. 25`
- search fields: `e.g. funny movie`
- phone fields: `e.g. +1 555 123 4567`
- name fields: `e.g. Jane Doe`
- URL fields: `e.g. https://example.com`

Placeholders never replace visible labels, accessible names, helper text, validation messages, or required-field indicators.
