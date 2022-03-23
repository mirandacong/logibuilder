local defs = import '../defs.jsonnet';
local sheet1 = import './sheet1.jsonnet';
local sheet2 = import './sheet2.jsonnet';

local book = defs.Book('Test model', {
    subnodes: [sheet1, sheet2],
});

book
