local defs = import '../defs.jsonnet';

local table4 = defs.Table('公司自由现金流量', {
    header_stub: '单位：亿元',
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'terminal'] }),
        defs.Row('EBIT', {
            expression: '{综合损益表!营业利润}',
        }),
        defs.Row('Non-cash Expenses', {
            expression: '{现金流量表!投资活动现金净流量!新增固定资产}-{现金流量表!投资活动现金净流量!出售固定资产}-({资产负债表!非流动资产小计!固定资产@1}-{资产负债表!非流动资产小计!固定资产@1}.LAG(1))',
        }),
        defs.Row('Change in Working Capital', {
            expression: '({资产负债表!流动资产小计}-{资产负债表!流动负债合计}) - ({资产负债表!流动资产小计}.lag(1)-{资产负债表!流动负债合计}.LAG(1))',
        }),
        defs.Row('CAPEX', {
            expression: '{Assump!Assumption!CAPEX}',
        }),
        defs.Row('FCF', {
            expression: '{EBIT}*(1-{综合损益表!所得税}/{综合损益表!税前利润})+{Non-cash Expenses} - {Change in Working Capital} - {CAPEX}',
        }),
        defs.Row('Terminal Value', {
            expression: '9821*(1+0.1)/(0.2-0.1)',
            is_def_scalar: true,
        }),
        defs.Row('Equity Value', {
            expression: 'NPV(0.2, {FCF})',
            is_def_scalar: true,
        }),
    ],
});

table4
