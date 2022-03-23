export const enum Operator {
    // 常规
    CONVENTION,
    // 格式
    FORMAT,
    // 纯文本
    TEXT,
    // 数字
    NUMBER,
    // 格式刷
    PAINTFORMAT,
    // 缩放
    ZOOM,
    // 采用货币格式
    CURRENCY,
    // 日期
    DATE,
    // 时间
    TIME,
    // 日期时间
    DATE_TIME,
    // 会计
    ACCOUNTING,
    // 百分比
    PERCENT,
    // 千位分隔符
    SEPARATOR,
    // 增加小数位数
    POINT_DEC,
    // 减少小数位数
    POINT_INC,
    // 字体
    FONT_FAMILY,
    // 字号
    FONT_SIZE,
    // 加粗
    BOLD,
    // 斜体
    ITALIC,
    // 下划线
    UNDERLINE,
    // 删除线
    STRIKETHROUGH,
    // 字体颜色
    FONT_COLOR,
    // 背景颜色
    BACKGROUND_COLOR,
    // 边框
    BORDER,
    // 边框颜色
    BORDER_COLOR,
    // 边框样式
    BORDER_LINE,
    // 合并
    MERGE,
    // 水平对齐
    HALIGN ,
    // 垂直对齐
    VALIGN ,
    // 文本换行
    TEXTWRAP,
    // 链接
    LINK ,
    // 插入图表
    INSERT_CHART ,
    // 自动切换
    AUTO_TOGGLE ,
    // 函数
    FUNCTION ,
    // 减少缩进量
    DECREASE,
    // 增加缩进量
    INCREASE,
}
export const enum MergeCells {
    ALL = '全部合并',
    HORIZONTALLY = '水平合并',
    VERTICALLY = '垂直合并',
    CANCEL = '取消合并',
}
export const enum HorizontalAlign {
    LEFT = '向左对齐',
    CENTRE = '中心对齐',
    RIGHT = '向右对齐',
}

export const enum VerticalAlign {
    TOP = '顶部对齐',
    MIDDLE = '居中对齐',
    BOTTOM = '底部对齐',
}
export const enum Wrap {
    WRAP = '溢出',
    OVERFLOW = '自动换行',
    CLIP = '截短',
}

export const enum Border {
    ALL = '所有边框',
    INNER = '内部边框',
    HOIZONTAL = '水平边框',
    VERTICAL = '垂直边框',
    OUTER = '外部边框',
    LEFT = '左边框',
    TOP = '上边框',
    RIGHT = '右边框',
    BOTTOM = '下边框',
    CLEAR = '清除边框',
}

// tslint:disable-next-line: const-enum
export enum LineStyle {
    SOLID = 'solid',
    SOLID_BOLD = 'solid-bold',
    SOLID_THICKEST= 'solid-thickest',
    DASHED = 'dashed',
    DOTTED = 'dotted',
    DOUBLE = 'double',
}

export const enum FormatterEnum {
    TEXT = '0',
    CONVENTION = '',
    ACCOUNTING= '_(￥* #,##0_);_(￥* (#,##0)',
    NUMBER = '#,##0.00',
    CURRENCY = '_(￥* #,##0.00_);_(￥* (#,##0.00);_(￥* "-"??_);_(@_)',
    PERCENT = '0.00%',
    SEPARATOR = '###,###',
    DATE= 'yyyy-MM-dd',
    TIME = 'hh:mm:ss',
    DATE_TIME= 'yyyy-MM-dd HH:mm:ss',
}
