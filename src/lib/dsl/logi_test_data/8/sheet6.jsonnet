local defs = import '../defs.jsonnet';

local table1 = defs.Table('CAPEX', {
    subnodes: [
        defs.Row('PP&E', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!PP&E}'),
                defs.Slice('proj', '{CAPEX!CAPEX!PP&E}.lag(1) - {折旧} +{新增固定资产}'),
            ],
        }),
        defs.Row('折旧', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!cashflow_cn.csv!固定资产折旧、油气资产折耗、生产性生物资产折旧}'),
                defs.Slice('proj', '{CAPEX!CAPEX!PP&E}.lag(1)*{折旧率}'),
            ],
        }),
        defs.Row('折旧率', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({折旧}/{CAPEX!CAPEX!PP&E}.lag(1), 0.1)'),
                defs.Slice('proj', '{折旧率}.AVERAGE()'),
            ],
        }),
        defs.Row('新增固定资产', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{CAPEX!CAPEX!PP&E}.diff(1) +  {折旧}'),
                defs.Slice('proj', '{FS-利润表!利润表!营业收入}*{新增固定资产%营业收入}'),
            ],
        }),
        defs.Row('新增固定资产%营业收入', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({新增固定资产}/{FS-利润表!利润表!营业收入}, 0)'),
                defs.Slice('proj', 'MAX({新增固定资产%营业收入}[hist].average(), 0)'),
            ],
        }),
        defs.Row('无形资产和待摊费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!无形资产和待摊费用}'),
                defs.Slice('proj', '{CAPEX!CAPEX!无形资产和待摊费用}.lag(1) - {摊销} + {新增无形资产和待摊费用}'),
            ],
        }),
        defs.Row('摊销', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{data!cashflow_cn.csv!无形资产摊销} + {data!cashflow_cn.csv!长期待摊费用摊销}'),
                defs.Slice('proj', '{CAPEX!CAPEX!PP&E}.lag(1)*{摊销率}'),
            ],
        }),
        defs.Row('摊销率', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({摊销}/{CAPEX!CAPEX!无形资产和待摊费用}.lag(1), 0.1)'),
                defs.Slice('proj', '{摊销率}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('新增无形资产和待摊费用', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{CAPEX!CAPEX!无形资产和待摊费用}.diff(1) + {摊销}'),
                defs.Slice('proj', '{FS-利润表!利润表!营业收入}*{新增无形资产%营业收入}'),
            ],
        }),
        defs.Row('新增无形资产%营业收入', {
            modifier: '-',
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', 'IFERROR({新增无形资产和待摊费用}/{FS-利润表!利润表!营业收入}, 0)'),
                defs.Slice('proj', 'MAX({新增无形资产%营业收入}[hist].AVERAGE(), 0)'),
            ],
        }),
        defs.Row('CAPEX', {
            modifier: '+',
            expression: '{新增固定资产} + {新增无形资产和待摊费用}',
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
    'CAPEX', {
        subnodes: [
            table1,
        ],
    }
);

sheet
