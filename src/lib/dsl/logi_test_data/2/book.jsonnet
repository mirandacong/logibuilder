local defs = import '../defs.jsonnet';
local sheet1 = import './sheet1.jsonnet';
local sheet2 = import './sheet2.jsonnet';
local sheet3 = import './sheet3.jsonnet';


local book = defs.Book('FS', {
    subnodes: [sheet1, sheet2, sheet3],
});

book
