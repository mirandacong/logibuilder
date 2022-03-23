local defs = import '../defs.jsonnet';

local table4 = defs.Table('投融资假设', {
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
        defs.Row('股权融资', {
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!现金流量表!股权融资}'),
                defs.Slice('proj', ''),
            ],
            sources: [null, null, null, null, null, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
        }),
    ],
});

local table3 = defs.Table('资产负债表假设', {
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
        defs.Row('维持现金', {
            slice_exprs: [
                defs.Slice('proj', '',),
            ],
            sources: [null, null, null, null, null, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
        }),
    ],
});

local table2 = defs.Table('利润表假设', {
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
        defs.Row('营业收入增长率', {
            modifier: '-',
            sources: [null, null, null, null, null, 1.0, 0.8, 0.6, 0.4, 0.2, 0.1],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!利润表!增长率}'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('营业成本%营业收入', {
            modifier: '-',
            sources: [null, null, null, null, null, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!利润表!%营业收入@2}'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('营业费用%营业收入', {
            modifier: '-',
            sources: [null, null, null, null, null, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!利润表!%营业收入@3}'),
                defs.Slice('proj', ''),
            ],
        }),
        defs.Row('有效税率', {
            modifier: '-',
            sources: [null, null, null, null, null, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
            slice_exprs: [
                defs.Slice('hist', '{DCF模型!利润表!有效税率}'),
                defs.Slice('proj', ''),
            ],
        }),
    ],
},);

local table1 = defs.Table('DCF假设', {
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
        defs.Row('WACC', {
            expression: '',
            is_def_scalar: true,
            sources: [0.1, null, null, null, null, null, null, null, null, null, null],
        }),
        defs.Row('永续增长率', {
            expression: '',
            is_def_scalar: true,
            sources: [0.05, null, null, null, null, null, null, null, null, null, null],
        },),
    ],
},);

local sheet = defs.Sheet('假设', {
    subnodes: [
        defs.Title('DCF假设', {}),
        table1,
        defs.Title('利润表假设', {}),
        table2,
        defs.Title('资产负债表假设', {}),
        table3,
        defs.Title('投融资假设', {}),
        table4,
    ],
});

sheet
