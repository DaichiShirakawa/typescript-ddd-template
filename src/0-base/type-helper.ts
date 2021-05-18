export type ArrayElement<ArrayType extends readonly unknown[] | unknown> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type NonArrayElement<ElementType extends readonly unknown[] | unknown> =
  ElementType extends readonly any[] ? never : ElementType;
