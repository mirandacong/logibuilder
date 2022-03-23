local table1 = import './table1.jsonnet';
local table2 = import './table2.jsonnet';
local table3 = import './table3.jsonnet';
local table4 = import './table4.jsonnet';
local table5 = import './table5.jsonnet';

local defs = import '../defs.jsonnet';

local book = defs.Book('阿里健康 00241.HK', {
    subnodes: [
        defs.Sheet('DCF模型', {
            subnodes: [
                defs.Title('Alibaba DCF model', {}),
                table1,
                table2,
                table3,
                table4,
            ],
        }),

        defs.Sheet('Assump', {
            subnodes: [table5],
        }),
    ],
});

book
