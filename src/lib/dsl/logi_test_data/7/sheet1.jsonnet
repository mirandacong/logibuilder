local defs = import '../defs.jsonnet';

local row_block1 = defs.RowBlock('流动资产小计', {
    subnodes: [
        defs.Row('现金及现金等价物', {
            sources: [12.18, 10.21, 5.71, 13.99, 2.82, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{现金流量表!年末现金及现金等价物余额}'),
            ],
        }),
        defs.Row('应收账款', {
            sources: [0.0107, 0.00106, 0.38501, 0.91373, 3.65, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!营运资金!应收账款}'),
            ],
        }),
        defs.Row('存货', {
            sources: [0, 0, 1.52, 4.42, 5.96, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!营运资金!存货}'),
            ],
        }),
        defs.Row('金融资产', {
            sources: [0, 0, 0.103, 0.041, 17.37, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!杂项!金融资产}'),
            ],
        }),
        defs.Row('其他流动资产', {
            modifier: '---',
            sources: [0.14994, 0.14824, 0.39835, 0.78924, 3.23, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!杂项!其他流动资产}'),
            ],
        }),
    ],
});

local row_block2 = defs.RowBlock('非流动资产小计', {
    subnodes: [
        defs.Row('固定资产', {
            sources: [0.0418, 0.06546, 0.05065, 0.06274, 0.0888, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!固定资产!固定资产净值}'),
            ],
        }),
        defs.Row('投资', {
            sources: [1.71, 1.96, 5.67, 10.14, 26.03, null, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!杂项!非金融投资}'),
            ],
        }),
        defs.Row('无形资产及商誉', {
            sources: [0, 0, 0.19123, 0.19123, 0.27006, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!CAPEX!无形资产}'),
            ],
        }),
        defs.Row('其他非流动资产', {
            modifier: '---',
            sources: [0, 1.1, 2.77, 0.55921, 0.39372, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!CAPEX!其他非流动资产}'),
            ],
        }),
    ],
});

local row_block3 = defs.RowBlock('流动负债合计', {
    subnodes: [
        defs.Row('应付账款', {
            sources: [0.03653, 0.03751, 1.26, 3.23, 9.03, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!营运资金!应付账款}'),
            ],
        }),
        defs.Row('短期借款', {
            sources: [0, 0, 0, 0, 17, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!融资!短期借款}'),
            ],
        }),
        defs.Row('其他短期负债', {
            modifier: '---',
            sources: [1.18, 1.82, 2.28, 2.57, 6.31, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!杂项!其他短期负债}'),
            ],
        }),
    ],
});

local row_block4 = defs.RowBlock('非流动负债合计', {
    subnodes: [
        defs.Row('长期借款', {
            sources: [0, 0, 2, 0, 0, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!融资!长期借款}'),
            ],
        }),
        defs.Row('其他非流动负债', {
            modifier: '---',
            sources: [0.19706, 0.07019, 0.06566, 0.07682, 0.11677, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!杂项!其他非流动负债}'),
            ],
        }),

    ],
});

local table4 = defs.Table('FCF', {
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
        defs.Row('EBIT', {
            expression: '{利润表!营业利润}',
        }),
        defs.Row('非付现成本', {
            expression: '{细项分解!固定资产!折旧}',
        }),
        defs.Row('营运资金变化', {
            expression: '{细项分解!营运资金!营运资金总额}-{细项分解!营运资金!营运资金总额}.lag(1Y)',
        }),
        defs.Row('CAPEX', {
            expression: '{细项分解!CAPEX!CAPEX}',
        }),
        defs.Row('FCF', {
            expression: '{EBIT}-{DCF模型!利润表!所得税}+{非付现成本}-{营运资金变化}-{CAPEX}',
        }),
        defs.Row('永续增长率', {
            expression: '{假设!DCF假设!永续增长率}',
            is_def_scalar: true,
        }),
        defs.Row('WACC', {
            expression: '{假设!DCF假设!WACC}',
            is_def_scalar: true,
        }),
        defs.Row('EV', {
            is_def_scalar: true,
            expression: 'npv({WACC}, {FCF}) + ({FCF}[end] * (1 + {永续增长率} ) / ((power(1 + {WACC}, 6)) * ({WACC} - {永续增长率})))',
            modifier: '++',
        }),
        defs.Row('Equity Value', {
            is_def_scalar: true,
            expression: '{EV}-{资产负债表!其中 有息负债}[last]',
            modifier: '--',
        }),
        defs.Row('Share No.', {
            is_def_scalar: true,
            expression: '',
            modifier: '--',
            sources: [120.28, null, null, null, null, null, null, null, null, null, null],
        }),
        defs.Row('Share Price', {
            expression: '{Equity Value}/{Share No.}',
            is_def_scalar: true,
            modifier: '+',
        }),
    ],
});

