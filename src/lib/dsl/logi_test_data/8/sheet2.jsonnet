local defs = import '../defs.jsonnet';

local table1 = defs.Table('利润表', {
    subnodes: [
        defs.Row('营业收入', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!营业收入}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!营业收入}'),
            ],
        }),
        defs.Row('其他业务收入', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!其他业务收入}+{data!income_cn.csv!应计入营业总收入的其他杂项}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!其他业务收入}'),
            ],
        }),
        defs.Row('营业总收入', {
            modifier: '+',
            expression: '{营业收入} + {其他业务收入}',
            is_def_scalar: false,
        }),
        defs.Row('营业成本', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!营业成本}+{data!income_cn.csv!堪探费用}+{data!income_cn.csv!其他业务成本}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!营业成本}'),
            ],
        }),
        defs.Row('营业税金及附加', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!营业税金及附加}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!营业税金及附加}'),
            ],
        }),
        defs.Row('毛利', {
            modifier: '+',
            expression: '{FS-利润表!利润表!营业总收入} - {FS-利润表!利润表!营业成本} - {FS-利润表!利润表!营业税金及附加}',
            is_def_scalar: false,
        }),
        defs.Row('销售费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!销售费用}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!销售费用}'),
            ],
        }),
        defs.Row('管理费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!管理费用}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!管理费用}'),
            ],
        }),
        defs.Row('其他成本费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!应计入营业总成本的其他杂项}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!其他成本费用}'),
            ],
        }),
        defs.Row('EBIT', {
            modifier: '+',
            expression: '{毛利} - sum({销售费用}, {管理费用}, {其他成本费用})',
            is_def_scalar: false,
        }),
        defs.Row('财务费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!财务费用}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!财务费用}'),
            ],
        }),
        defs.Row('资产减值损失', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!资产减值损失}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!资产减值损失}'),
            ],
        }),
        defs.Row('非经常性损益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!其他营业收支} + {data!income_cn.csv!营业外收支} + {data!income_cn.csv!影响利润总额的其他杂项} + {data!income_cn.csv!影响净利润的其他科目} + {data!income_cn.csv!影响净利润的其他杂项}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!非经常性损益}'),
            ],
        }),
        defs.Row('税前利润', {
            modifier: '+',
            expression: '{FS-利润表!利润表!EBIT} - {FS-利润表!利润表!财务费用} - {FS-利润表!利润表!资产减值损失} + {FS-利润表!利润表!非经常性损益}',
            is_def_scalar: false,
        }),
        defs.Row('所得税', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!所得税}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!所得税}'),
            ],
        }),
        defs.Row('净利润', {
            modifier: '+',
            expression: '{税前利润}-{所得税}',
            is_def_scalar: false,
        }),
        defs.Row('少数股东损益', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!income_cn.csv!少数股东损益}+{data!income_cn.csv!归属于母公司所有者的净利润误差项}'),
                defs.Slice('proj', '{收入成本预测!收入成本预测!少数股东损益}'),
            ],
        }),
        defs.Row('归属于母公司所有者的净利润', {
            modifier: '+',
            expression: '{净利润} - {少数股东损益}',
            is_def_scalar: false,
        }),
        defs.Row('EPS', {
            expression: '{净利润} / {FS-资产负债表!资产负债表!股本}',
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
    'FS-利润表', {
        subnodes: [
            table1,
        ],
    }
);

sheet
