local defs = import '../defs.jsonnet';

local table5 = defs.Table('Assumption', {
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
        defs.Row('营业收入增长率', {
            sources: [null, null, null, null, null, 0.5, 0.3, 0.2, 0.1, 0.2, 0.1],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!综合损益表!营业收入}/{DCF模型!综合损益表!营业收入}.LAG(1)-1'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('营业利润率', {
            sources: [null, null, null, null, null, 0.05, 0.08, 0.1, 0.12, 0.15, 0.15],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!综合损益表!营业利润}/{DCF模型!综合损益表!营业收入}',),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('营业外收支利润率', {
            expression: '({DCF模型!综合损益表!税前利润}-{DCF模型!综合损益表!营业利润})/({DCF模型!综合损益表!公允价值变动及减值准备} + {DCF模型!综合损益表!其他收入} + {DCF模型!综合损益表!营业外收入})',
        }),
        defs.Row('CAPEX', {
            expression: '{DCF模型!现金流量表!投资活动现金净流量!新增固定资产}-{DCF模型!现金流量表!投资活动现金净流量!出售固定资产}',
        }),
        defs.Row('Depreciation', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!现金流量表!投资活动现金净流量!新增固定资产} - {DCF模型!现金流量表!投资活动现金净流量!出售固定资产}-({DCF模型!资产负债表!非流动资产小计!固定资产@1}-{DCF模型!资产负债表!非流动资产小计!固定资产@1}.LAG(1))'),
                defs.Slice('proj', '{DCF模型!综合损益表!净利润}*{%净利润}'),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['Depreciation'],
            slice_exprs: [
                defs.Slice('hist', '{Depreciation}/{DCF模型!综合损益表!净利润}',),
                defs.Slice('proj', '{%净利润}.AVERAGE()',),
            ],
        }),
        defs.Row('WACC', {
            expression: '0.2',
            is_def_scalar: true,
        }),
    ],
});

table5
