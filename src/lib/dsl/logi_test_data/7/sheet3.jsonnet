local defs = import '../defs.jsonnet';

local table6 = defs.Table('杂项', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('金融资产', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动资产小计!金融资产}'),
                defs.Slice('proj', '{细项分解!杂项!金融资产}.LAG(1Y)+{金融资产净增加}'),
            ],
        }),
        defs.Row('金融资产净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!杂项!金融资产}-{细项分解!杂项!金融资产}.LAG(1Y)'),
                defs.Slice('proj', '{金融资产净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('非金融投资', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!投资}'),
                defs.Slice('proj', '{细项分解!杂项!非金融投资}.LAG(1Y)+{非金融投资净增加}'),
            ],
        }),
        defs.Row('非金融投资净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!杂项!非金融投资}-{细项分解!杂项!非金融投资}.LAG(1Y)'),
                defs.Slice('proj', '{非金融投资净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他流动资产', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动资产小计!其他流动资产}'),
                defs.Slice('proj', '{细项分解!杂项!其他流动资产}.LAG(1Y)+{其他流动资产净增加}'),
            ],
        }),
        defs.Row('其他流动资产净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!杂项!其他流动资产}-{细项分解!杂项!其他流动资产}.LAG(1Y)'),
                defs.Slice('proj', '{其他流动资产净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他短期负债', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动负债合计!其他短期负债}'),
                defs.Slice('proj', '{细项分解!杂项!其他短期负债}.LAG(1Y)+{其他短期负债净增加}'),
            ],
        }),
        defs.Row('其他短期负债净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!杂项!其他短期负债}-{细项分解!杂项!其他短期负债}.LAG(1Y)'),
                defs.Slice('proj', '{其他短期负债净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他非流动负债', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动负债合计!其他非流动负债}'),
                defs.Slice('proj', '{细项分解!杂项!其他非流动负债}.LAG(1Y)+{其他非流动负债净增加}'),
            ],
        }),
        defs.Row('其他非流动负债净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!杂项!其他非流动负债}-{细项分解!杂项!其他非流动负债}.LAG(1Y)'),
                defs.Slice('proj', '{其他非流动负债净增加}.LAG(1Y)'),
            ],
        }),
        defs.Row('其他债务净增加', {
            expression: '{其他非流动负债净增加}+{其他短期负债净增加}',
            modifier: '+',
        }),
    ],
});

local table5 = defs.Table('经营活动现金流量', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('营业收入', {
            expression: '{DCF模型!利润表!营业收入}',
            modifier: '+',
        }),
        defs.Row('营业税费', {
            expression: '{DCF模型!利润表!营业税费}',
            modifier: '--',
        }),
        defs.Row('应收账款增加', {
            expression: '{细项分解!营运资金!应收账款}-{细项分解!营运资金!应收账款}.LAG(1Y)',
            modifier: '--',
        }),
        defs.Row('间接法经营活动现金流入', {
            expression: '{营业收入}-{营业税费}-{应收账款增加}',
            modifier: '++',
        }),
        defs.Row('营业成本', {
            expression: '{DCF模型!利润表!营业成本}',
            modifier: '--',
        }),
        defs.Row('营业费用', {
            expression: '{DCF模型!利润表!营业费用}',
            modifier: '--',
        }),
        defs.Row('所得税', {
            expression: '{DCF模型!利润表!所得税}',
            modifier: '--',
        }),
        defs.Row('存货增加', {
            expression: '{细项分解!营运资金!存货}-{细项分解!营运资金!存货}.lag(1Y)',
            modifier: '--',
        }),
        defs.Row('折旧', {
            expression: '{细项分解!固定资产!折旧}',
            modifier: '--',
        }),
        defs.Row('应付账款增加', {
            expression: '{细项分解!营运资金!应付账款}-{细项分解!营运资金!应付账款}.lag(1Y)',
            modifier: '--',
        }),
        defs.Row('间接法经营活动现金流出', {
            expression: '{营业成本}+{营业费用}+{所得税}+{存货增加}-{折旧}-{应付账款增加}',
            modifier: '++',
        }),
        defs.Row('间接法计算误差', {
            slice_exprs: [
                defs.Slice('hist', '{间接法经营活动现金流入} -{间接法经营活动现金流出}-{Data Prepare!Data Prepare!经营活动现金流量}[hist]'),
                defs.Slice('proj', '0'),
            ],
        }),
        defs.Row('经营活动现金流入', {
            expression: '{细项分解!经营活动现金流量!间接法经营活动现金流入}-{细项分解!经营活动现金流量!间接法计算误差}',
            modifier: '++',
        }),
        defs.Row('经营活动现金流出', {
            expression: '{间接法经营活动现金流出}',
            modifier: '++',
        }),
    ],
});

