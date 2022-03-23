local defs = import '../defs.jsonnet';

local row_block1 = defs.RowBlock('流动资产小计', {
    subnodes: [
        defs.Row('现金及现金等价物', {
            sources: [12.18, 10.21, 5.71, 13.99, 2.82, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{现金流量表!年末现金及现金等价物余额}',),
            ],
            alias: '1',
        }),
        defs.Row('现金及现金等价物', {
            expression: '{现金流量表!年末现金及现金等价物余额}',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            expression: '{现金及现金等价物@2}-{现金及现金等价物@1}',
            labels: ['现金及现金等价物'],
            modifier: '--',
        }),
        defs.Row('应收账款', {
            labels: ['asp'],
            sources: [0.0107, 0.00106, 0.38501, 0.91373, 3.65, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['应收账款', 'asp'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{应收账款}/{综合损益表!营业收入}',),
                defs.Slice('proj', '{%营业收入@1}[hist].AVERAGE()',),
            ],
            alias: '1',
        }),
        defs.Row('存货', {
            labels: ['asp'],
            sources: [0, 0, 1.52, 4.42, 5.96, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业成本}*{%营业成本}'),
            ],
        }),
        defs.Row('%营业成本', {
            labels: ['存货'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{存货}/{综合损益表!营业成本}'),
                defs.Slice('proj', '{%营业成本}.AVERAGE()'),
            ],
        }),
        defs.Row('金融资产', {
            labels: ['asp'],
            sources: [0, 0, 0.103, 0.041, 17.37, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@2}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['金融资产'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{金融资产}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@2}.AVERAGE()'),
            ],
            alias: '2',
        }),
        defs.Row('其他流动资产', {
            labels: ['asp'],
            sources: [0.14994, 0.14824, 0.39835, 0.78924, 3.23, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@3}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他流动资产'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他流动资产}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@3}.AVERAGE()'),
            ],
            alias: '3',
        }),
    ],
});

local row_block2 = defs.RowBlock('非流动资产小计', {
    subnodes: [
        defs.Row('固定资产', {
            labels: ['asp'],
            sources: [0.0418, 0.06546, 0.05065, 0.06274, 0.0888, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{固定资产@1}.LAG(1)+{现金流量表!投资活动现金净流量!新增固定资产} - {现金流量表!投资活动现金净流量!出售固定资产}-{Assump!Assumption!Depreciation}'),
            ],
            alias: '1',
        }),
        defs.Row('固定资产', {
            expression: '{固定资产@1}.LAG(1)+{现金流量表!投资活动现金净流量!新增固定资产} - {现金流量表!投资活动现金净流量!出售固定资产}-{Assump!Assumption!Depreciation}',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            expression: '{固定资产@2}-{固定资产@1}',
            labels: ['固定资产'],
            modifier: '--',
        }),
        defs.Row('投资', {
            labels: ['asp'],
            sources: [1.71, 1.96, 5.67, 10.14, 26.03, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{投资@1}.LAG(1)+{现金流量表!投资活动现金净流量!新增投资@1} - {现金流量表!投资活动现金净流量!减少投资}'),
            ],
            alias: '1',
        }),
        defs.Row('投资', {
            labels: ['check'],
            modifier: '--',
            expression: '{投资@1}.LAG(1) + {现金流量表!投资活动现金净流量!新增投资@1}-{现金流量表!投资活动现金净流量!减少投资}',
            alias: '2',
        }),
        defs.Row('check', {
            labels: ['投资'],
            modifier: '--',
            expression: '{投资@2}-{投资@1}',
        }),
        defs.Row('无形资产及商誉', {
            labels: ['asp'],
            sources: [0, 0, 0.19123, 0.19123, 0.27006, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{无形资产及商誉}.LAG(1)'),
            ],
        }),
        defs.Row('其他非流动资产', {
            labels: ['asp'],
            sources: [0, 1.1, 2.77, 0.55921, 0.39372, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他非流动资产'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他非流动资产}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入}.AVERAGE()'),
            ],
        }),
    ],
});

local row_block3 = defs.RowBlock('流动负债合计', {
    subnodes: [
        defs.Row('应付账款', {
            labels: ['asp'],
            sources: [0.03653, 0.03751, 1.26, 3.23, 9.03, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业成本}*{%营业成本}'),
            ],
        }),
        defs.Row('%营业成本', {
            labels: ['应付账款'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{应付账款}/{综合损益表!营业成本}'),
                defs.Slice('proj', '{%营业成本}.AVERAGE()'),
            ],
        }),
        defs.Row('短期借款', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 17, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['短期借款'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{短期借款} / {综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@1}.AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('其他短期负债', {
            labels: ['asp'],
            sources: [1.18, 1.82, 2.28, 2.57, 6.31, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@2}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他短期负债'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他短期负债}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@2}.AVERAGE()'),
            ],
            alias: '2',
        }),
    ],
});

