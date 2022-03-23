local defs = import '../defs.jsonnet';

local table1 = defs.Table('收入成本预测', {
    subnodes: [
        defs.Row('营业收入', {
            modifier: '--',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!营业收入}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!营业收入}.lag(1)*(1+{增长率@1})'),
            ],
        }),
        defs.Row('增长率', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['营业收入'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!营业收入}.growth(),0)'),
                defs.Slice('proj', 'MAX({增长率@1}[hist].average(), 0)+{收入增长率调整项}'),
            ],
            alias: '1',
        }),
        defs.Row('调整前增长率', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['营业收入'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!营业收入}.growth(),0)'),
                defs.Slice('proj', 'MAX({增长率@1}[hist].average(), 0)'),
            ],
        }),
        defs.Row('终期收入增长率', {
            modifier: '-',
            is_def_scalar: true,
            expression: '{DCF模型!企业价值!永续增长率}',
        }),
        defs.Row('终期收入增长率差异', {
            modifier: '-',
            is_def_scalar: true,
            expression: '{DCF模型!企业价值!永续增长率}-{调整前增长率}[final]',
        }),
        defs.Row('收入增长率调整项', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['营业收入'],
            slice_exprs: [
                defs.Slice('hist', '0'),
                defs.Slice('proj', '{收入增长率调整项}[proj].LINEAR(0, {收入成本预测!收入成本预测!终期收入增长率差异})'),
            ],
        }),
        defs.Row('其他业务收入', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!其他业务收入}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!其他业务收入}.LAG(1)*(1+{收入成本预测!增长率@2})'),
            ],
        }),
        defs.Row('增长率', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['其他业务收入'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!其他业务收入}.growth(),0)'),
                defs.Slice('proj', 'MAX({增长率@2}[hist].average(), 0)'),
            ],
            alias: '2',
        }),
        defs.Row('营业总收入', {
            expression: '{收入成本预测!收入成本预测!营业收入}+{收入成本预测!收入成本预测!其他业务收入}',
            is_def_scalar: false,
        }),
        defs.Row('营业成本', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!营业成本}'),
                defs.Slice('proj', '{营业总收入}*{%营业总收入@1}'),
            ],
        }),
        defs.Row('调整前成本率', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!营业成本}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', 'MAX({%营业总收入@1}[hist].average(), 0)'),
            ],
        }),
        defs.Row('%营业总收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['营业成本'],
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!营业成本}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', '{调整前成本率}+{营业成本率调整项}'),
            ],
            alias: '1',
        }),
        defs.Row('营业税金及附加', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!营业税金及附加}'),
                defs.Slice('proj', '{营业总收入}*{%营业总收入@2}'),
            ],
        }),
        defs.Row('%营业总收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['营业税金及附加'],
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!营业税金及附加}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', 'MAX({%营业总收入@2}[hist].average(), 0)'),
            ],
            alias: '2',
        }),
        defs.Row('销售费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!销售费用}'),
                defs.Slice('proj', '{营业总收入}*{%营业总收入@3}'),
            ],
        }),
        defs.Row('调整前销售费用率', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!销售费用}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', 'MAX({%营业总收入@3}[hist].AVERAGE(), 0)'),
            ],
        }),
        defs.Row('%营业总收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['销售费用'],
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!销售费用}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', '{调整前销售费用率}+{销售费用率调整项}'),
            ],
            alias: '3',
        }),
        defs.Row('管理费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!管理费用}'),
                defs.Slice('proj', '{营业总收入}*{%营业总收入@4}'),
            ],
        }),
        defs.Row('调整前管理费用率', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!管理费用}/{收入成本预测!收入成本预测!营业收入}'),
                defs.Slice('proj', 'MAX({%营业总收入@4}[hist].AVERAGE(), 0)'),
            ],
        }),
        defs.Row('%营业总收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['管理费用'],
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!管理费用}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', '{调整前管理费用率}+{管理费用率调整项}'),
            ],
            alias: '4',
        }),
        defs.Row('其他成本费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!其他成本费用}'),
                defs.Slice('proj', '{营业总收入}*{%营业总收入@5}'),
            ],
        }),
        defs.Row('%营业总收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['其他成本费用'],
            slice_exprs: [
                defs.Slice('hist', '{收入成本预测!收入成本预测!其他成本费用}/{收入成本预测!营业总收入}'),
                defs.Slice('proj', 'MAX({%营业总收入@5}[hist].AVERAGE(), 0)'),
            ],
            alias: '5',
        }),
        defs.Row('财务费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!财务费用}'),
                defs.Slice('proj', '{财务性负债}*{%财务性负债}'),
            ],
        }),
        defs.Row('财务性负债', {
            expression: '{FS-资产负债表!资产负债表!短期借款}+{FS-资产负债表!资产负债表!资本性负债}',
            is_def_scalar: false,
        }),
        defs.Row('%财务性负债', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['财务费用'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!财务费用}/{财务性负债}, 0)'),
                defs.Slice('proj', 'MIN(MAX({%财务性负债}[hist].average(), 0), 0.1)'),
            ],
        }),
        defs.Row('资产减值损失', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!资产减值损失}'),
                defs.Slice('proj', '{固定资产和无形资产}*{%固定资产和无形资产}'),
            ],
        }),
        defs.Row('固定资产和无形资产', {
            expression: '{FS-资产负债表!资产负债表!PP&E} + {FS-资产负债表!资产负债表!无形资产和待摊费用}',
            is_def_scalar: false,
        }),
        defs.Row('%固定资产和无形资产', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['资产减值损失'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!资产减值损失}/{固定资产和无形资产}, 0)'),
                defs.Slice('proj', 'MIN(MAX({%固定资产和无形资产}[hist].AVERAGE(), 0), 0.1)'),
            ],
        }),
        defs.Row('非经常性损益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!非经常性损益}'),
                defs.Slice('proj', '0'),
            ],
        }),
        defs.Row('税前利润', {
            expression: '{FS-利润表!利润表!税前利润}',
            is_def_scalar: false,
        }),
        defs.Row('所得税', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-利润表!利润表!所得税}'),
                defs.Slice('proj', '{收入成本预测!税前利润}*{收入成本预测!收入成本预测!有效税率}'),
            ],
        }),
        defs.Row('有效税率', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!所得税}/{收入成本预测!税前利润}, 0)'),
                defs.Slice('proj', 'MIN(MAX({收入成本预测!收入成本预测!有效税率}[hist].average(), 0), 0.25)'),
            ],
        }),
        defs.Row('净利润', {
            expression: '{收入成本预测!税前利润}-{收入成本预测!收入成本预测!所得税}',
            is_def_scalar: false,
        }),
        defs.Row('净利率', {
            expression: '{净利润}/{营业总收入}',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('proj', '{净利润}/{营业总收入}'),
            ],
        }),
        defs.Row('少数股东损益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('proj', '{净利润}*{少数股东损益占比}'),
            ],
        }),
        defs.Row('少数股东损益占比', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!收入成本预测!少数股东损益}/{收入成本预测!净利润}, 0)'),
                defs.Slice('proj', 'MIN(MAX({少数股东损益占比}[hist].average(), 0), 1.0)'),
            ],
        }),
        defs.Row('归属于母公司所有者的净利润', {
            expression: '{收入成本预测!净利润} - {收入成本预测!收入成本预测!少数股东损益}',
            is_def_scalar: false,
        }),
        defs.Row('调整前终期营业利润率', {
            modifier: '-',
            expression: '1-{调整前成本率}[final]-{%营业总收入@2}[final]-{调整前销售费用率}[final]-{调整前管理费用率}[final]-{%营业总收入@5}[final]',
            is_def_scalar: true,
        }),
        defs.Row('终期预测营业利润率', {
            modifier: '-',
            expression: '{DCF模型!企业价值!终期预测营业利润率}',
            is_def_scalar: true,
        }),
        defs.Row('终期营业利润率差异', {
            modifier: '-',
            expression: '{终期预测营业利润率} - {调整前终期营业利润率}',
            is_def_scalar: true,
        }),
        defs.Row('净利率调整项', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '0'),
                defs.Slice('proj', '{净利率调整项}[proj].LINEAR(0, {收入成本预测!收入成本预测!终期营业利润率差异})'),
            ],
        }),
        defs.Row('终期营业成本率', {
            modifier: '-',
            expression: '{%营业总收入@1}[final]',
            is_def_scalar: false,
        }),
        defs.Row('终期销售费用率', {
            modifier: '-',
            expression: '{%营业总收入@3}[final]',
            is_def_scalar: false,
        }),
        defs.Row('终期管理费用率', {
            modifier: '-',
            expression: '{%营业总收入@4}[final]',
            is_def_scalar: false,
        }),
        defs.Row('营业成本率调整项', {
            modifier: '-',
            expression: '- ({净利率调整项}*{终期营业成本率}/({终期营业成本率}+{终期销售费用率}+{终期管理费用率}))',
            is_def_scalar: false,
        }),
        defs.Row('销售费用率调整项', {
            modifier: '-',
            expression: '- ({净利率调整项}*{终期销售费用率}/({终期营业成本率}+{终期销售费用率}+{终期管理费用率}))',
            is_def_scalar: false,
        }),
        defs.Row('管理费用率调整项', {
            modifier: '-',
            expression: '- ({净利率调整项}*{终期管理费用率}/({终期营业成本率}+{终期销售费用率}+{终期管理费用率}))',
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

local table2 = defs.Table('营运资金预测', {
    subnodes: [
        defs.Row('营业收入', {
            modifier: '--',
            expression: '{FS-利润表!利润表!营业收入}',
            is_def_scalar: false,
        }),
        defs.Row('营业成本', {
            expression: '{FS-利润表!利润表!营业成本}',
            is_def_scalar: false,
        }),
        defs.Row('应收帐款', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!应收账款}'),
                defs.Slice('proj', '{营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['应收账款'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!营运资金预测!应收帐款}/{营运资金预测!营业收入}, 0)'),
                defs.Slice('proj', '{%营业收入@1}[hist].average()'),
            ],
            alias: '1',
        }),
        defs.Row('存货', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!存货}'),
                defs.Slice('proj', '{营业收入}*{%营业收入@1}'),
            ],
        }),
        defs.Row('%营业收入', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['存货'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!营运资金预测!存货}/{营运资金预测!营业收入}, 0)'),
                defs.Slice('proj', '{%营业收入@2}[hist].average()'),
            ],
            alias: '2',
        }),
        defs.Row('预付款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!预付款项}'),
                defs.Slice('proj', '{营业成本}*{%营业成本@1}'),
            ],
        }),
        defs.Row('%营业成本', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['预付款项'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({收入成本预测!营运资金预测!预付款项}/{营运资金预测!营业成本}, 0)'),
                defs.Slice('proj', '{%营业成本@1}[hist].average()'),
            ],
            alias: '1',
        }),
        defs.Row('其他应收款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他应收款项}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!其他应收款项}[hist].average()'),
            ],
        }),
        defs.Row('应付款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!应付账款}'),
                defs.Slice('proj', '{营业成本}*{%营业成本@2}'),
            ],
        }),
        defs.Row('%营业成本', {
            modifier: '-',
            is_def_scalar: false,
            labels: ['应付款项'],
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({data!balance_cn.csv!应付账款}/{营运资金预测!营业成本}, 0)'),
                defs.Slice('proj', '{%营业成本@2}[hist].AVERAGE()'),
            ],
            alias: '2',
        }),
        defs.Row('其他应付款项', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他应付款项}'),
                defs.Slice('proj', '{收入成本预测!营运资金预测!其他应付款项}[hist].average()'),
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
    '收入成本预测', {
        subnodes: [
            table1,
            table2,
        ],
    }
);

sheet
