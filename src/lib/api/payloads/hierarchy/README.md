# Hierarchy Payload

## Description

> The atomic operation for hierarchy node.

One payload includes a target hierarchy node, the other paramaters and an
executive function.

## Rules

1. A payload only modifies a property of a hierarchy node.

2. Do not create hierarchy node in payload.

3. Return void for the exectutive function.

## Attention

1. Remember to create a new slice.

    When modifying the existing slice, you should create a new slice to replace
the original one.Otherwise, undo/redo will have problem.

2. Only allow to modify the current hierarchy node.

    Pay attention not to modifty the parent or subnodes, especially when
calling the method of the hierarchy node.

3. Remember to update share col set.

    When adding a new payload that can modify column or cloumn block, you should
add it to the judgement in `getSharedColsPayloads` function in
`src/lib/api/actions/hierarchy/handle/lib.ts`.
