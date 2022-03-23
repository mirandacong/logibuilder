# Hierarchy

## The principle of hierarchy graph fields

There are four modules using hierarchy graph

- toComputeGraph
- transpiler
- gui-editor
- semantic

We need to record many information during these modules, some of them need to
share with other module and others are not, we need to consider about scope
of these fields so that we can manage them in a better way.

We can build a table like following, `R` means the module can read this
field, `W` means the module can write, `toComputeGraph` module is only
related with `cell`, so we don't need to consider about this module.

``` text
                transpiler      gui-editor      semantic
field name          R               R/W             /
```

Here is current fields table

``` text
                    transpiler      gui-editor      semantic
stub                    R               R/W             /
isDefScalar             W               R/W             R
row(rowblock.row)       R               R/W             R
name                    R               R/W             R
labels                  /               R/W             R
modifier                R               R/W             /
```

We can make the following principles

- If the field need to be read in all modules, put this field in hierarchy
node directly
- If not all the modules need to read this field, the module which can write
to this field is the owner of this field, put this field in hierarchy node in
`inject data` way, for example, `modifier` can be written with `gui-editor`,
so we can put this field in `editorData`, the example code is in `./node.ts`.
