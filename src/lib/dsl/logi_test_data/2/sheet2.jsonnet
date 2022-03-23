local defs = import '../defs.jsonnet';


local table1 = defs.Table('Balance Sheet', {
    header_stub: 'us$ mn',
    subnodes: [
        defs.Col('2016', { labels: ['hist', 'start'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Row('Assets', { modifier: '+' }),
        defs.Row('Receivables', {
            modifier: '-',
            expression: '- ({Receivables, Net} - {Receivables, Net}.lag(1))',
        }),
        defs.Row('Surplus Cash', {
            expression: "max(0, - SUM({Cash & Equivalents}, {Investment Securities}, {Receivables}, {Inventories}, {Deferred Income Taxes}, {Prepaid Expenses and Other Current Assets}) + sum({Notes and Loan Payables}, {Current Portion of Long-Term Debt}, {Accounts Payable}, {Accrued and Other Liabilities}, {Long-Term Debt}, {Deferred Income Taxes}, {Other Liabilities}) + {Total Shareholders' Equity})",
        }),
        defs.Row('Cash & Equivalents', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Cash & Equivalents}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Investment Securities', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Investment Securities}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Receivables, Net', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Income Statement!Income Statement!Sales}[proj] * {Ratios!Inventories % COGS}[proj]'),
            ],
        }),
        defs.Row('Inventories', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Income Statement!Income Statement!Cost of Sales}[proj]* {Ratios!Inventories % COGS}[proj]'),
            ],
        }),
        defs.Row('Prepaid Expenses and Other Current Assets', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Prepaid Expenses and Other Current Assets}[last]'),
                defs.Slice('last', ''),
                defs.Slice('Adjustments', ''),
            ],
        }),
        defs.Row('Total Current Assets', {
            modifier: '++',
            expression: 'SUM({Surplus Cash},{Cash & Equivalents},{Investment Securities},{Receivables, Net},{Inventories},{Deferred Income Taxes},{Prepaid Expenses and Other Current Assets})',
        }),
        defs.Row('PP&E, Net', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{PP&E, Net}[proj].lag(1) + {Income Statement!Income Statement!D&A}'),
            ],
        }),
        defs.Row('Goodwill, Net', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Goodwill, Net}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Other Intangible Assets, Net', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Other Intangible Assets, Net}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Other Assets', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Other Assets}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Total Assets', {
            modifier: '++',
            expression: 'SUM({Total Current Assets},{PP&E, Net},{Goodwill, Net},{Other Intangible Assets, Net}, {Other Assets})',
        }),
        defs.Row('Liabilities', { modifier: '+' }),
        defs.Row('Short-Term Debt', {
            expression: "max(0, SUM({Cash & Equivalents},{Investment Securities},{Receivables},{Inventories},{Deferred Income Taxes},{Prepaid Expenses and Other Current Assets}) - SUM({Notes and Loan Payables},{Current Portion of Long-Term Debt},{Accounts Payable},{Accrued and Other Liabilities},{Long-Term Debt},{Deferred Income Taxes},{Other Liabilities}) - {Total Shareholders' Equity})",
        }),
        defs.Row('Notes and Loan Payables', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Notes and Loan Payables}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Current Portion of Long-Term Debt', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('Accounts Payable', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Income Statement!Income Statement!Cost of Sales} * {Ratios!AP % COGS}'),
            ],
        }),
        defs.Row('Accrued and Other Liabilities', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Income Statement!Income Statement!Sales} * {Ratios!Accrued and Other Liabilities % Sales}'),
            ],
        }),
        defs.Row('Total Current Liabilities', {
            modifier: '++',
            expression: 'SUM({Short-Term Debt},{Notes and Loan Payables},{Current Portion of Long-Term Debt},{Accounts Payable},{Accrued and Other Liabilities})',
        }),
        defs.Row('Long-Term Debt', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Long-Term Debt}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Total Debt', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Long-Term Debt}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Deferred Income Taxes', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Deferred Income Taxes}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Other Liabilities', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Other Liabilities}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Total Liabilities', {
            modifier: '++',
            expression: '{Total Current Liabilities} + SUM({Long-Term Debt},{Deferred Income Taxes},{Other Liabilities})',
        }),
        defs.Row("Shareholders' Equity", {}),
        defs.Row('Preferred Stock', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Preferred Stock}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Common Stock', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Common Stock}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Additional Paid-In Capital', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Additional Paid-In Capital}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Retained Earnings', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Retained Earnings}[proj].lag(1)+{Income Statement!Income Statement!Net Income} + {Cash Flow Statement!Cash Flow Statement!Dividends Paid}'),
            ],
        }),
        defs.Row('Accumulated Other Comprehensive Income', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Accumulated Other Comprehensive Income}[proj].lag(1) + {Cash Flow Statement!Cash Flow Statement!Stock-Based Compensation Expenses} + {Cash Flow Statement!Cash Flow Statement!Proceeds from Stock Options, Other}'),
            ],
        }),
        defs.Row('Reserve for ESOP Debt Retirement', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Reserve for ESOP Debt Retirement}[last]'),
                defs.Slice('last', ''),
            ],
        }),
        defs.Row('Treasury Stock', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Treasury Stock}[proj].lag(1) + {Income Statement!Variation of the Share Capital!$ Repurchases}'),
            ],
        }),
        defs.Row('Minority Interest', {
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{Minority Interest}[proj].lag(1) + {Income Statement!Income Statement!Net Income Attributable to the Minority Interest}'),
            ],
        }),
        defs.Row("Total Shareholders' Equity", {
            modifier: '++',
            expression: 'SUM({Preferred Stock},{Common Stock}, {Additional Paid-In Capital},{Retained Earnings},{Accumulated Other Comprehensive Income}, {Reserve for ESOP Debt Retirement},{Treasury Stock},{Minority Interest})',
        }),
        defs.Row('check', {
            expression: "{Total Liabilities} + {Total Shareholders' Equity} - {Total Assets}",
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
        defs.Row('AR % Sales', {
            slice_exprs: [
                defs.Slice('hist', '{Balance Sheet!Receivables, Net} /{Income Statement!Income Statement!Sales}'),
                defs.Slice('proj', '{AR % Sales}[hist].average()'),
            ],
        }),
        defs.Row('Inventories % COGS', {
            slice_exprs: [
                defs.Slice('hist', '{Balance Sheet!Inventories} / {Income Statement!Income Statement!Cost of Sales}',),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('AP % COGS', {
            slice_exprs: [
                defs.Slice('hist', '{Balance Sheet!Accounts Payable} /{Income Statement!Income Statement!Cost of Sales}'),
                defs.Slice('proj', '{AP % COGS}[hist].average()'),
            ],
        }),
        defs.Row('Accrued and Other Liabilities % Sales', {
            slice_exprs: [
                defs.Slice('hist', '{Balance Sheet!Accrued and Other Liabilities} / {Income Statement!Income Statement!Sales}'),
            ],
        }),
    ],
});

local sheet2 = defs.Sheet('Balance Sheet', { subnodes: [table1, table2] });

sheet2