local table3 = defs.Table('现金流量表', {
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
        defs.Row('经营活动现金净流量', {
            expression: '{经营活动现金流入}-{经营活动现金流出}',
            modifier: '++',
        }),
        defs.Row('经营活动现金流入', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!经营活动现金流入}'),
                defs.Slice('proj', '{细项分解!经营活动现金流量!间接法经营活动现金流入}'),
            ],
        }),
        defs.Row('经营活动现金流出', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!经营活动现金流出}'),
                defs.Slice('proj', '{细项分解!经营活动现金流量!经营活动现金流出}'),
            ],
        }),
        defs.Row('投资活动现金净流量', {
            expression: '-{新增或出售固定资产}-{净新增投资}+{其他投资活动现金流量}',
            modifier: '++',
        }),
        defs.Row('新增或出售固定资产', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!新增或出售固定资产}'),
                defs.Slice('proj', '{细项分解!固定资产!新增或出售固定资产}'),
            ],
        }),
        defs.Row('净新增投资', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!净新增投资}'),
                defs.Slice('proj', '{细项分解!CAPEX!投资活动净新增投资}'),
            ],
        }),
        defs.Row('其他投资活动现金流量', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!其他投资活动现金流量}'),
                defs.Slice('proj', '0'),
            ],

        }),
        defs.Row('筹资活动现金净流量', {
            expression: '{借款净增加}+{股权融资}+{利息净收入}-{DCF模型!现金流量表!已付股息}+{收到的其他与筹资活动有关的现金}',
            modifier: '++',
        }),
        defs.Row('借款净增加', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!贷款净增加}'),
                defs.Slice('proj', '{细项分解!融资!借款净增加}'),
            ],
        }),
        defs.Row('股权融资', {
            modifier: '--',
            sources: [10.61, 0, 0.0017, 14.69, 0.52979, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{假设!投融资假设!股权融资}'),
            ],
        }),
        defs.Row('利息净收入', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!利息净收入}'),
                defs.Slice('proj', '- {利润表!财务费用}'),
            ],
        }),
        defs.Row('已付股息', {
            modifier: '--',
            sources: [0, 0, 0, 0, 0, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{细项分解!融资!股息支付}'),
            ],
        }),
        defs.Row('收到的其他与筹资活动有关的现金', {
            modifier: '--',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!收到其他与筹资活动相关的现金}'),
                defs.Slice('proj', '{细项分解!杂项!其他债务净增加}'),
            ],
        }),
        defs.Row('现金及现金等价物增加或减少', {
            expression: '{经营活动现金净流量}+{投资活动现金净流量}+{筹资活动现金净流量}',
            modifier: '++',
        }),
        defs.Row('年初现金及现金等价物余额', {
            expression: '{资产负债表!流动资产小计!现金及现金等价物}.LAG(1Y)',
        }),
        defs.Row('汇率变化对现金及现金等价物的影响及其他现金流量', {
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!汇率变化对现金及现金等价物的影响及其他现金流量}'),
                defs.Slice('proj', '{利润表!非经常性损益}'),
            ],
        }),
        defs.Row('年末现金及现金等价物余额', {
            expression: '{年初现金及现金等价物余额}+{现金及现金等价物增加或减少}+{汇率变化对现金及现金等价物的影响及其他现金流量}',
            modifier: '--',
        }),
    ],
});

local table2 = defs.Table('资产负债表', {
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
        defs.Row('总资产', {
            expression: '{流动资产小计}+{非流动资产小计}',
            modifier: '+',
        }),
        row_block1,
        defs.Row('流动资产小计', {
            expression: 'SUM({流动资产小计!现金及现金等价物},{流动资产小计!应收账款},{流动资产小计!存货},{流动资产小计!金融资产},{流动资产小计!其他流动资产})',
            modifier: '+',
        }),
        row_block2,
        defs.Row('非流动资产小计', {
            expression: 'SUM({非流动资产小计!固定资产},{非流动资产小计!投资},{非流动资产小计!无形资产及商誉},{非流动资产小计!其他非流动资产})',
            modifier: '+',
        }),
        defs.Row('总负债', {
            expression: '{流动负债合计}+{非流动负债合计}',
            modifier: '++',
        }),
        defs.Row('其中 有息负债', {
            expression: '{流动负债合计!短期借款}+{非流动负债合计!长期借款}',
        }),
        row_block3,
        defs.Row('流动负债合计', {
            expression: 'SUM({流动负债合计!应付账款},{流动负债合计!短期借款},{流动负债合计!其他短期负债})',
            modifier: '+',
        }),
        row_block4,
        defs.Row('非流动负债合计', {
            expression: 'SUM({非流动负债合计!长期借款},{非流动负债合计!其他非流动负债})',
            modifier: '+',
        }),
        defs.Row('所有者权益合计', {
            modifier: '++',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!所有者权益合计}'),
                defs.Slice('proj', '{所有者权益合计}.LAG(1Y)+{利润表!净利润}+{细项分解!融资!股权融资} - {现金流量表!已付股息}'),
            ],
        }),
        defs.Row('check', {
            expression: '{总资产}-{总负债}-{所有者权益合计}',
            modifier: '+++',
        }),
    ],
});

