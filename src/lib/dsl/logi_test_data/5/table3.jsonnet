local defs = import '../defs.jsonnet';

local rows2_sub1 = defs.RowBlock('投资活动现金净流量', {
    subnodes: [
        defs.Row('新增固定资产', {
            labels: ['asp'],
            sources: [-0.03481, -0.08736, -0.0214, -0.05731, -0.06102, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{综合损益表!净利润}*{%净利润@1}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['新增固定资产'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{新增固定资产}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@1}[hist].average()'),
            ],
            alias: '1',
        }),
        defs.Row('新增投资', {
            labels: ['asp'],
            sources: [0, 0, -3.5, -5.39, -32.75, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{综合损益表!净利润}*{%净利润@2} + {资产负债表!流动资产小计!金融资产}-{资产负债表!流动资产小计!金融资产}.LAG(1)+{资产负债表!非流动资产小计!其他非流动资产}-{资产负债表!非流动资产小计!其他非流动资产}.LAG(1)+{资产负债表!非流动资产小计!无形资产及商誉}-{资产负债表!非流动资产小计!无形资产及商誉}.LAG(1)'),
            ],
            alias: '1',
        }),
        defs.Row('新增投资', {
            labels: ['check'],
            modifier: '--',
            expression: '{综合损益表!净利润}*{%净利润@2}+{资产负债表!流动资产小计!金融资产}-{资产负债表!流动资产小计!金融资产}.LAG(1)+{资产负债表!非流动资产小计!其他非流动资产}-{资产负债表!非流动资产小计!其他非流动资产}.LAG(1) + {资产负债表!非流动资产小计!无形资产及商誉} - {资产负债表!非流动资产小计!无形资产及商誉}.lag(1) + {综合损益表!公允价值变动及减值准备} - {综合损益表!公允价值变动及减值准备}.lag(1)',
            alias: '2',
        }),
        defs.Row('check', {
            labels: ['新增投资'],
            modifier: '--',
            expression: '{新增投资@2}-{新增投资@1}',
        }),
        defs.Row('%净利润', {
            labels: ['新增投资'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{新增投资@1}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@2}[hist].AVERAGE()'),
            ],
            alias: '2',
        }),
        defs.Row('出售固定资产', {
            labels: ['asp'],
            sources: [0.00118, 0, 0.00076, 0.00013, 0.00048, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{综合损益表!净利润}*{%净利润@3}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['出售固定资产'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{出售固定资产}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@3}[hist].AVERAGE()'),
            ],
            alias: '3',
        }),
        defs.Row('减少投资', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{综合损益表!净利润}*{%净利润@4}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['减少投资'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{减少投资}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@4}[hist].AVERAGE()'),
            ],
            alias: '4',
        }),
    ],
});

local rows2_sub2 = defs.RowBlock('筹资活动现金净流量', {
    subnodes: [
        defs.Row('新增贷款', {
            labels: ['asp'],
            sources: [0, 0, 2, 5.96, 23.04, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{资产负债表!流动负债合计!短期借款}-{资产负债表!流动负债合计!短期借款}.LAG(1) + {资产负债表!流动负债合计!其他短期负债} - {资产负债表!流动负债合计!其他短期负债}.lag(1) + {资产负债表!非流动负债合计!长期借款} - {资产负债表!非流动负债合计!长期借款}.LAG(1) + {资产负债表!非流动负债合计!其他非流动负债}-{资产负债表!非流动负债合计!其他非流动负债}.LAG(1)',),
            ],
            alias: '1',
        }),
        defs.Row('新增贷款', {
            expression: '{资产负债表!流动负债合计!短期借款}-{资产负债表!流动负债合计!短期借款}.lag(1)+{资产负债表!流动负债合计!其他短期负债}-{资产负债表!流动负债合计!其他短期负债}.LAG(1)+{资产负债表!非流动负债合计!长期借款}-{资产负债表!非流动负债合计!长期借款}.LAG(1)+{资产负债表!非流动负债合计!其他非流动负债}-{资产负债表!非流动负债合计!其他非流动负债}.LAG(1)',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            expression: '{新增贷款@2}-{新增贷款@1}',
            labels: ['新增贷款'],
            modifier: '--',
        }),
        defs.Row('偿还贷款', {
            sources: [0, 0, -0.00735, -7.96, -6.04, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
            ],
        }),
        defs.Row('已收利息', {
            labels: ['asp'],
            sources: [0.14874, 0.14164, 0.09088, 0.08836, 0.32486, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{已收利息}.AVERAGE()',),
            ],
        }),
        defs.Row('已付利息', {
            labels: ['asp'],
            sources: [0, 0, -0.06584, -0.10428, -0.10624, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{%净利润@1}*{综合损益表!净利润}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['已付利息'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{已付利息}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@1}[hist].AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('已收股息', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{%投资}*{资产负债表!非流动资产小计!投资@1}',),
            ],
        }),
        defs.Row('%投资', {
            labels: ['已收股息'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{已收股息}/{资产负债表!非流动资产小计!投资@1}'),
                defs.Slice('proj', '{%投资}.AVERAGE()'),
            ],
        }),
        defs.Row('已付股息', {
            labels: ['asp'],
            sources: [0, 0, 0, 0, 0, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '{%净利润@2}*{综合损益表!净利润}',),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['已付股息'],
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{已付股息}/{综合损益表!净利润}'),
                defs.Slice('proj', '{%净利润@2}[hist].AVERAGE()'),
            ],
            alias: '2',
        }),
        defs.Row('股本融资', {
            labels: ['asp'],
            sources: [10.61, 0, 0.0017, 14.69, 0.52979, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', '',),
                defs.Slice('proj', '0',),
            ],
        }),
    ],
});

