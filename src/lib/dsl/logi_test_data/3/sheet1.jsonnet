local defs = import '../defs.jsonnet';

local table = defs.Table('Revenue Breakup', {
    header_stub: 'us mn',
    subnodes: [
        defs.ColBlock('2017', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.ColBlock('2018', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.ColBlock('2019', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.ColBlock('2020', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.Row('row1', {
            expression: '',
            sources: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        }),
        defs.Row('row2', {
            expression: '',
            sources: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        }),
        defs.Row('row3', {
            expression: '',
            sources: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        }),
        defs.Row('row4', {
            expression: '{row1} + {row2}',
        }),
        defs.Row('row5', {
            expression: 'sum({row1}, {row2}, {row3})',
        }),
        defs.Row('row6', {
            expression: 'average({row1}, {row2}, {row3})',
        }),
        defs.Row('row7', {
            expression: '',
            sources: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        }),
        defs.Row('row8', {
            expression: '1',
        }),
        defs.Row('row9', {
            expression: '{sheet1!Revenue Breakup!row1}',
        }),
        defs.Row('row10', {
            expression: '',
            modifier: '--',
            sources: [-200, -112, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        }),
    ],
});

local sheet1 = defs.Sheet('Control', {
    subnodes: [table],
});

sheet1