local table1 = defs.Table('利润表', {
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
            modifier: '++',
            sources: [0.29744, 0.56595, 4.75, 24.43, 50.96, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{营业收入}.LAG(1Y)*(1+{DCF模型!利润表!增长率})'),
            ],
        }),
        defs.Row('增长率', {
            labels: ['营业收入'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{营业收入}/{营业收入}.LAG(1)-1'),
                defs.Slice('proj', '{假设!利润表假设!营业收入增长率}'),
            ],
        }),
        defs.Row('营业税费', {
            sources: [0, 0, 0, 0, 0, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['营业税费'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{营业税费}/{营业收入}'),
                defs.Slice('proj', '{%营业收入@1}.AVERAGE()'),
            ],
            alias: '1',
        }),
        defs.Row('营业成本', {
            modifier: '---',
            sources: [0.1378, 0.18602, 2.88, 17.9, 37.65, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{营业收入}*{%营业收入@2}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['营业成本'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{营业成本}/{营业收入}'),
                defs.Slice('proj', '{假设!利润表假设!营业成本%营业收入}'),
            ],
            alias: '2',
        }),
        defs.Row('毛利', {
            expression: '{营业收入}-{营业税费}-{营业成本}',
            modifier: '+',
        }),
        defs.Row('营业费用', {
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!营业费用}'),
                defs.Slice('proj', '{营业收入}*{%营业收入@3}'),
            ],
        }),
        defs.Row('%营业收入', {
            labels: ['营业费用'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{营业费用}/{营业收入}'),
                defs.Slice('proj', '{假设!利润表假设!营业费用%营业收入}'),
            ],
            alias: '3',
        }),
        defs.Row('营业利润', {
            expression: '{毛利}-{营业费用}',
            modifier: '+',
        }),
        defs.Row('财务费用', {
            sources: [0, 0, 0.06886, 0.10126, 0.27966, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{财务费用}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('%有息负债', {
            labels: ['财务费用'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{财务费用}/{资产负债表!其中 有息负债}'),
                defs.Slice('proj', '{财务费用}/{资产负债表!其中 有息负债}'),
            ],
        }),
        defs.Row('非经常性损益', {
            modifier: '---',
            slice_exprs: [
                defs.Slice('hist', '{Data Prepare!Data Prepare!非经常性损益}'),
                defs.Slice('proj', '{非经常性损益}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('税前利润', {
            expression: '{利润表!营业利润}-{财务费用}+{非经常性损益}',
            modifier: '+',
        }),
        defs.Row('所得税', {
            modifier: '---',
            sources: [0.30934, 0.01851, 0.1554, 0.13889, 0.30934, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{税前利润}*{有效税率}'),
            ],
        }),
        defs.Row('有效税率', {
            modifier: '-',
            sources: [null, null, null, null, null, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
            slice_exprs: [
                defs.Slice('hist', '{所得税}/{税前利润}'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('净利润', {
            expression: '{税前利润}-{所得税}',
            modifier: '++',
        }),
        defs.Row('归属于股东的净利润', {
            expression: '{净利润}-{少数股东权益}',
        }),
        defs.Row('少数股东权益', {
            modifier: '--',
            sources: [-0.02884, -0.0736, -0.01027, -0.0206, -0.09815, null, null, null, null, null, null],
            slice_exprs: [
                defs.Slice('hist', ''),
                defs.Slice('proj', '{净利润}*{%净利润}'),
            ],
        }),
        defs.Row('%净利润', {
            labels: ['少数股东权益'],
            modifier: '-',
            slice_exprs: [
                defs.Slice('hist', '{少数股东权益}/{净利润}'),
                defs.Slice('proj', '{%净利润}.AVERAGE()'),
            ],
        }),
    ],
});

local sheet = defs.Sheet(
    'DCF模型', {
        subnodes: [
            defs.Title('DCF估值模型', {}),
            defs.Title('利润表', {}),
            table1,
            defs.Title('资产负债表', {}),
            table2,
            defs.Title('现金流量表', {}),
            table3,
            defs.Title('FCF', {}),
            table4,
        ],
    }
);

sheet
