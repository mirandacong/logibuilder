local defs = import '../defs.jsonnet';

local get_column_block(table_name, block_name) = (
    defs.Col('FY', {
        labels: ['strategy', 'CHECK'],
        slice_exprs: [
            defs.Slice(
                'stock',
                '{%s!%s!Q1}+' % [table_name, block_name] +
                '{%s!%s!Q2}+' % [table_name, block_name] +
                '{%s!%s!Q3}+' % [table_name, block_name] +
                '{%s!%s!Q4}' % [table_name, block_name]
            ),
            defs.Slice('current', '{%s!%s!Q4}' % [table_name, block_name],),
        ],
    })
);

local rb_sub_row = [
    defs.Row('iPhone', {
        modifier: '-',
        labels: ['assumption'],
        slice_exprs: [
            defs.Slice('proj', ''),
            defs.Slice('hist', ''),
        ],
    }),
    defs.Row('iPad', {
        modifier: '-',
        slice_exprs: [
            defs.Slice('proj', '{iPad}[proj].lag(1)*({iPad}[hist]/{iPad}[hist].lag(1)).average()'),
            defs.Slice('hist', ''),
        ],
    }),
    defs.Row('Mac', {
        slice_exprs: [
            defs.Slice('proj', ''),
            defs.Slice('hist', ''),
        ],
    }),
    defs.Row('Total', {
        slice_exprs: [
            defs.Slice('hist', '{iPhone}[hist]+{iPad}[hist]+{Mac}[hist]'),
            defs.Slice('proj', '{iPhone}[proj] + {iPad}[proj] + {Mac}[proj]'),
        ],
    }),
];


local table1 = defs.Table('Revenue Breakup', {
    header_stub: 'us mn',
    subnodes: [
        defs.ColBlock('2017', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Revenue Breakup', '2017'),
            ],
        }),
        defs.ColBlock('2018', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Revenue Breakup', '2018'),
            ],
        }),
        defs.ColBlock('2019', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Revenue Breakup', '2019'),
            ],
        }),
        defs.ColBlock('2020', {
            labels: ['proj'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.Row('Revenue', {
            expression: 'SUM({Electronic products!Total},{Services})',
            labels: ['stock'],
            modifier: '++',
        }),
        defs.Row('yoy growth', {
            expression: '{Revenue Breakup!Revenue}/{Revenue Breakup!Revenue}.lag(1)-1',
            labels: ['Revenue'],
            modifier: '--',
            alias: '1',
        }),
        defs.Row('Electronic products', {
            modifier: '+',
        }),
        defs.RowBlock('Electronic products', {
            modifier: '+',
            subnodes: rb_sub_row,
        }),
        defs.Row('yoy growth', {
            expression: '{Electronic products!Total}',
            labels: ['Total'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('Services', {
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Services}[proj].lag(1)*(1 + {Control!Revenue Breakup!yoy growth@3})'),
            ],
        }),
        defs.Row('yoy growth', {
            expression: '',
            is_def_scalar: true,
            labels: ['service_growth', 'assumption'],
            modifier: '--',
            alias: '3',
        }),
    ],
});

local table2 = defs.Table('Income Statement', {
    header_stub: 'us mn',
    subnodes: [
        defs.ColBlock('2017', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Income Statement', '2017'),
            ],
        }),
        defs.ColBlock('2018', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Income Statement', '2018'),
            ],
        }),
        defs.ColBlock('2019', {
            labels: ['hist'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                get_column_block('Income Statement', '2019'),
            ],
        }),
        defs.ColBlock('2020', {
            labels: ['proj'],
            subnodes: [
                defs.Col('Q1', {}),
                defs.Col('Q2', {}),
                defs.Col('Q3', {}),
                defs.Col('Q4', {}),
                defs.Col('FY', {}),
            ],
        }),
        defs.Row('Cost of Sales', {
            labels: ['current'],
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Operating Expenses', {
            labels: ['current'],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Revenue Breakup!Revenue} * {as %revenue}[hist].average()'),
            ],
        }),
        defs.Row('as %revenue', {
            expression: '{Operating Expenses}/{Revenue Breakup!Revenue}',
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', ''),
            ],
        }),
        defs.Row('Operating Income', {
            expression: '{Revenue Breakup!Revenue} - {Operating Expenses}',
        }),
        defs.Row('Total Interest & Other Income', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Pretax Income', {
            expression: '{Operating Income} + {Total Interest & Other Income}',
        }),
        defs.Row('tax rate', {
            expression: '',
            is_def_scalar: true,
        }),
        defs.Row('tax', {
            expression: '{Operating Income} * {tax rate}',
        }),
        defs.Row('Net Income', {
            expression: '{Pretax Income} - {tax}',
            modifier: '+',
        }),
        defs.Row('Gross Profit', {
            expression: '{Revenue Breakup!Revenue} - {Cost of Sales}',
        }),
        defs.Row('Gross Margin', {
            expression: '{Gross Profit} / {Revenue Breakup!Revenue}',
            modifier: '--',
        }),
    ],
});

local sheet = defs.Sheet('Control', {
    subnodes: [
        defs.Title('Financial Statement', {
            modifier: '++',
            subnodes: [defs.Title('China', { modifier: '+' })],
        }),
        table1,
        defs.Title('Income Statement', {}),
        table2,
    ],
});

local book = defs.Book('Test model', {
    subnodes: [sheet],
});

book
