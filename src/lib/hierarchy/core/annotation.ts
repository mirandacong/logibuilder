// tslint:disable-next-line: const-enum
export enum AnnotationKey {
    LINK_NAME = 'link_name',
    LINK_CODE = 'link_code',
    KEY_ASSUMPTION = 'key_assumption',
    IS_STANDARD_HEADER = 'is_standard_header',
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isAnnotationKey(key: string): key is AnnotationKey {
    // tslint:disable-next-line: no-object
    return Object
        .keys(AnnotationKey)
        .map((k: string): string => Reflect.get(AnnotationKey, k))
        .includes(key)
}
