local defs = import '../defs.jsonnet';

local table1 = defs.Table('Revenue Breakup', {
    header_stub: 'us mn',
    subnodes: [
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('row1', {
            expression: '',
            sources: ['a', 'b', 'c', 'd'],
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.Row('row2', {
            expression: '',
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.Row('row3', {
            slice_exprs: [
                defs.Slice('hist', '{row1}[hist] + {row2}[hist]', 3),
            ],
        }),
        defs.Row('row4', { expression: '{Revenue!row42} + 1', type: 2 }),
        defs.Row('row5', { expression: '3', type: 1 },),
        defs.Row('row6', { type: 2 },),
    ],
});

local table2 = defs.Table('Cash flow', {
    header_stub: 'us mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Row('row1', {
            expression: '',
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.Row('row2', {
            expression: '',
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.Row('row3', {
            slice_exprs: [
                defs.Slice('hist', '{row1}[hist] + {row2}[hist]'),
            ],
        }),
        defs.Row('row4', { expression: '{Revenue!row42} + 1' }),
    ],
});

local table3 = defs.Table('Revenue', {
    header_stub: 'us mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Row('row1', { expression: '' }),
        defs.Row('row2', { expression: '' }),
        defs.Row('row3', { expression: '{row1} + {row2}' }),
        defs.Row('row4', { expression: '({row1} + {row2}).sum()' }),
        defs.Row('row5', { expression: '({row1} + {row2}).lag(1)' }),
        defs.Row('row6', {
            expression: '',
            slice_exprs: [
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('row7', { expression: '{row1} + {row2} + {Revenue!row6}' }),
        defs.Row('row8', { expression: '(sum({row1}, {row2})).average()' }),
        defs.Row('row9', { expression: '{row1} + {row2} + {row1}' }),
        defs.Row('row10', { expression: '{row2} + {row1} + {row1}' }),
        defs.Row('row11', { expression: '{Revenue!row2} + {row1} + {row1} + {row2}' }),
        defs.Row('row12', { expression: '(sum({row1}, {row2})).average() + 1' }),
        defs.Row('row13', { expression: '({row1}).average() + ({row2}).average()' }),
        defs.Row('row14', { expression: '3' }),
        defs.Row('row15', { expression: '3 + 5' }),
        defs.Row('row16', { expression: '{row1} + 5' }),
        defs.Row('row17', { expression: '{row1} + ({row2}).average()' }),
        defs.Row('row18', { expression: '{row1} + {Revenue2!row1}' }),
        defs.Row('row19', { expression: '{row6}[proj]' }),
        defs.Row('row20', { expression: '{row1} + {row6}[proj]' }),
        defs.Row('row21', { expression: 'sum({row1}, {row2})' }),
        defs.Row('row22', { expression: 'sum({row1}, {row2}, {row6})' }),
        defs.Row('row23', { expression: '{row1}' }),
        defs.Row('row24', { expression: '{row1}/{row1}.lag(1)' }),
        defs.Row('row25', { expression: '{row1}/{row1}.lag(1)-1' }),
        defs.Row('row26', { expression: 'max({row1}, {Revenue!row2})' }),
        defs.Row('row27', { expression: 'max({row1}, 3)' }),
        defs.Row('row28', { expression: 'min({row1}, {Revenue!row2})' }),
        defs.Row('row29', { expression: 'min({row1}, 3)' }),
        defs.Row('row30', { expression: 'power({row1}.average(), {Revenue!row2}.average())' }),
        defs.Row('row31', { expression: 'power({row1}.average(), 2)' }),
        defs.Row('row32', { expression: 'log({row1}.average(), {Revenue!row2}.average())' }),
        defs.Row('row33', { expression: 'log({row1}.average(), 2)' }),
        defs.Row('row34', { expression: 'sin(0)' }),
        defs.Row('row35', { expression: 'sin({row1}.average())' }),
        defs.Row('row36', { expression: 'cos(0)' }),
        defs.Row('row37', { expression: 'cos({row1}.average())' }),
        defs.Row('row38', { expression: 'irr({row1})' }),
        defs.Row('row39', { expression: 'npv(0.1, {row1})' }),
        defs.Row('row40', { expression: '{row1}.max()' }),
        defs.Row('row41', { expression: '{row1}.min()' }),
        defs.Row('row42', { expression: 'round(5.45, 1)' }),
        defs.Row('row43', { expression: '({row1} + {row2}).lead(1)' }),
        defs.Row('row44', { expression: '{row1}.diff(1)' }),
        defs.Row('row45', { expression: '{row1}.growth()' }),
        defs.Row('row46', { expression: '({row1} / {row1}.lag(1)).average()' }),
        defs.Row('row47', { expression: '({row1} + {row2}).lag(1Y)' }),
        defs.Row('row48', { expression: '{row1}.year()' }),
        defs.Row('row49', { expression: '{row1}.day()' }),
        defs.Row('row50', { expression: '({row1} + {row2}).year()' }),
        defs.Row('row51', { expression: '({row1} + {row2}).day()' }),
        defs.Row('row52', { expression: 'IFERROR({row1} / 0, 0)' }),
        defs.Row('row53', { expression: '{row53}.LINEAR(1, 4)' }),
        defs.Row('row54', { expression: 'AVERAGEIFV({row1}, {Revenue!row2})' },),
        defs.Row('row55', { expression: '{row1}.AVERAGEIFV()' },),
        defs.Row('row56', { expression: 'IFERROR({row1} / {Revenue!row2}, NULL)' }),
        defs.Row('row57', { expression: 'IF({row53} <= 2, 0, 1)' },),
        defs.Row('row58', { expression: 'DATE(2020, 7, 21)' },),
        defs.Row('row59', { expression: 'XIRR({row1}, {Revenue!row2})' },),
        defs.Row('row60', { expression: 'XNPV(0.9, {row1}, {Revenue!row2})' },),
    ],
});

local table4 = defs.Table('Revenue2', {
    header_stub: 'us mn',
    subnodes: [
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('row1', { expression: '' }),
        defs.Row('row2', { expression: '' }),
        defs.Row('row3', { expression: '{row1} + {row2}' }),
        defs.Row('row4', { expression: '' }),
        defs.Row('row5', { expression: 'sum({row1}, {row2}, {row4})' }),
        defs.Row('row6', { expression: '{row1}.lag(1Y)' }),
        defs.Row('row7', { expression: '{row1}.lag(1Q)' }),
        defs.Row('row8', { expression: '{row1}.lag(1HY)' }),
        defs.Row('row9', { expression: '{row1}.lag(2Q)' }),
        defs.RowBlock('block1', {
            subnodes: [
                defs.Row('resolve_test_row', { expression: '{Revenue!row46} + 1' }),
            ],
        }),
    ],
});

local table5 = defs.Table('Table5', {
    header_stub: 'us mn',
    subnodes: [
        defs.ColBlock('2017', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {
                    slice_exprs: [
                        defs.Slice('stock', '{Q1} + {Q2} + {Q3} + {Q4}'),
                        defs.Slice('current', '{Q4}'),
                    ],
                }),
            ],
        }),
        defs.ColBlock('2018', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {
                    slice_exprs: [
                        defs.Slice('stock', '{Q1} + {Q2} + {Q3} + {Q4}'),
                        defs.Slice('current', '{Q4}'),
                    ],
                }),
            ],
        }),
        defs.ColBlock('2019', {
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {
                    slice_exprs: [
                        defs.Slice('stock', '{Q1} + {Q2} + {Q3} + {Q4}'),
                        defs.Slice('current', '{Q4}'),
                    ],
                }),
            ],
        }),
        defs.Row('row1', {
            expression: '',
            labels: ['stock'],
        }),
        defs.Row('row2', {
            expression: '',
            labels: ['current'],
        }),
        defs.Row('row3', { expression: '{row1} + {row2}' }),
        defs.Row('row4', { expression: '' }),
        defs.Row('row5', { expression: 'sum({row1}, {row2}, {row4})' }),
        defs.Row('row6', { expression: '{row1}.lag(1Y)' }),
        defs.Row('row7', { expression: '{row1}.lag(1Q)' }),
        defs.Row('row8', { expression: '{row1}.lag(1HY)' }),
        defs.Row('row9', { expression: '{row1}.lag(2Q)' }),
        defs.Row('row10', {
            expression: '{row1} + {row2}',
            labels: ['stock'],
        }),
        defs.Row('row11', {
            expression: '{row1} + {row2}',
            labels: ['current'],
        }),
    ],
});

local book = defs.Book('Test model', {
    subnodes: [defs.Sheet('Control', {
        subnodes: [table1, table2, table3, table4, table5],
    })],
});

book
