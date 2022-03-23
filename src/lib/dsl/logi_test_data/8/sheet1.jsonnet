local defs = import '../defs.jsonnet';

local table1 = defs.Table('自由现金流', {
    subnodes: [
        defs.Row('营业收入', {
            modifier: '+',
            expression: '{FS-利润表!利润表!营业总收入}',
            is_def_scalar: false,
        }),
        defs.Row('增长率', {
            modifier: '-',
            labels: ['营业收入'],
            expression: '{营业收入}/{营业收入}.lag(1)-1',
            is_def_scalar: false,
        }),
        defs.Row('EBITDA', {
            modifier: '+',
            expression: '{EBIT} + {CAPEX!CAPEX!折旧} + {CAPEX!CAPEX!摊销}',
            is_def_scalar: false,
        }),
        defs.Row('%营业收入', {
            labels: ['EBITDA'],
            modifier: '-',
            expression: '{EBITDA}/{营业收入}',
            is_def_scalar: false,
        }),
        defs.Row('EBIT', {
            modifier: '+',
            expression: '{FS-利润表!利润表!EBIT}',
            is_def_scalar: false,
        }),
        defs.Row('%营业收入', {
            labels: ['EBIT'],
            modifier: '-',
            expression: '{EBIT}/{营业收入}',
            is_def_scalar: false,
        }),
        defs.Row('有效税率', {
            modifier: '-',
            expression: '{收入成本预测!收入成本预测!有效税率}',
            is_def_scalar: false,
        }),
        defs.Row('EBIT*(1-有效税率)', {
            expression: '{EBIT} * (1-{有效税率})',
            is_def_scalar: false,
        }),
        defs.Row('(加)折旧摊销', {
            expression: '{FS-现金流量表!现金流量表!(加)折旧摊销}',
            is_def_scalar: false,
        }),
        defs.Row('(减)营运资金增加', {
            expression: '{FS-现金流量表!现金流量表!(减)营运资金增加}',
            is_def_scalar: false,
        }),
        defs.Row('(减)CAPEX', {
            expression: '{FS-现金流量表!现金流量表!（减）CAPEX}',
            is_def_scalar: false,
        }),
        defs.Row('%营业收入', {
            labels: ['CAPEX'],
            modifier: '-',
            expression: '{(减)CAPEX}/{营业收入}',
            is_def_scalar: false,
        }),
        defs.Row('无杠杆自由现金流', {
            modifier: '+',
            expression: '{EBIT*(1-有效税率)} + SUM({(加)折旧摊销}, {(减)营运资金增加}, {(减)CAPEX})',
            is_def_scalar: false,
        }),
        defs.Row('折现系数', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('proj', '1/POWER((1+{WACC}),{折现系数}.year() - 2018)'),
            ],
        }),
        defs.Row('WACC', {
            expression: '{WACC计算表!WACC}',
            is_def_scalar: true,
        }),
        defs.Row('预测期净现值', {
            modifier: '+',
            expression: '({无杠杆自由现金流}[proj] * {折现系数}[proj]).sum()',
            is_def_scalar: true,
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

local table2 = defs.Table('企业价值', {
    subnodes: [
        defs.Row('预测期净现值', {
            expression: '{自由现金流!预测期净现值}',
            is_def_scalar: true,
        }),
        defs.Row('永续增长率', {
            expression: '0.02',
            is_def_scalar: true,
        }),
        defs.Row('终期预测收入增长率差异', {
            expression: '{收入成本预测!收入成本预测!终期收入增长率差异}',
            is_def_scalar: true,
        }),
        defs.Row('终期预测营业利润率', {
            expression: '0.3',
            is_def_scalar: true,
        }),
        defs.Row('终期预测营业利润率差异', {
            expression: '{收入成本预测!收入成本预测!终期营业利润率差异}',
            is_def_scalar: true,
        }),
        defs.Row('终值', {
            expression: '{自由现金流!无杠杆自由现金流}[final]*(1+{永续增长率})/({自由现金流!WACC}-{永续增长率})',
            is_def_scalar: true,
        }),
        defs.Row('终值现值', {
            expression: '{终值}/POWER((1+{自由现金流!WACC}),2023-2018)',
            is_def_scalar: true,
        }),
        defs.Row('EV', {
            modifier: '+',
            expression: '{预测期净现值} + {终值现值}',
            is_def_scalar: true,
        }),
        defs.Row('Implied EV/EBITDA', {
            modifier: '+',
            expression: '{EV}/{自由现金流!EBITDA}[proj_start]',
            is_def_scalar: true,
        }),
        defs.Row('总负债', {
            expression: '{FS-资产负债表!资产负债表!负债合计}[recent]',
            is_def_scalar: true,
        }),
        defs.Row('现金', {
            expression: '{FS-资产负债表!资产负债表!现金及现金等价物}[recent]',
            is_def_scalar: true,
        }),
        defs.Row('净负债', {
            expression: '{总负债} - {现金}',
            is_def_scalar: true,
        }),
        defs.Row('少数股东权益', {
            expression: '{FS-资产负债表!资产负债表!其中：少数股东权益}[recent]',
            is_def_scalar: true,
        }),
        defs.Row('股权价值', {
            modifier: '+',
            expression: '{EV} - {净负债}',
            is_def_scalar: true,
        }),
        defs.Row('股数', {
            expression: '{FS-资产负债表!资产负债表!股本}[recent]',
            is_def_scalar: true,
        }),
        defs.Row('隐含股价', {
            modifier: '+',
            expression: '{股权价值}/{企业价值!股数}',
            is_def_scalar: true,
        }),
        defs.Col('', {}),
    ],
});

local table3 = defs.Table('市值', {
    subnodes: [
        defs.Row('股价（市场价）', {
            is_def_scalar: true,
            expression: '8.6',
        }),
        defs.Row('普通股数', {
            expression: '{企业价值!股数}',
            is_def_scalar: true,
        }),
        defs.Row('市值', {
            expression: '{股价（市场价）}*{普通股数}',
            is_def_scalar: true,
        }),
        defs.Row('净负债', {
            expression: '{企业价值!净负债}',
            is_def_scalar: true,
        }),
        defs.Row('企业价值 EV (按市值计算）', {
            expression: '{市值}+{净负债}',
            is_def_scalar: true,
        }),
        defs.Row('净负债/EBITDA （FY20）', {
            expression: '{净负债}/{自由现金流!EBITDA}[2020]',
            is_def_scalar: true,
        }),
        defs.Col('', {}),
    ],
});

local table4 = defs.Table('估值', {
    subnodes: [
        defs.Row('隐含EV/收入', {
            expression: 'MAX({企业价值!EV}/{自由现金流!营业收入}, 0)',
            is_def_scalar: false,
        }),
        defs.Row('隐含EV/EBITDA', {
            expression: 'MAX({企业价值!EV}/{自由现金流!EBITDA}, 0)',
            is_def_scalar: false,
        }),
        defs.Row('隐含EV/EBIT', {
            expression: 'MAX({企业价值!EV}/{自由现金流!EBIT}, 0)',
            is_def_scalar: false,
        }),
        defs.Row('隐含PE', {
            expression: 'MAX({企业价值!隐含股价}*{企业价值!股数}/{FS-利润表!利润表!净利润},0)',
            is_def_scalar: false,
        }),
        defs.Col('2019', { labels: ['proj', 'proj_start'] }),
        defs.Col('2020', { labels: ['proj'] }),
        defs.Col('2021', { labels: ['proj'] }),
    ],
});

local table5 = defs.Table('WACC计算表', {
    subnodes: [
        defs.Row('无风险利率', {
            modifier: '-',
            expression: '0.015',
            is_def_scalar: true,
        }),
        defs.Row('股权风险溢价', {
            modifier: '-',
            expression: '0.07',
            is_def_scalar: true,
        }),
        defs.Row('Beta', {
            expression: '1.0',
            is_def_scalar: true,
        }),
        defs.Row('股权成本', {
            modifier: '-',
            expression: '{无风险利率} + {股权风险溢价}*{Beta}',
            is_def_scalar: true,
        }),
        defs.Row('债权成本', {
            modifier: '-',
            expression: '0.0475',
            is_def_scalar: true,
        }),
        defs.Row('有效税率', {
            modifier: '-',
            expression: '{收入成本预测!收入成本预测!有效税率}[proj_start]',
            is_def_scalar: true,
        }),
        defs.Row('债权成本*(1-有效税率)', {
            modifier: '-',
            expression: '{债权成本} * (1-{有效税率})',
            is_def_scalar: true,
        }),
        defs.Row('账面股权%(股权+债权)', {
            modifier: '-',
            expression: '{FS-资产负债表!资产负债表!所有者权益合计}[recent] /({FS-资产负债表!资产负债表!资本性负债}[recent]+ {FS-资产负债表!资产负债表!所有者权益合计}[recent])',
            is_def_scalar: true,
        }),
        defs.Row('债权%(股权+债权)', {
            modifier: '-',
            expression: '1 - {账面股权%(股权+债权)}',
            is_def_scalar: true,
        }),
        defs.Row('WACC', {
            modifier: '-',
            expression: '{账面股权%(股权+债权)}*{股权成本} + {债权%(股权+债权)} * {债权成本*(1-有效税率)}',
            is_def_scalar: true,
        }),
        defs.Col('', {}),
    ],
});

local sheet = defs.Sheet(
    'DCF模型', {
        subnodes: [
            table1,
            table2,
            table3,
            table4,
            table5,
        ],
    }
);

sheet