local table4 = defs.Table('固定资产', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('固定资产净值', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!固定资产}'),
                defs.Slice('proj', '{细项分解!固定资产!固定资产净值}.LAG(1Y)-{细项分解!固定资产!折旧}+{细项分解!固定资产!新增或出售固定资产}'),
            ],
        }),
        defs.Row('折旧', {
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!固定资产!折旧}[hist].AVERAGE()'),
            ],
            sources: [0.01, 0.01, 0.01, 0.01, 0.01, null, null, null, null, null, null],
        }),
        defs.Row('%前一年固定资产', {
            modifier: '--',
            labels: ['折旧'],
            slice_exprs: [
                defs.Slice('hist', '{细项分解!固定资产!折旧}/{细项分解!固定资产!固定资产净值}.LAG(1Y)'),
                defs.Slice('proj', '{细项分解!固定资产!折旧}/{细项分解!固定资产!固定资产净值}.LAG(1Y)'),
            ],
        }),
        defs.Row('新增或出售固定资产', {
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!新增或出售固定资产}'),
                defs.Slice('proj', '{细项分解!固定资产!新增或出售固定资产}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('%前一年固定资产净值', {
            labels: ['新增或出售固定资产'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{细项分解!固定资产!新增或出售固定资产}/{细项分解!固定资产!固定资产净值}.LAG(1Y)'),
                defs.Slice('proj', '{细项分解!固定资产!新增或出售固定资产}/{细项分解!固定资产!固定资产净值}.LAG(1Y)'),
            ],
        }),
    ],
});

local table3 = defs.Table('营运资金', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('应收账款', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动资产小计!应收账款}'),
                defs.Slice('proj', '{DCF模型!利润表!营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            modifier: '-',
            labels: ['应收账款'],
            slice_exprs: [
                defs.Slice('hist', '{细项分解!营运资金!应收账款}/{DCF模型!利润表!营业收入}'),
                defs.Slice('proj', '{%营业收入@1}[hist].AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('存货', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动资产小计!存货}'),
                defs.Slice('proj', '{DCF模型!利润表!营业收入}*{%营业收入@2}'),
            ],
        }),
        defs.Row('%营业收入', {
            modifier: '-',
            labels: ['存货'],
            slice_exprs: [
                defs.Slice('hist', '{细项分解!营运资金!存货}/{DCF模型!利润表!营业收入}'),
                defs.Slice('proj', '{%营业收入@2}[hist].AVERAGE()'),
            ],
            alias: '2',
        }),
        defs.Row('应付账款', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动负债合计!应付账款}'),
                defs.Slice('proj', '{DCF模型!利润表!营业成本}*{%营业成本}'),
            ],
        }),
        defs.Row('%营业成本', {
            modifier: '-',
            labels: ['应付账款'],
            slice_exprs: [
                defs.Slice('hist', '{细项分解!营运资金!应付账款}/{DCF模型!利润表!营业成本}'),
                defs.Slice('proj', '{%营业成本}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('营运资金总额', {
            expression: '{细项分解!营运资金!应收账款}+{细项分解!营运资金!存货}-{细项分解!营运资金!应付账款}',
            modifier: '+',
        }),
    ],
});