local table3 = defs.Table('现金流量表', {
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

        defs.Row('已缴税项', {
            labels: ['asp'],
            sources: [0, -0.00021, -0.00269, -0.0535, -0.19264, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{已缴税项}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('经营活动现金净流量', {
            labels: ['asp'],
            modifier: '+',
            sources: [-0.55387, -1.17, -2.26, -0.70272, 3.96, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{资产负债表!流动资产小计!应收账款}-{资产负债表!流动资产小计!应收账款}.LAG(1)+{资产负债表!流动资产小计!存货}-{资产负债表!流动资产小计!存货}.lag(1)+{资产负债表!流动资产小计!其他流动资产}-{资产负债表!流动资产小计!其他流动资产}.LAG(1)-{资产负债表!流动负债合计!应付账款}+{资产负债表!流动负债合计!应付账款}.LAG(1)'),
            ],
            alias: '1',
        }),
        defs.Row('经营活动现金净流量', {
            expression: '{资产负债表!流动资产小计!应收账款} - {资产负债表!流动资产小计!应收账款}.LAG(1) + {资产负债表!流动资产小计!存货} - {资产负债表!流动资产小计!存货}.LAG(1)+{资产负债表!流动资产小计!其他流动资产}-{资产负债表!流动资产小计!其他流动资产}.lag(1)-{资产负债表!流动负债合计!应付账款}+{资产负债表!流动负债合计!应付账款}.LAG(1)',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            labels: ['check'],
            modifier: '--',
        }),
        defs.Row('投资活动现金净流量', {
            expression: 'SUM({投资活动现金净流量!新增固定资产},{投资活动现金净流量!新增投资@1},{投资活动现金净流量!出售固定资产},{投资活动现金净流量!减少投资})',
            modifier: '++',
        }),
        rows2_sub1,
        defs.Row('筹资活动现金净流量', {
            expression: 'SUM({筹资活动现金净流量!新增贷款@1},{筹资活动现金净流量!偿还贷款},{筹资活动现金净流量!已收利息},{筹资活动现金净流量!已付利息},{筹资活动现金净流量!已收股息}, {筹资活动现金净流量!已付股息},{筹资活动现金净流量!股本融资})',
            modifier: '++',
        }),
        rows2_sub2,
        defs.Row('现金及现金等价物增加减少', {
            expression: '{经营活动现金净流量@1}+{投资活动现金净流量}+{筹资活动现金净流量}',
            modifier: '+++',
        }),
        defs.Row('年初现金及现金等价物余额', {
            sources: [1.73, 12.14, 7.14, 5.7, 5.08, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{现金流量表!年末现金及现金等价物余额}.LAG(1)'),
            ],
            alias: '1',
        }),
        defs.Row('年初现金及现金等价物余额', {
            expression: '{现金流量表!年末现金及现金等价物余额}.LAG(1)',
            labels: ['check'],
            modifier: '--',
            alias: '2',
        }),
        defs.Row('check', {
            expression: '{年初现金及现金等价物余额@2}-{年初现金及现金等价物余额@1}',
            labels: ['年初现金及现金等价物余额'],
            modifier: '--',
        }),
        defs.Row('外币汇率变动影响', {
            labels: ['asp'],
            sources: [0, 0.3904, 0.47589, -0.28472, 0.62804, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '0'),
            ],
        }),
        defs.Row('年末现金及现金等价物余额', {
            expression: '{年初现金及现金等价物余额@1}+{外币汇率变动影响}+{现金及现金等价物增加减少}',
            modifier: '+++',
        }),
    ],
});

table3
