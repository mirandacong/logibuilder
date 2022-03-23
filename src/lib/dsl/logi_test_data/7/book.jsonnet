local sheet1 = import './sheet1.jsonnet';
local sheet2 = import './sheet2.jsonnet';
local sheet3 = import './sheet3.jsonnet';
local sheet4 = import './sheet4.jsonnet';

local defs = import '../defs.jsonnet';

local book = defs.Book('DCF Model', {
    subnodes: [
        sheet1,
        sheet2,
        sheet3,
        sheet4,
    ],
});

book
