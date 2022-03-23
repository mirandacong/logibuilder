local defs = import '../defs.jsonnet';

local row_block1 = defs.RowBlock('营业费用合计', {
    subnodes: [
        defs.Row('销售费用', {
            labels: ['asp'],
            sources: [0.54014, 0.80787, 1.13, 2.01, 4.55, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@1}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['销售费用'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{销售费用}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@1}.AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('管理费用', {
            labels: ['asp'],
            sources: [0.58951, 0.91797, 1.64, 4.6, 7.53, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@2}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['管理费用'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{管理费用}/{营业收入}',),
                defs.Slice('proj', '{%营业收入@2}.AVERAGE()',),
            ],
            alias: '2',
        }),
        defs.Row('研发费用', {
            labels: ['asp'],
            sources: [0.3413, 0.76153, 1.09, 1.26, 2.19, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@3}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['研发费用'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{研发费用}/{营业收入}',),
                defs.Slice('proj', '{%营业收入@3}.AVERAGE()',),
            ],
            alias: '3',
        }),
        defs.Row('其他营业费用', {
            labels: ['asp'],
            sources: [0.54241, 0.26143, 0.24679, 0.11855, 0.02502, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@4}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他营业费用'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他营业费用}/{营业收入}',),
                defs.Slice('proj', '{%营业收入@4}.AVERAGE()',),
            ],
            alias: '4',
        }),
    ],
});

local row_block2 = defs.RowBlock('净利润', {
    subnodes: [
        defs.Row('归属于股东利润', {
            labels: ['asp'],
            sources: [-0.81221, -1.92, -2.08, -1.07, -0.81949, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{%净利润}*{净利润}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['归属于股东利润'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{归属于股东利润}/{净利润}'),
                defs.Slice('proj', '{%净利润}.AVERAGE()'),
            ],
        }),
        defs.Row('少数股东权益', {
            labels: ['asp'],
            sources: [-0.02884, -0.0736, -0.01027, -0.0206, -0.09815, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{净利润}-{归属于股东利润}',),
            ],
            alias: '1',
        }),
        defs.Row('少数股东权益', {
            expression: '{净利润}-{归属于股东利润}',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            expression: '{少数股东权益@2}-{少数股东权益@1}',
            labels: ['少数股东权益'],
            modifier: '--',
        }),
    ],
});

local table2 = defs.Table('综合损益表', {
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
        defs.Row('营业收入', {
            labels: ['asp'],
            sources: [0.29744, 0.56595, 4.75, 24.43, 50.96, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}.LAG(1)*(1+{Assump!Assumption!营业收入增长率})',),
            ],
        }),
        defs.Row('营业税费', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业税费}.LAG(1)',),
            ],
        }),
        defs.Row('营业成本', {
            labels: ['asp'],
            sources: [0.1378, 0.18602, 2.88, 17.9, 37.65, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@1}',),
            ],
        }),
        defs.Row('%营业收入', {
            expression: '1-{Assump!Assumption!营业利润率}',
            modifier: '---',
            labels: ['营业成本'],
            alias: '1',
        }),
        defs.Row('毛利', {
            expression: '{营业收入}-{营业税费}-{营业成本}',
            modifier: '+++',
        }),
        defs.Row('营业费用合计', {
            expression: 'SUM({营业费用合计!销售费用},{营业费用合计!管理费用},{营业费用合计!研发费用},{营业费用合计!其他营业费用})',
            modifier: '++',
        }),
        row_block1,
        defs.Row('营业利润', {
            expression: '{毛利}-{营业费用合计}',
            modifier: '+++',
        }),
        defs.Row('公允价值变动及减值准备', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0.26248, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@2}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['公允价值变动及减值准备'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{公允价值变动及减值准备}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@2}'),
            ],
            alias: '2',
        }),
        defs.Row('其他收入', {
            labels: ['asp'],
            sources: [0.82738, 0.14702, 0.12787, 0.52389, 0.28334, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@3}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他收入'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他收入}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@3}.AVERAGE()'),
            ],
            alias: '3',
        }),
        defs.Row('营业外收入', {
            labels: ['asp'],
            sources: [0, 0, 0.04567, 0.00004, 0.12432, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@4}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['营业外收入'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{营业外收入}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@4}'),
            ],
            alias: '4',
        }),
        defs.Row('财务费用', {
            labels: ['asp'],
            sources: [0, 0, 0.06886, 0.10126, 0.27966, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{%Debt}* ({资产负债表!流动负债合计!短期借款}+{资产负债表!非流动负债合计!长期借款})',),
            ],
        }),
        defs.Row('%Debt', {
            labels: ['财务费用'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{财务费用}/({资产负债表!流动负债合计!短期借款}+{资产负债表!非流动负债合计!长期借款})'),
                defs.Slice('proj', '{%Debt}'),
            ],
        }),
        defs.Row('联营公司损益', {
            labels: ['asp'],
            sources: [0.14956, 0.25068, 0.05047, 0.08947, -0.01644, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{营业收入}*{%营业收入@5}',),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['联营公司损益'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{联营公司损益}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@5}'),
            ],
            alias: '5',
        }),
        defs.Row('税前利润', {
            expression: '{综合损益表!营业利润}+{公允价值变动及减值准备}+{其他收入}+{营业外收入}-{财务费用}+{联营公司损益}',
            modifier: '+++',
        }),
        defs.Row('所得税', {
            labels: ['asp'],
            sources: [0.00927, 0.01851, 0.01554, 0.13889, 0.30934, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{所得税}.LAG(1)/{税前利润}.LAG(1)*{税前利润}',),
            ],
        }),
        defs.Row('净利润', {
            expression: '{税前利润}-{所得税}',
            modifier: '+++',
        }),
        row_block2,
        defs.Row('优先股股息', {}),
        defs.Row('每股基本盈利', {}),
        defs.Row('每股摊薄盈利', {}),
        defs.Row('已发行普通股股数', {}),
    ],
});

table2
