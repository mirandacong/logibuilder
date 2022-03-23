local defs = import '../defs.jsonnet';

local row_bolck1 = defs.RowBlock('Sales', {
    modifier: '+',
    subnodes: [
        defs.Row('Product 1', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Ratios!yoy growth!Sales!Product 1}[proj && qr].lag(1) * (1+{Ratios!yoy growth!Sales!Product 1})'),
                defs.Slice('proj && qr', ''),
            ],
        }),
        defs.Row('Product 2', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Product 2}[last]'),
                defs.Slice('last', ''),
            ],
        }),
    ],
});

local table1 = defs.Table('Income Statement', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('Sales', {
            expression: 'SUM({Sales!Product 1},{Sales!Product 2})',
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        row_bolck1,
        defs.Row('Cost of Sales', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Sales}[proj] * {Ratios!COGS % Sales}[proj]'),
            ],
        }),
        defs.Row('Gross Profit', {
            expression: '{Sales}-{Cost of Sales}',
            modifier: '+',
        }),
        defs.Row('Operating Expenses', {
            expression: '{R&D Expenses} + {SG&A Expenses}',
            modifier: '+',
        }),
        defs.Row('R&D Expenses', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('SG&A Expenses', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Operating Income', {
            expression: '{Gross Profit} - {Operating Expenses}',
            modifier: '+',
        }),
        defs.Row('D&A', {
            expression: '{Cash Flow Statement!Cash Flow Statement!D&A}',
        }),
        defs.Row('EBITDA', {
            expression: '{Operating Income}+{D&A}',
        }),
        defs.Row('Interest Expenses', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '({Balance Sheet!Balance Sheet!Total Debt}[hist]+{Balance Sheet!Balance Sheet!Total Debt}[hist].lag(1))/2* {Ratios!Interest Rate}'),
            ],
        }),
        defs.Row('Other Non Operating Income', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Pretax Income', {
            expression: '{Operating Income}+{Interest Expenses}+{Other Non Operating Income}',
            modifier: '+',
        }),
        defs.Row('Taxes', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '-({Pretax Income}*{Ratios!Tax Rate})'),
            ],
        }),
        defs.Row('EBT', {
            expression: '{Pretax Income} - {Taxes}',
        }),
        defs.Row('Net Income Attributable to the Minority Interest', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '-({EBT} * {Ratios!Net Income Attributable to the Minority Interest % EBT})'),
            ],
        }),
        defs.Row('Net Income', {
            expression: '{Pretax Income}+{Taxes}+{Net Income Attributable to the Minority Interest}',
            modifier: '+',
        }),
        defs.Row('Diluted Shares', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Diluted Shares}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('EPS Diluted', {
            modifier: '+',
            expression: '{Net Income}/{Diluted Shares}',
        }),
    ],
});

local table2 = defs.Table('Variation of the Share Capital', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('Share Repurchases', { modifier: '+' }),
        defs.Row('Beggining Basic Shares', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Ending Basic Shares}.lag(1)'),
            ],
        }),
        defs.Row('Shares Issued', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Shares Repurchased', {
            expression: '- {Share Repurchased}[cal]',
            labels: ['ref'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('ref', ''),
            ],
        }),
        defs.Row('Ending Basic Shares', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Beggining Basic Shares} + {Shares Issued} + {Shares Repurchased}[ref]'),
            ],
        }),
        defs.Row('Average Basic Shares', {
            modifier: '+',
            expression: 'AVERAGE({Beggining Basic Shares},{Ending Basic Shares})',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Dilutive Effect of Stock Options', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{Average Diluted Shares}[hist]-{Average Basic Shares}[hist]'),
                defs.Slice('proj', '{Dilutive Effect of Stock Options}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Average Diluted Shares', {
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Average Basic Shares}[proj]+{Dilutive Effect of Stock Options}[proj]'),
            ],
        }),
        defs.Row('Share Repurchased', {
            labels: ['cal'],
            slice_exprs: [
                defs.Slice('cal', ''),
                defs.Slice('hist', ''),
                defs.Slice('proj', '{$ Repurchases}[proj]/{Share Price}[proj]'),
            ],
        }),
        defs.Row('Share Price', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('$ Repurchases', {
            slice_exprs: [
                defs.Slice('hist', '{Share Repurchased}[hist]*{Share Price}[hist]'),
                defs.Slice('proj', ''),
            ],
        }),
    ],
});

local row_block4 = defs.RowBlock('Sales', {
    modifier: '+',
    subnodes: [
        defs.Row('Product 1', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{Income Statement!Sales!Product 1}/{Income Statement!Sales!Product 1}.lag(1)-1'),
                defs.Slice('proj', '{Product 1}[hist].average()'),
            ],
        }),
        defs.Row('Product 2', {
            modifier: '-',
            expression: '{Income Statement!Sales!Product 2}/{Income Statement!Sales!Product 2}.lag(1)-1',
        }),
    ],
});

local row_block2 = defs.RowBlock('yoy growth', {
    subnodes: [
        defs.Row('Sales', { modifier: '+' }),
        row_block4,
        defs.Row('Gross Profit', {
            expression: '{Income Statement!Gross Profit}/ {Income Statement!Gross Profit} -1',
        }),
        defs.Row('Net Income', {
            expression: '{Income Statement!Net Income}/ {Income Statement!Net Income} -1',
        }),
    ],
});

local row_block3 = defs.RowBlock('Margins', {
    modifier: '+',
    subnodes: [
        defs.Row('Gross Margin', {
            expression: '{Income Statement!Gross Profit}/{Income Statement!Sales}',
            modifier: '-',
        }),
        defs.Row('EBITDA Margin', {
            expression: '{Income Statement!Operating Income}/{Income Statement!Sales}',
            labels: ['Operating Income'],
            modifier: '-',
        }),
        defs.Row('EBITDA Margin', {
            expression: '{Income Statement!EBITDA} / {Income Statement!Sales}',
            labels: ['EBITDA'],
            modifier: '-',
        }),
    ],
});

local table3 = defs.Table('Ratios', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('yoy growth', {
            modifier: '+',
        }),
        row_block2,
        defs.Row('Margins', {
            modifier: '+',
        }),
        row_block3,
        defs.Row('COGS % Sales', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{Income Statement!Cost of Sales}/{Income Statement!Sales}'),
                defs.Slice('proj', '{COGS % Sales}[hist].average()'),
            ],
        }),
        defs.Row('Interest Rate', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{Income Statement!Interest Expenses}[hist] / ({Balance Sheet!Balance Sheet!Total Debt}[hist] + {Balance Sheet!Balance Sheet!Total Debt}[hist].lag(1))/2'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Tax Rate', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '-({Income Statement!Taxes}/{Income Statement!Pretax Income})'),
                defs.Slice('proj', '{Tax Rate}[hist].average()'),
            ],
        }),
        defs.Row('Net Income Attributable to the Minority Interest % EBT', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '-({Income Statement!Net Income Attributable to the Minority Interest} / {Income Statement!EBT})'),
                defs.Slice('proj', '{Net Income Attributable to the Minority Interest % EBT}.average()'),
            ],
        }),
    ],
});

local sheet1 = defs.Sheet('Income Statement', { subnodes: [table1, table2, table3] });

sheet1
