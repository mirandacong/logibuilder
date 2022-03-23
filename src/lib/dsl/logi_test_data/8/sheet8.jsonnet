local defs = import '../defs.jsonnet';

local table1 = defs.Table('投资', {
    subnodes: [
        defs.Row('短期投资', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!短期投资}'),
                defs.Slice('proj', '{其他科目预测!投资!短期投资}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('长期投资', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!长期投资}'),
                defs.Slice('proj', '{其他科目预测!投资!长期投资}[hist].AVERAGE()'),
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

local table2 = defs.Table('其他杂项科目', {
    subnodes: [
        defs.Row('其他流动资产', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他流动资产}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他流动资产}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他非流动资产', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他非流动资产}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他非流动资产}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他流动负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他流动负债}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他流动负债}[hist].AVERAGE()'),
            ],
        }),
        defs.Row('其他非流动负债', {
            is_def_scalar: false,
            slice_exprs: [
                defs.Slice('hist', '{FS-资产负债表!资产负债表!其他非流动负债}'),
                defs.Slice('proj', '{其他科目预测!其他杂项科目!其他非流动负债}[hist].AVERAGE()'),
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
    '其他科目预测', {
        subnodes: [
            table1,
            table2,
        ],
    }
);

sheet
