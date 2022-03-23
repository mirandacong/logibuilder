local defs = import '../defs.jsonnet';

local table1 = defs.Table('Revenue Breakup', {
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
            soucres: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        }),
    ],
});

local sheet2 = defs.Sheet('sheet1', {
    subnodes: [table1],
});

sheet2
