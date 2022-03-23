local sheet1 = import './sheet1.jsonnet';
local sheet2 = import './sheet2.jsonnet';
local sheet3 = import './sheet3.jsonnet';
local sheet4 = import './sheet4.jsonnet';
local sheet5 = import './sheet5.jsonnet';
local sheet6 = import './sheet6.jsonnet';
local sheet7 = import './sheet7.jsonnet';
local sheet8 = import './sheet8.jsonnet';
local sheet9 = import './sheet9.jsonnet';

local defs = import '../defs.jsonnet';

local book = defs.Book('basic_dcf', {
    subnodes: [
        sheet1,
        sheet2,
        sheet3,
        sheet4,
        sheet5,
        sheet6,
        sheet7,
        sheet8,
        sheet9,
    ],
});

book
