# 04 — Forms Audit Report

**Document ID:** STAB-04-FORMS-AUDIT
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report audits the 19 form field primitives created in
`src/components/enterprise/forms/`. It assesses field-level quality,
validation wiring, accessibility, and integration with the chosen form
library and schema layer.

## 2. Executive Summary

A set of **19 form field primitives** has been introduced. The set covers
text, numeric, selection, date/time, file/media, and array fields. The
primitives are present and importable, but lack a documented contract with
the form library, no validation schema bindings, no accessibility audit, and
no tests. Forms are the **highest-risk surface** in the application because
every business transaction flows through them.

## 3. Form Field Inventory

### 3.1 Text & Numeric (4)
- `FieldBase` — shared wrapper, label, error, hint.
- `TextField`
- `TextareaField`
- `NumberField`

### 3.2 Selection (5)
- `SelectField`
- `AutocompleteField`
- `MultiSelectField`
- `CheckboxField`
- `ToggleField`

### 3.3 Date & Time (2)
- `DateField`
- `DateTimeField`

### 3.4 Currency & Tags (2)
- `CurrencyField`
- `TagsField`

### 3.5 Identification (2)
- `BarcodeField`
- `QrField`

### 3.6 File & Media (3)
- `FileField`
- `ImageField`
- `SignatureField`

### 3.7 Composite (1)
- `FieldArray` — dynamic list of fields.

**Total: 19 primitives** (including the shared `FieldBase`).

## 4. Findings

### F-01 — No Form Library Contract Documented
The primitives do not declare a binding to a specific form library (e.g.
React Hook Form, Formik). It is unclear whether they accept `register`,
`Controller` render props, or a custom hook. This must be standardized.

### F-02 — No Schema Validation Binding
Feature modules expose a `schemas/` directory, but no contract exists
between schemas (zod / yup) and the form primitives. The wiring strategy
must be defined and documented.

### F-03 — No Accessibility Audit
Field labels, error associations (`aria-describedby`), required indicators,
and focus management on validation errors have not been verified.

### F-04 — No Field-Level Tests
No primitive has unit tests covering:
- Render with value.
- Render with error.
- Change events.
- Blur events.
- Disabled state.

### F-05 — Specialized Fields Need Format Contracts
- `CurrencyField`: currency code, locale, symbol position.
- `DateField` / `DateTimeField`: timezone handling, format.
- `BarcodeField` / `QrField`: symbology, validation rules.
- `SignatureField`: output format (PNG/SVG), dimensions, audit binding.

### F-06 — FieldArray Lacks Item Management API
`FieldArray` should expose `add`, `remove`, `move`, and `replace`
operations. Current implementation status is unverified.

### F-07 — FileField / ImageField Need Upload Contract
No documented contract for:
- Upload endpoint.
- Progress reporting.
- File size limits.
- MIME type restrictions.
- Abort capability.

### F-08 — SignatureField Audit Binding
Signature fields in an ERP context often require legal audit binding
(timestamp, signer identity, hash). No such contract is documented.

### F-09 — No Cross-Field Validation Hook
Complex forms (e.g. invoice totals, multi-currency) require cross-field
validation. No primitive or hook exposes this.

### F-10 — No Loading / Disabled State Tokens
Submit loading and field-level disabled states are not tokenized.

## 5. Compliance Matrix (Selected)

| Field | Type-Safe | Accessible | Validated | Tested | Documented |
| --- | --- | --- | --- | --- | --- |
| FieldBase | Yes | No | N/A | No | No |
| TextField | Yes | No | No | No | No |
| NumberField | Yes | No | No | No | No |
| SelectField | Yes | No | No | No | No |
| AutocompleteField | Yes | No | No | No | No |
| CurrencyField | Yes | No | No | No | No |
| DateField | Yes | No | No | No | No |
| DateTimeField | Yes | No | No | No | No |
| FileField | Yes | No | No | No | No |
| ImageField | Yes | No | No | No | No |
| SignatureField | Yes | No | No | No | No |
| FieldArray | Yes | No | No | No | No |

All fields return **No** across accessibility, validation, testing, and
documentation columns.

## 6. Recommended Form Library Decision

Two candidates are evaluated:

| Criterion | React Hook Form | Formik |
| --- | --- | --- |
| Performance | Excellent | Good |
| Bundle size | Small | Medium |
| Schema integration | Native (zodResolver) | Good |
| Adoption trend | High | Declining |
| TS support | Excellent | Good |

**Recommendation:** Adopt React Hook Form + Zod. Standardize all primitives
to accept `Controller` render-props or `useController` hooks.

## 7. Proposed Primitive Contract

Each field primitive should expose:

```ts
type FieldProps<T> = {
  name: string;            // form path
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: T;
  // via useController
  control: Control<any>;
  rules?: RegisterOptions;
};
```

Plus a `FieldError` slot standardized by `FieldBase`.

## 8. Recommended Actions

1. **Standardize on React Hook Form + Zod** and document the contract.
2. **Refactor `FieldBase`** to provide label, error, hint, required
   indicator, and `aria-describedby` wiring.
3. **Migrate each of the 19 primitives** to the standardized contract.
4. **Add a unit test per primitive** covering value, error, change, blur,
   disabled.
5. **Define upload contract** for `FileField` / `ImageField`.
6. **Define audit contract** for `SignatureField`.
7. **Define cross-field validation hook** (e.g. `useFormValidation`).

## 9. Acceptance Criteria

- [ ] Form library decision documented and adopted across primitives.
- [ ] Each primitive exposes the standardized contract.
- [ ] Each primitive has unit tests.
- [ ] Each primitive has MDX documentation.
- [ ] Accessibility audit completed for all 19 primitives.
- [ ] Upload and signature contracts documented.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| FR1 | Inconsistent form library usage across modules | High |
| FR2 | Validation bypass on frontend | High |
| FR3 | File upload abuse (no MIME / size limit) | Critical |
| FR4 | Signature non-repudiation gap | High |
| FR5 | Accessibility lawsuit exposure | Medium |

## 11. Conclusion

Forms are the **transactional backbone** of the ERP and the most
user-facing risk surface. The 19 primitives are present but not yet
contractually bound to a form library, a schema layer, or an accessibility
standard. Stabilizing the forms layer is a **prerequisite** for any feature
module migration that involves data entry.

---

*End of report STAB-04-FORMS-AUDIT.*
