local defs = import '../dsl/logi_test_data/defs.jsonnet';

local row_block2 = defs.RowBlock('rowblock', {
    modifier: '+',
    subnodes: [
        defs.Row('row1', {
            expression: '',
            labels: ['asp'],
            modifier: '---',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('row2', {
            sources: [1, 2, 3, 4],
            is_def_scalar: true,
            slice_exprs: [
                defs.Slice('proj', ''),
            ],
        }),
    ],
});

local col_block2 = defs.ColBlock('cb2', {
    labels: ['label'],
    subnodes: [
        defs.Col('col1', {
            sources: [1, 2, 3, 4],
            expression: 'proj',
            modifier: '-',
            slice_exprs: [
                defs.Slice('cs1', 'proj'),
            ],
        }),
        defs.Col('col2', {
            sources: [1, 2, 3, 4],
            expression: 'proj',
            modifier: '-',
            slice_exprs: [
                defs.Slice('cs1', 'proj'),
            ],
        }),
        defs.Col('col3', {
            sources: [1, 2, 3, 4],
            expression: 'proj',
            modifier: '-',
            slice_exprs: [
                defs.Slice('cs1', 'proj'),
            ],
        }),
    ],
});

local table2 = defs.Table('table2', {
    labels: defs.Label(
        defs.Tags(['tag1', 'tag2']),
        defs.Attrs({ key: 'value' }),
    ),
    subnodes: [
        defs.RowBlock('rowblock', {
            modifier: '+',
            subnodes: [row_block2],
        }),
        defs.Row('row', {
            expression: '',
            labels: ['asp'],
            modifier: '+',
            sources: [1, 2, 3, 4, 5, 6],
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.ColBlock('cb1', {
            labels: ['asp'],
            subnodes: [col_block2],
        }),
        defs.Col('col', {
            sources: [1, 2, 3, 4],
            expression: 'proj',
            modifier: '-',
            slice_exprs: [
                defs.Slice('cs1', 'proj'),
            ],
        }),
    ],
});

local title = defs.Title('title', {
    labels: defs.Label(
        defs.Tags(['tag1', 'tag2']),
        defs.Attrs({ key: 'value' }),
    ),
    subnodes: [
        defs.Table('table1', {
            labels: defs.Label(
                defs.Tags(['tag1', 'tag2']),
                defs.Attrs({ key: 'value' }),
            ),
        }),
    ],
});

defs.Book('book', {
    labels: defs.Label(
        defs.Tags(['tag1', 'tag2']),
        defs.Attrs({ key: 'value' }),
    ),
    subnodes: [
        defs.Sheet('sheet', {
            labels: defs.Label(
                defs.Tags(['tag1', 'tag2']),
                defs.Attrs({ key: 'value' }),
            ),
            subnodes: [
                title,
                table2,
            ],
        }),
    ],
})
