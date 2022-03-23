local defs = import '../defs.jsonnet';

local column_block1 = defs.ColBlock('2017', {
    subnodes: [
        defs.Col('Q1', {}),
        defs.Col('Q2', {}),
        defs.Col('Q3', {}),
        defs.Col('Q4', {}),
        defs.Col('Q5', {}),
    ],
});

local table1 = defs.Table('Style tamplate table', {
    header_stub: 'Header name',
    subnodes: [
        column_block1,
        defs.Row('Underline', {
            expression: '{SOURCE()}',
            modifier: '---',
        }),
        defs.Row('Indent', {
            expression: '{SOURCE()}',
            modifier: '--',
        }),
        defs.Row('Italic indent+1 %', {
            expression: '{SOURCE()}',
            modifier: '-',
        }),
        defs.Row('Normal', {
            expression: '{SOURCE()}',
        }),
        defs.Row('Bold', {
            expression: '{SOURCE()}',
            modifier: '++',
        }),
        defs.Row('Bold indent', {
            expression: '{SOURCE()}',
            modifier: '+',
        }),
        defs.Row('SPLITTER', {
            expression: '{SOURCE()}',
            modifier: '+++',
        }),
        defs.Row('SOURCE()', {
            expression: '',
            sources: [32, 32, 32, 32, 32],
        }),
        defs.Row('INPUT()', {
            expression: '',
            sources: [32, 32, 32, 32, 32],
        }),
        defs.Row('SOURCE() empty', {
            expression: '',
        }),
        defs.Row('INPUT() empty', {
            expression: '',
        }),
        defs.Row('scalar no num', {
            expression: '',
            is_def_scalar: true,
        }),
        defs.Row('scalar empty', {
            is_def_scalar: true,
        }),
        defs.Row('default', {
            expression: '1/2',
        }),
        defs.Row('empty cell', {}),
    ],
});

local title1 = defs.Title('Main title', {
});

local title2 = defs.Title('Title + 1', {
    subnodes: [title1],
});

local title3 = defs.Title('Title + 2', {
    subnodes: [title2],
});

local sheet1 = defs.Sheet('Control', {
    subnodes: [title3, table1],
});

sheet1
