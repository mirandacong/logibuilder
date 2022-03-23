local defs = import '../defs.jsonnet';

local table1 = defs.Table('资产负债表', {
    subnodes: [
        defs.Row('现金及现金等价物', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!货币资金}'),
                defs.Slice('proj', '{FS-现金流量表!现金流量表!期末现金和现金等价物余额}'),
            ],
        }),
        defs.Row('短期投资', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!交易性金融资产}'),
                defs.Slice('proj', '{其他科目预测!投资!短期投资}'),
            ],
        }),
        defs.Row('现金和短期投资合计', {
            modifier: '--',
            expression: '{FS-资产负债表!资产负债表!现金及现金等价物} + {短期投资}',
            is_def_scalar: false,
        }),
        defs.Row('应收账款', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!应收账款}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!应收帐款}'),
            ],
        }),
        defs.Row('其他应收款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!应收票据} + {data!balance_cn.csv!应收利息} + {data!balance_cn.csv!应收股利} + {data!balance_cn.csv!其他应收款}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!其他应收款项}'),
            ],
        }),
        defs.Row('应收款项合计', {
            expression: '{应收账款}+{其他应收款项}',
            is_def_scalar: false,
        }),
        defs.Row('存货', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!存货}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!存货}'),
            ],
        }),
        defs.Row('预付款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!预付款项}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!预付款项}'),
            ],
        }),
        defs.Row('其他流动资产', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!一年内到期的非流动资产} + {data!balance_cn.csv!其他流动资产杂项}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他流动资产}'),
            ],
        }),
        defs.Row('流动资产合计', {
            modifier: '+',
            expression: 'sum({现金和短期投资合计}, {应收款项合计}, {存货}, {预付款项}, {其他流动资产})',
            is_def_scalar: false,
        }),
        defs.Row('PP&E', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!固定资产} + {data!balance_cn.csv!生产性生物资产} + {data!balance_cn.csv!油气资产}'),
                defs.Slice('proj', '{CAPEX!CAPEX!PP&E}'),
            ],
        }),
        defs.Row('无形资产和待摊费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!无形资产} + {data!balance_cn.csv!长期待摊费用}'),
                defs.Slice('proj', '{CAPEX!CAPEX!无形资产和待摊费用}'),
            ],
        }),
        defs.Row('长期投资', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!可供出售金融资产}+{data!balance_cn.csv!持有至到期投资}+{data!balance_cn.csv!长期股权投资}+{data!balance_cn.csv!投资性房地产}'),
                defs.Slice('proj', '{其他科目预测!投资!长期投资}'),
            ],
        }),
        defs.Row('其他非流动资产', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!在建工程} + {data!balance_cn.csv!长期应收款} + {data!balance_cn.csv!工程物资} + {data!balance_cn.csv!固定资产清理} + {data!balance_cn.csv!商誉} + {data!balance_cn.csv!开发支出} + {data!balance_cn.csv!递延所得税资产} + {data!balance_cn.csv!其他非流动资产杂项}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他非流动资产}'),
            ],
        }),
        defs.Row('非流动资产合计', {
            modifier: '+',
            expression: 'SUM({PP&E}, {无形资产和待摊费用}, {长期投资}, {其他非流动资产})',
            is_def_scalar: false,
        }),
        defs.Row('总资产', {
            modifier: '++',
            expression: '{流动资产合计}+{非流动资产合计}',
            is_def_scalar: false,
        }),
        defs.Row('应付账款', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!应付账款}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!应付款项}'),
            ],
        }),
        defs.Row('其他应付款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!应付票据}+{data!balance_cn.csv!应付职工薪酬}+{data!balance_cn.csv!应交税费}+{data!balance_cn.csv!应付利息}+{data!balance_cn.csv!应付股利}+{data!balance_cn.csv!其他应付款} + {data!balance_cn.csv!应付关联公司款}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!其他应付款项}'),
            ],
        }),
        defs.Row('短期借款', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!交易性金融负债}+{data!balance_cn.csv!一年内到期的非流动负债}'),
                defs.Slice('proj', '{融资计划!债权融资!短期借款}'),
            ],
        }),
        defs.Row('其他流动负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!预收款项}+{data!balance_cn.csv!其他流动负债杂项}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他流动负债}'),
            ],
        }),
        defs.Row('流动负债合计', {
            modifier: '+',
            expression: 'SUM({应付账款}, {其他应付款项}, {短期借款}, {其他流动负债})',
            is_def_scalar: false,
        }),
        defs.Row('资本性负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!长期借款}+{data!balance_cn.csv!应付债券} + {data!balance_cn.csv!长期应付款}'),
                defs.Slice('proj', '{融资计划!债权融资!资本性负债}'),
            ],
        }),
        defs.Row('其他非流动负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!专项应付款} + {data!balance_cn.csv!预计负债} + {data!balance_cn.csv!递延所得税负债} + {data!balance_cn.csv!其他非流动负债杂项}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他非流动负债}'),
            ],
        }),
        defs.Row('非流动负债合计', {
            modifier: '+',
            expression: 'SUM({资本性负债}, {其他非流动负债})',
            is_def_scalar: false,
        }),
        defs.Row('负债合计', {
            modifier: '++',
            expression: '{流动负债合计} + {非流动负债合计}',
            is_def_scalar: false,
        }),
        defs.Row('股本', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!实收资本（或股本）} - {data!balance_cn.csv!库存股}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：股本}'),
            ],
        }),
        defs.Row('各项公积', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!资本公积}+{data!balance_cn.csv!专项储备} + {data!balance_cn.csv!盈余公积} + {data!balance_cn.csv!其他应计入所有者权益的杂项} - {data!balance_cn.csv!资产负债表配平误差项}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：各项公积}'),
            ],
        }),
        defs.Row('未分配利润', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!未分配利润}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：未分配利润}'),
            ],
        }),
        defs.Row('所有者权益合计', {
            modifier: '++',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!股本} + {FS-资产负债表!资产负债表!各项公积} + {未分配利润}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!股东权益合计}'),
            ],
        }),
        defs.Row('其中：少数股东权益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!balance_cn.csv!少数股东权益}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!少数股东权益}'),
            ],
        }),
        defs.Row('其中：归属于母公司所有者权益', {
            expression: '{FS-资产负债表!资产负债表!所有者权益合计} - {FS-资产负债表!资产负债表!其中：少数股东权益}',
            is_def_scalar: false,
        }),
        defs.Row('负债和所有者权益合计', {
            modifier: '+',
            expression: '{负债合计} + {FS-资产负债表!资产负债表!所有者权益合计}',
            is_def_scalar: false,
        }),
        defs.Row('checker', {
            expression: '{总资产}-{负债和所有者权益合计}',
            is_def_scalar: false,
        }),
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist', 'recent'] }),
        defs.Col('2019', { labels: ['proj', 'proj_start'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
        defs.Col('2022', { labels: ['proj'] }),
        defs.Col('2023', { labels: ['proj', 'final'] }),
    ],
});

local sheet = defs.Sheet(
    'FS-资产负债表', {
        subnodes: [
            table1,
        ],
    }
);

sheet
