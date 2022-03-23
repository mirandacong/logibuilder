local DEFAULT_EXPR = '';
local DEFAULT_HEADER_STUB = '';
local DEFAULT_MODIFIER = '';
local DEFAULT_LABELS = [];
local Type = {
    FX: 0,
    ASSUMPTION: 1,
    FACT: 2,
    CONSTRAINT: 3,
};
local DEFAULT_IS_DEF_SCALAR = false;
local DEFAULT_SUBNODES = [];
local DEFAULT_SOURCES = [];
local DEFAULT_SLICE_EXPRS = [];
local DEFAULT_TYPE = Type.FX;
local DEFAULT_ANNOTATIONS = {};
local DEFAULT_ALIAS = '';

{
    local nodetype = {
        BOOK: 1,
        SHEET: 2,
        TITLE: 3,
        TABLE: 4,
        ROW_BLOCK: 5,
        COLUMN_BLOCK: 6,
        ROW: 7,
        COLUMN: 8,
        ROW_SELECTION: 9,
        COLUMN_SELECTION: 10,
        HEADER: 11,
    },
    Attrs(attrs):: [
        { [key]: attrs[key] }
        for key in std.objectFields(attrs)
    ],
    Sources(sources):: sources,
    Tags(tags):: tags,
    local get_or_init_annotations(obj) = (
        if std.objectHas(obj, 'annotations') then
            obj.annotations else DEFAULT_ANNOTATIONS
    ),
    local get_or_init_subnodes(obj) = (
        if std.objectHas(obj, 'subnodes') then
            obj.subnodes else DEFAULT_SUBNODES
    ),
    local get_or_init_slice_exprs(obj) = (
        if std.objectHas(obj, 'slice_exprs') then
            obj.slice_exprs else DEFAULT_SLICE_EXPRS
    ),
    local get_or_init_expression(obj) = (
        if std.objectHas(obj, 'expression') &&
           std.isString(obj.expression) then
            obj.expression else DEFAULT_EXPR
    ),
    local get_or_init_modifier(obj) = (
        if std.objectHas(obj, 'modifier') &&
           std.isString(obj.modifier) then
            obj.modifier else DEFAULT_MODIFIER
    ),
    local get_or_init_labels(obj) = (
        if std.objectHas(obj, 'labels') then obj.labels else DEFAULT_LABELS
    ),
    local get_or_init_sources(obj) = (
        if std.objectHas(obj, 'sources') then
            obj.sources else DEFAULT_SOURCES
    ),
    local get_or_init_header_stub(obj) = (
        if std.objectHas(obj, 'header_stub') &&
           std.isString(obj.header_stub) then
            obj.header_stub else DEFAULT_HEADER_STUB
    ),
    local get_or_init_def_scalar(obj) = (
        if std.objectHas(obj, 'is_def_scalar') then
            obj.is_def_scalar else DEFAULT_IS_DEF_SCALAR
    ),
    local get_or_init_type(obj) = (
        if std.objectHas(obj, 'type') then
            obj.type else DEFAULT_TYPE
    ),
    local get_or_init_alias(obj) = (
        if std.objectHas(obj, 'alias') then obj.alias else DEFAULT_ALIAS
    ),
    Slice(name, expression, type=Type.FX, annotations={}):: (
        assert std.isString(name) :
               'row_selection name must be string, but got ' + name;
        {
            name: name,
            expression: expression,
            type: type,
            annotations: annotations,
        }
    ),
    Row(name, obj):: (
        assert std.isString(name) : 'row name must be string, but got ' +
                                    name;
        local subnodes = get_or_init_subnodes(obj);
        local expression = get_or_init_expression(obj);
        local modifier = get_or_init_modifier(obj);
        local slice_exprs = get_or_init_slice_exprs(obj);
        local labels = get_or_init_labels(obj);
        local sources = get_or_init_sources(obj);
        local is_def_scalar = get_or_init_def_scalar(obj);
        local type = get_or_init_type(obj);
        local annotations = get_or_init_annotations(obj);
        local alias = get_or_init_alias(obj);
        {
            name: name,
            annotations: annotations,
            expression: expression,
            modifier: modifier,
            labels: labels,
            slice_exprs: slice_exprs,
            subnodes: [],
            nodetype: nodetype.ROW,
            is_def_scalar: is_def_scalar,
            type: type,
            sources: sources,
            alias: alias,
        }
    ),
    Col(name, obj):: (
        assert std.isString(name) : 'col name must be string, but got ' +
                                    name;
        local subnodes = get_or_init_subnodes(obj);
        local expression = get_or_init_expression(obj);
        local slice_exprs = get_or_init_slice_exprs(obj);
        local modifier = get_or_init_modifier(obj);
        local labels = get_or_init_labels(obj);
        local sources = get_or_init_sources(obj);
        local type = get_or_init_type(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            annotations: annotations,
            expression: expression,
            modifier: modifier,
            labels: labels,
            subnodes: [],
            slice_exprs: slice_exprs,
            nodetype: nodetype.COLUMN,
            type: type,
            sources: sources,
        }
    ),
    RowBlock(name, obj):: (
        assert std.isString(name) :
               'row_block name must be string, but got ' + name;
        local labels = get_or_init_labels(obj);
        local modifier = get_or_init_modifier(obj);
        local subnodes = get_or_init_subnodes(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            modifier: modifier,
            subnodes: subnodes,
            labels: labels,
            nodetype: nodetype.ROW_BLOCK,
            annotations: annotations,
        }
    ),
    ColBlock(name, obj):: (
        assert std.isString(name) :
               'col_block name must be string, but got ' + name;
        local labels = get_or_init_labels(obj);
        local subnodes = get_or_init_subnodes(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            labels: labels,
            nodetype: nodetype.COLUMN_BLOCK,
            subnodes: subnodes,
            annotations: annotations,
        }
    ),
    Table(name, obj):: (
        assert std.isString(name) :
               'table name must be string, but got ' + name;
        local labels = get_or_init_labels(obj);
        local subnodes = get_or_init_subnodes(obj);
        local header_stub = get_or_init_header_stub(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            labels: labels,
            nodetype: nodetype.TABLE,
            subnodes: subnodes,
            header_stub: header_stub,
            annotations: annotations,
        }
    ),
    Title(name, obj):: (
        assert std.isString(name) :
               'title name must be string, but got ' + name;
        local labels = get_or_init_labels(obj);
        local modifier = get_or_init_modifier(obj);
        local subnodes = get_or_init_subnodes(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            labels: labels,
            nodetype: nodetype.TITLE,
            modifier: modifier,
            subnodes: subnodes,
            annotations: annotations,
        }
    ),
    Sheet(name, obj):: (
        assert std.isString(name) : 'sheet name must be string, but got ' +
                                    name;
        local labels = get_or_init_labels(obj);
        local subnodes = get_or_init_subnodes(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            labels: labels,
            nodetype: nodetype.SHEET,
            subnodes: subnodes,
            annotations: annotations,
        }
    ),
    Book(name, obj):: (
        assert std.isString(name) : 'book name must be string, but got ' +
                                    name;
        local labels = get_or_init_labels(obj);
        local subnodes = get_or_init_subnodes(obj);
        local annotations = get_or_init_annotations(obj);
        {
            name: name,
            labels: labels,
            nodetype: nodetype.BOOK,
            subnodes: subnodes,
            annotations: annotations,
        }
    ),
}
