/**
 * SUOP ERP — Enterprise form field primitives.
 *
 * Each field is bound to react-hook-form via `Controller` and must be rendered
 * inside a `FormProvider` (or `useForm` context). All fields share a common
 * prop surface: `name`, `label`, `required`, `error`, `description`.
 */
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export { NumberField } from './NumberField';
export type { NumberFieldProps } from './NumberField';

export { SelectField } from './SelectField';
export type { SelectFieldProps, SelectOption } from './SelectField';

export { AutocompleteField } from './AutocompleteField';
export type { AutocompleteFieldProps, AutocompleteOption } from './AutocompleteField';

export { BarcodeField } from './BarcodeField';
export type { BarcodeFieldProps } from './BarcodeField';

export { QrField } from './QrField';
export type { QrFieldProps } from './QrField';

export { CurrencyField } from './CurrencyField';
export type { CurrencyFieldProps } from './CurrencyField';

export { DateField } from './DateField';
export type { DateFieldProps } from './DateField';

export { DateTimeField } from './DateTimeField';
export type { DateTimeFieldProps } from './DateTimeField';

export { FileField } from './FileField';
export type { FileFieldProps } from './FileField';

export { ImageField } from './ImageField';
export type { ImageFieldProps } from './ImageField';

export { SignatureField } from './SignatureField';
export type { SignatureFieldProps } from './SignatureField';

export { CheckboxField } from './CheckboxField';
export type { CheckboxFieldProps } from './CheckboxField';

export { ToggleField } from './ToggleField';
export type { ToggleFieldProps } from './ToggleField';

export { TextareaField } from './TextareaField';
export type { TextareaFieldProps } from './TextareaField';

export { TagsField } from './TagsField';
export type { TagsFieldProps } from './TagsField';

export { MultiSelectField } from './MultiSelectField';
export type { MultiSelectFieldProps, MultiSelectOption } from './MultiSelectField';

export { FieldArray } from './FieldArray';
export type { FieldArrayProps } from './FieldArray';

export { FieldBase } from './FieldBase';
export type { FieldBaseProps } from './FieldBase';
