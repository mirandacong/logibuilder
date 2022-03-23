local defs = import '../defs.jsonnet';

local sheet1 = import './sheet1.jsonnet';


local book = defs.Book('Style template', {
    subnodes: [sheet1],
});

book
