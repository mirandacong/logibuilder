local defs = import '../defs.jsonnet';

local row_block1 = defs.RowBlock('D&A', {
    modifier: '-',
    subnodes: [
        defs.Row('Depreciation', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Balance Sheet!Balance Sheet!PP&E, Net}.lag(1) * {Ratios!Depreciation % Opening PP&E}[proj]'),
            ],
        }),
        defs.Row('Ammortization', {
            modifier: '-',
            expression: '',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '0'),
            ],
        }),
    ],
});

local table1 = defs.Table('Cash Flow Statement', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('Net Income', {
            modifier: '+',
            expression: '{Income Statement!Income Statement!Net Income}',
        }),
        defs.Row('Adjustments', {},),
        defs.Row('D&A', {
            modifier: '-',
            expression: 'sum({D&A!Depreciation}, {D&A!Ammortization})',
        }),
        row_block1,
        defs.Row('Stock-Based Compensation Expenses', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Stock-Based Compensation Expenses}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Deferred Income Taxes', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Balance Sheet!Balance Sheet!Deferred Income Taxes}-{Balance Sheet!Balance Sheet!Deferred Income Taxes}.lag(1)'),
            ],
        }),
        defs.Row('Other', {
            expression: '{Balance Sheet!Balance Sheet!Prepaid Expenses and Other Current Assets}[adjustments] -{Balance Sheet!Balance Sheet!Prepaid Expenses and Other Current Assets}[adjustments].lag(1)',
            labels: ['Adjustments'],
            modifier: '-',
            alias: '1',
        }),
        defs.Row('Changes in A/L', {}),
        defs.Row('Receivables', {
            expression: '-({Balance Sheet!Balance Sheet!Receivables, Net} -{Balance Sheet!Balance Sheet!Receivables, Net}.lag(1))',
            modifier: '-',
        }),
        defs.Row('Inventories', {
            expression: '-({Balance Sheet!Balance Sheet!Inventories} - {Balance Sheet!Balance Sheet!Inventories}.lag(1))',
            modifier: '-',
        }),
        defs.Row('A&P, Accrued and Other Liabilities', {
            expression: '({Balance Sheet!Balance Sheet!Accounts Payable} -{Balance Sheet!Balance Sheet!Accounts Payable}.lag(1))+ ({Balance Sheet!Balance Sheet!Accrued and Other Liabilities} - {Balance Sheet!Balance Sheet!Accrued and Other Liabilities}.lag(1))',
            modifier: '-',
        }),
        defs.Row('Other Operating Assets and Liabilities', {
            expression: '-({Balance Sheet!Balance Sheet!Other Assets} -{Balance Sheet!Balance Sheet!Other Assets}.lag(1))+({Balance Sheet!Balance Sheet!Other Liabilities} -{Balance Sheet!Balance Sheet!Other Liabilities}.lag(1))',
            modifier: '-',
        }),
        defs.Row('Cash Provided by Operations', {
            expression: '{Net Income}+SUM({D&A},{Stock-Based Compensation Expenses},{Deferred Income Taxes},{Other@2}) + SUM({Receivables},{Inventories},{A&P, Accrued and Other Liabilities},{Other Operating Assets and Liabilities})',
            modifier: '+',
        }),
        defs.Row('Cash Flows from Investing Activities', {}),
        defs.Row('CAPEX', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Income Statement!Income Statement!Sales}[hist]* {Ratios!CAPEX % Sales}'),
            ],
        }),
        defs.Row('Proceeds from Asset Sales', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Payment for Aquisition', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Other', {
            labels: ['Cash Flows from Investing Activities'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{Cash Used for Investing Activities} - SUM({CAPEX},{Proceeds from Asset Sales},{Payment for Aquisition})'),
                defs.Slice('proj', '{Other@1}[last && Cash Flows from Investing Activities]'),
                defs.Slice('last && Cash Flows from Investing Activities', ''),
                defs.Slice('proj && Cash Flows from Investing Activities', ''),
            ],
            alias: '2',
        }),
        defs.Row('Cash Used for Investing Activities', {
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', 'SUM({CAPEX}[proj],{Proceeds from Asset Sales}[proj],{Payment for Aquisition},{Other@1}[proj && Cash Flows from Investing Activities])'),
            ],
        }),
        defs.Row('Cash Flows from Financing Activities', {}),
        defs.Row('Change in Short-Term Debt', {
            expression: '{Balance Sheet!Balance Sheet!Short-Term Debt}.diff(1) + {Balance Sheet!Balance Sheet!Notes and Loan Payables}.diff(1) + {Balance Sheet!Balance Sheet!Current Portion of Long-Term Debt}.diff(1)',
            modifier: '-',
        }),
        defs.Row('Change in Long-Term Debt', {
            expression: '{Balance Sheet!Balance Sheet!Long-Term Debt} -{Balance Sheet!Balance Sheet!Long-Term Debt}.lag(1)',
            modifier: '-',
        }),
        defs.Row('Dividends Paid', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '-({Income Statement!Income Statement!Diluted Shares}[proj]* {Ratios!Dividend per Share}[proj])'),
            ],
        }),
        defs.Row('Purchase of Treasury Shares', {
            modifier: '-',
            expression: '-{Income Statement!Variation of the Share Capital!$ Repurchases}',
        }),
        defs.Row('Proceeds from Stock Options, Other', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Proceeds from Stock Options, Other}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Cash Used for Financing Activities', {
            expression: 'SUM({Change in Short-Term Debt},{Change in Long-Term Debt},{Dividends Paid},{Purchase of Treasury Shares},{Proceeds from Stock Options, Other})',
            modifier: '+',
        }),
        defs.Row('Cash Provided by Discontinued Operations', {
            expression: '0',
            labels: ['ASSUMPTION'],
        }),
        defs.Row('Exchange Rate Effect on Cash / Other', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '0'),
            ],
        }),
        defs.Row('Net Increase (Decrease) in Cash and Cash Equivalents', {
            expression: 'SUM({Cash Provided by Operations},{Cash Used for Investing Activities}, {Cash Used for Financing Activities})',
            modifier: '+',
        }),
        defs.Row('Cash and Cash Equivs, Beg', {
            expression: '{Cash and Cash Equivs, End}.lag(1)',
        }),
        defs.Row('Cash and Cash Equivs, End', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Cash and Cash Equivs, Beg} + {Net Increase (Decrease) in Cash and Cash Equivalents}'),
            ],
        }),
        defs.Row('check', {
            expression: '{Cash and Cash Equivs, End} - {Balance Sheet!Balance Sheet!Surplus Cash}- {Balance Sheet!Balance Sheet!Surplus Cash}',
        }),
    ],
});

local table2 = defs.Table('Ratios', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('Depreciation % Opening PP&E', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Cash Flow Statement!D&A}/{Balance Sheet!Balance Sheet!PP&E, Net}.lag(1)'),
                defs.Slice('proj', '{Depreciation % Opening PP&E}[hist].average()'),
            ],
        }),
        defs.Row('Dividend per Share', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Cash Flow Statement!Dividends Paid}[hist]/{Income Statement!Income Statement!Diluted Shares}[proj]'),
            ],
        }),
        defs.Row('CAPEX % Sales', {
            slice_exprs: [
                defs.Slice('hist', '{Cash Flow Statement!CAPEX}[hist]/{Income Statement!Income Statement!Sales}[hist]'),
                defs.Slice('proj', '{CAPEX % Sales}[hist].average()'),
            ],
        }),
    ],
});

local sheet3 = defs.Sheet('Cash Flow Statement', { subnodes: [table1, table2] });

sheet3
