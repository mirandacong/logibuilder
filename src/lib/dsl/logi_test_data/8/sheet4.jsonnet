local defs = import '../defs.jsonnet';

local table1 = defs.Table('现金流量表', {
    subnodes: [
        defs.Row('经营活动现金流量', {
            is_def_scalar: false,
            modifier: '---',
        }),
        defs.Row('净利润', {
            expression: '{FS-利润表!利润表!净利润}',
            is_def_scalar: false,
        }),
        defs.Row('(加)折旧摊销', {
            expression: '{CAPEX!CAPEX!折旧}+{CAPEX!CAPEX!摊销}',
            is_def_scalar: false,
        }),
        defs.Row('(加)财务费用', {
            expression: '{FS-利润表!利润表!财务费用}',
            is_def_scalar: false,
        }),
        defs.Row('(减)营运资金增加', {
            expression: '-({FS-资产负债表!资产负债表!应收账款}+{FS-资产负债表!资产负债表!存货}+{FS-资产负债表!资产负债表!预付款项}+{FS-资产负债表!资产负债表!其他应收款项}-{FS-资产负债表!资产负债表!应付账款}-{FS-资产负债表!资产负债表!其他应付款项}).diff(1)',
            is_def_scalar: false,
        }),
        defs.Row('(减)其他经营性资产增加', {
            expression: '-({FS-资产负债表!资产负债表!其他流动资产}+{FS-资产负债表!资产负债表!其他非流动资产}).diff(1)',
            is_def_scalar: false,
        }),
        defs.Row('(加)其他经营性负债增加', {
            expression: '({FS-资产负债表!资产负债表!其他流动负债}+{FS-资产负债表!资产负债表!其他非流动负债}).diff(1)',
            is_def_scalar: false,
        }),
        defs.Row('经营活动现金流量净值', {
            expression: 'SUM({现金流量表!净利润},{FS-现金流量表!现金流量表!(加)折旧摊销},{(加)财务费用},{FS-现金流量表!现金流量表!(减)营运资金增加},{(减)其他经营性资产增加},{(加)其他经营性负债增加})',
            is_def_scalar: false,
            modifier: '+',
        }),
        defs.Row('投资活动现金流量', {
            is_def_scalar: false,
            modifier: '---',
        }),
        defs.Row('（减）CAPEX', {
            expression: '-{CAPEX!CAPEX!CAPEX} ',
            is_def_scalar: false,
        }),
        defs.Row('（减）其他投资增加', {
            expression: '-({FS-资产负债表!资产负债表!短期投资} + {FS-资产负债表!资产负债表!长期投资}).diff(1) ',
            is_def_scalar: false,
        }),
        defs.Row('投资活动现金流量净值', {
            expression: 'SUM({（减）CAPEX}, {（减）其他投资增加})',
            is_def_scalar: false,
            modifier: '+',
        }),
        defs.Row('筹资活动现金流量', {
            is_def_scalar: false,
            modifier: '---',
        }),
        defs.Row('（加）借款净增加', {
            expression: '({FS-资产负债表!资产负债表!短期借款} + {FS-资产负债表!资产负债表!资本性负债}).diff(1)',
            is_def_scalar: false,
        }),
        defs.Row('（减）利息支出', {
            expression: '-{FS-利润表!利润表!财务费用}',
            is_def_scalar: false,
        }),
        defs.Row('（加）股权融资和股息支付', {
            expression: '{融资计划!股东权益变动表!股权融资净额}',
            is_def_scalar: false,
        }),
        defs.Row('筹资活动现金流量净值', {
            expression: 'SUM({（加）借款净增加},{（减）利息支出},{（加）股权融资和股息支付})',
            is_def_scalar: false,
            modifier: '+',
        }),
        defs.Row('现金和现金等价物的变化', {
            expression: '{经营活动现金流量净值}+{投资活动现金流量净值}+{筹资活动现金流量净值}',
            is_def_scalar: false,
            modifier: '++',
        }),
        defs.Row('现金和现金等价物的变化（调整前）', {
            expression: '{经营活动现金流量净值}+{投资活动现金流量净值}+SUM({（减）利息支出},{（加）股权融资和股息支付})+({融资计划!债权融资!短期借款（调整前）}+{融资计划!债权融资!资本性负债（调整前）}).diff(1)',
            is_def_scalar: false,
        }),
        defs.Row('期初现金和现金等价物余额', {
            expression: '{FS-资产负债表!资产负债表!现金及现金等价物}.lag(1)',
            is_def_scalar: false,
        }),
        defs.Row('期末现金和现金等价物余额（调整前）', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!现金及现金等价物}'),
                defs.Slice('proj', '{期初现金和现金等价物余额}+{现金和现金等价物的变化（调整前）}'),
            ],
        }),
        defs.Row('期末现金和现金等价物余额', {
            expression: 'MIN(MAX({期末现金和现金等价物余额（调整前）}, {融资计划!债权融资!维持现金}), {融资计划!债权融资!最高现金})',
            is_def_scalar: false,
            modifier: '++',
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!现金及现金等价物}'),
                defs.Slice('proj', '{期初现金和现金等价物余额}+{现金和现金等价物的变化}'),
            ],
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
    'FS-现金流量表', {
        subnodes: [
            table1,
        ],
    }
);

sheet
