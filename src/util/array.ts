/**
 * Get the first element of an array
 */
export const head = <A extends any[]>([head]: A): A extends Array<infer B> ? B : never => head;

/**
 * Get every element but the first of an array
 */
export const tail = <A extends any, B extends A[]>([head, ...tail]: B): A[] => tail;