local table2 = defs.Table('融资', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('短期借款净增加', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动负债合计!短期借款} - {DCF模型!资产负债表!流动负债合计!短期借款}.lag(1Y)'),
                defs.Slice('proj', '{短期借款净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('短期借款', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!流动负债合计!短期借款}'),
                defs.Slice('proj', '{细项分解!融资!短期借款}.LAG(1Y)+{短期借款净增加}'),
            ],
        }),
        defs.Row('长期借款净增加', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动负债合计!长期借款} - {DCF模型!资产负债表!非流动负债合计!长期借款}.lag(1Y)'),
                defs.Slice('proj', '{长期借款净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('长期借款', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动负债合计!长期借款}'),
                defs.Slice('proj', '{细项分解!融资!长期借款}.LAG(1Y)+{长期借款净增加}'),
            ],
        }),
        defs.Row('借款净增加', {
            expression: '{短期借款净增加}+{长期借款净增加}',
            modifier: '++',
        }),
        defs.Row('股权融资', {
            modifier: '+',
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!现金流量表!股权融资}'),
                defs.Slice('proj', '{假设!投融资假设!股权融资}'),
            ],
        }),
        defs.Row('股息支付', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!现金流量表!已付股息}'),
                defs.Slice('proj', '{细项分解!融资!股息支付}[hist].average()'),
            ],
        }),
        defs.Row('维持现金', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '0'),
                defs.Slice('proj', '{假设!资产负债表假设!维持现金}'),
            ],
        }),
        defs.Row('现金缺口', {
            expression: 'MAX({维持现金} - {DCF模型!现金流量表!年末现金及现金等价物余额}, 0)',
            modifier: '--',
        }),
    ],
});

local table1 = defs.Table('CAPEX', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'last'] }),
        defs.Col('2019', { labels: ['proj'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj'] }),
        defs.Col('2024', { labels: ['proj', 'end'] }),
        defs.Row('新增或出售固定资产', {
            expression: '{细项分解!固定资产!新增或出售固定资产}',
        }),
        defs.Row('无形资产净增加', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!无形资产及商誉} - {DCF模型!资产负债表!非流动资产小计!无形资产及商誉}.lag(1Y)'),
                defs.Slice('proj', '{无形资产净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('无形资产', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!无形资产及商誉}'),
                defs.Slice('proj', '{细项分解!CAPEX!无形资产}.LAG(1Y)+{无形资产净增加}'),
            ],
        }),
        defs.Row('其他非流动资产净增加', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!其他非流动资产} - {DCF模型!资产负债表!非流动资产小计!其他非流动资产}.lag(1Y)'),
                defs.Slice('proj', '{其他非流动资产净增加}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他非流动资产', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!资产负债表!非流动资产小计!其他非流动资产}[hist]'),
                defs.Slice('proj', '{细项分解!CAPEX!其他非流动资产}.LAG(1Y)+{其他非流动资产净增加}'),
            ],
        }),
        defs.Row('CAPEX', {
            expression: '{新增或出售固定资产}+{其他非流动资产净增加}+{杂项!非金融投资净增加}',
            modifier: '++',
        }),
        defs.Row('投资活动净新增投资', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!现金流量表!净新增投资}'),
                defs.Slice('proj', '{杂项!金融资产净增加}+{杂项!非金融投资净增加}+{其他非流动资产净增加}+{杂项!其他流动资产净增加}+{无形资产净增加}'),
            ],
        }),
    ],
});


local sheet = defs.Sheet('细项分解', {
    subnodes: [
        defs.Title('CAPEX', {}),
        table1,
        defs.Title('融资', {}),
        table2,
        defs.Title('营运资金', {}),
        table3,
        defs.Title('固定资产', {}),
        table4,
        defs.Title('经营活动现金流量间接法调整', {}),
        table5,
        defs.Title('杂项', {}),
        table6,
    ],
});

sheet
