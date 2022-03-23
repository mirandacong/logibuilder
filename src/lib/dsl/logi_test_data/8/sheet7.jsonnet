local defs = import '../defs.jsonnet';

local table1 = defs.Table('股东权益变动表', {
    subnodes: [
        defs.Row('股东权益合计', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!所有者权益合计}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：股本} + {融资计划!股东权益变动表!其中：各项公积} + {融资计划!股东权益变动表!其中：未分配利润}'),
            ],
        }),
        defs.Row('其中：股本', {
            modifier: '--',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!股本}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：股本}.lag(1)'),
            ],
        }),
        defs.Row('增发股票数', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!股本}.diff(1)'),
                defs.Slice('proj', '0'),
            ],
        }),
        defs.Row('其中：各项公积', {
            modifier: '--',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!各项公积}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：各项公积}.lag(1) + {融资计划!股东权益变动表!股权融资净额} - {增发股票数}'),
            ],
        }),
        defs.Row('其中：未分配利润', {
            modifier: '--',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!未分配利润}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!其中：未分配利润}.lag(1) + {股东权益变动表!净利润}'),
            ],
        }),
        defs.Row('少数股东权益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其中：少数股东权益}'),
                defs.Slice('proj', '{融资计划!股东权益变动表!股东权益合计} * {少数股东权益占比}'),
            ],
        }),
        defs.Row('少数股东权益占比', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{融资计划!股东权益变动表!少数股东权益}/{融资计划!股东权益变动表!股东权益合计}'),
                defs.Slice('proj', '{少数股东权益占比}[hist].average()'),
            ],
        }),
        defs.Row('净利润', {
            expression: '{FS-利润表!利润表!净利润}',
            is_def_scalar: false,
        }),
        defs.Row('股权融资净额', {
            modifier: '++',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{融资计划!股东权益变动表!股东权益合计}.diff(1) - {股东权益变动表!净利润}'),
                defs.Slice('proj', '0'),
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

local table2 = defs.Table('债权融资', {
    subnodes: [
        defs.Row('现金和现金等价物', {
            expression: '{FS-资产负债表!资产负债表!现金及现金等价物}',
            is_def_scalar: false,
        }),
        defs.Row('营业总收入', {
            modifier: '--',
            expression: '{FS-利润表!利润表!营业总收入}',
            is_def_scalar: false,
        }),
        defs.Row('现金和现金等价物占收入比', {
            modifier: '-',
            expression: '{现金和现金等价物}/{营业总收入}',
            is_def_scalar: false,
        }),
        defs.Row('维持现金占收入比', {
            modifier: '-',
            expression: '{现金和现金等价物占收入比}[hist].average() * 0.5',
            is_def_scalar: true,
        }),
        defs.Row('最高现金占收入比', {
            modifier: '-',
            expression: '{现金和现金等价物占收入比}[hist].average() * 2',
            is_def_scalar: true,
        }),
        defs.Row('维持现金', {
            modifier: '--',
            expression: '{营业总收入} * {维持现金占收入比}',
            is_def_scalar: false,
        }),
        defs.Row('最高现金', {
            modifier: '--',
            expression: '{营业总收入} * {最高现金占收入比}',
            is_def_scalar: false,
        }),
        defs.Row('为保持维持现金而新增借款', {
            expression: 'max({维持现金} - {FS-现金流量表!现金流量表!期末现金和现金等价物余额（调整前）}, 0)',
            is_def_scalar: false,
        }),
        defs.Row('超过最高现金而偿还借款', {
            expression: 'min(max(- {最高现金} + {FS-现金流量表!现金流量表!期末现金和现金等价物余额（调整前）}, 0), {资本性负债（调整前）}.lag(1))',
            is_def_scalar: false,
        }),
        defs.Row('短期借款（调整前）', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!短期借款}'),
                defs.Slice('proj', '{融资计划!债权融资!短期借款}[hist].average()'),
            ],
        }),
        defs.Row('短期借款', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!短期借款}'),
                defs.Slice('proj', '{短期借款（调整前）}+{为保持维持现金而新增借款}'),
            ],
        }),
        defs.Row('资本性负债（调整前）', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!资本性负债}'),
                defs.Slice('proj', '{FS-资产负债表!资产负债表!资本性负债}[recent]'),
            ],
        }),
        defs.Row('资本性负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!资本性负债}[hist]'),
                defs.Slice('proj', '{融资计划!债权融资!资本性负债}.lag(1)-{超过最高现金而偿还借款}'),
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
    '融资计划', {
        subnodes: [
            table1,
            table2,
        ],
    }
);

sheet