local row_block4 = defs.RowBlock('非流动负债合计', {
    subnodes: [
        defs.Row('长期借款', {
            labels: ['asp'],
            sources: [0, 0, 2, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['长期借款'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{长期借款}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@1}.AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('其他非流动负债', {
            labels: ['asp'],
            sources: [0.19706, 0.07019, 0.06566, 0.07682, 0.11677, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{综合损益表!营业收入}*{%营业收入@2}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['其他非流动负债'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{其他非流动负债}/{综合损益表!营业收入}'),
                defs.Slice('proj', '{%营业收入@2}.AVERAGE()'),
            ],
            alias: '2',
        }),
    ],
});

local row_block6 = defs.RowBlock('归属于母公司所有者权益合计', {
    subnodes: [
        defs.Row('股本总额', {
            sources: [0.72305, 0.72305, 0.72481, 0.86617, 1.03, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('股份溢价', {
            sources: [18.64, 18.64, 19.07, 72.56, 199.67, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('资本储备及其他储备', {
            sources: [0.95766, 1.83, 3.03, -35.59, -159.95, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('未分配利润', {
            sources: [-7.06, -8.98, -11.05, -12.03, -12.81, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
    ],
});


local row_block5 = defs.RowBlock('所有者权益合计', {
    subnodes: [
        defs.Row('归属于母公司所有者权益合计', {
            labels: ['asp'],
            modifier: '++',
            slice_exprs: [
                defs.Slice('hist', 'SUM({归属于母公司所有者权益合计!股本总额},{归属于母公司所有者权益合计!股份溢价},{归属于母公司所有者权益合计!资本储备及其他储备},{归属于母公司所有者权益合计!未分配利润})'),
                defs.Slice('proj', '{归属于母公司所有者权益合计}.lag(1) + {综合损益表!净利润!归属于股东利润}'),
            ],
        }),
        row_block6,
        defs.Row('少数股东权益', {
            labels: ['asp'],
            sources: [-0.58729, -0.66089, -0.58174, -0.57191, -0.57693, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{少数股东权益}.lag(1) + {综合损益表!净利润!少数股东权益@1}'),
            ],
        }),
        defs.Row('其他权益', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', ''),
            ],
        }),
    ],
});


local table1 = defs.Table('资产负债表', {
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
        defs.Row('总资产', {
            expression: '{流动资产小计}+{非流动资产小计}',
            modifier: '++',
        }),
        defs.Row('流动资产小计', {
            expression: 'SUM({流动资产小计!现金及现金等价物@1},{流动资产小计!应收账款},{流动资产小计!存货},{流动资产小计!金融资产},{流动资产小计!其他流动资产})',
            modifier: '++',
        }),
        row_block1,
        defs.Row('非流动资产小计', {
            expression: 'SUM({非流动资产小计!固定资产@1},{非流动资产小计!投资@1},{非流动资产小计!无形资产及商誉},{非流动资产小计!其他非流动资产})',
            modifier: '++',
        }),
        row_block2,
        defs.Row('总负债', {
            expression: '{流动负债合计}+{非流动负债合计}',
            modifier: '++',
        }),
        defs.Row('流动负债合计', {
            expression: 'SUM({流动负债合计!应付账款},{流动负债合计!短期借款},{流动负债合计!其他短期负债})',
            modifier: '++',
        }),
        row_block3,
        defs.Row('非流动负债合计', {
            expression: 'SUM({非流动负债合计!长期借款}, {非流动负债合计!其他非流动负债})',
            modifier: '++',
        }),
        row_block4,
        defs.Row('所有者权益合计', {
            expression: 'SUM({所有者权益合计!归属于母公司所有者权益合计}, {所有者权益合计!少数股东权益}, {所有者权益合计!其他权益})',
            modifier: '++',
        }),
        row_block5,
        defs.Row('负债和所有者权益合计', {
            expression: '{总负债}+{所有者权益合计}',
            modifier: '+++',
        }),
        defs.Row('Check', {
            expression: '{总资产}-{负债和所有者权益合计}',
            modifier: '--',
        }),
    ],
});

table1
