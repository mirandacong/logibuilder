/* eslint-disable max-lines */
import {
    ArgType,
    buildAllTypeArg,
    buildArrayArg,
    buildBoolArg,
    buildDateArg,
    buildNumAndArrayUnionArg,
    buildNumAndBoolUnionArg,
    buildNumberArg,
    RangeBuilder,
    Signature,
    SignatureBuilder,
} from './signature'

export function getSignature(image: string): Signature | undefined {
    return REGISTRY.find((i: Signature): boolean =>
        i.image.toLowerCase() === image.toLowerCase())
}

export const TYPE1_REGISTRY = buildType1Registry()

// tslint:disable-next-line: max-func-body-length
function buildType1Registry(): readonly Signature[] {
    /**
     * (number | array) + (number | array) or +1
     */
    const plusOp = new SignatureBuilder()
        .image('+')
        .args([
            buildNumAndArrayUnionArg(),
            buildNumAndArrayUnionArg('', '', false),
        ])
        .returnType([ArgType.ARRAY, ArgType.NUMBER])
        .description('plus')
        .build()
    /**
     * (number | array) - (number | array) or -1
     */
    const minusOp = new SignatureBuilder()
        .image('-')
        .args([
            buildNumAndArrayUnionArg(),
            buildNumAndArrayUnionArg('', '', false),
        ])
        .returnType([ArgType.ARRAY, ArgType.NUMBER])
        .description('minus')
        .build()
    /**
     * (number | array) * (number | array)
     */
    const multiplyOp = new SignatureBuilder()
        .image('*')
        .args([
            buildNumAndArrayUnionArg(),
            buildNumAndArrayUnionArg(),
        ])
        .returnType([ArgType.ARRAY, ArgType.NUMBER])
        .description('multiply')
        .build()
    /**
     * (number | array) / (number | array)
     */
    const divideOp = new SignatureBuilder()
        .image('/')
        .args([
            buildNumAndArrayUnionArg(),
            buildNumAndArrayUnionArg(),
        ])
        .returnType([ArgType.ARRAY, ArgType.NUMBER])
        .description('divide')
        .build()
    const rangeOp = new SignatureBuilder()
        .image('::')
        .args([
            buildArrayArg('对象1', '从此对象开始'),
            buildArrayArg('对象2', '到此对象结束'),
        ])
        .returnType([ArgType.ARRAY])
        .description('指定一组范围')
        .build()
    /**
     * average(number | array, ...)
     */
    const averageOp = new SignatureBuilder()
        .image('average')
        .args([buildNumAndArrayUnionArg('值', '计算平均值时用到的数值或范围')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.ARRAY])
        .description('返回算术平均值')
        .build()
    /**
     * count(number | array, ...)
     */
    const countOp = new SignatureBuilder()
        .image('count')
        .args([buildNumAndArrayUnionArg('值', '计数时要检查的第一个值或范围')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.ARRAY])
        .description('计算区域中包含数字的单元格的个数')
        .build()
    /**
     * iferror(number | array, number | array)
     */
    const iferrorOp = new SignatureBuilder()
        .image('iferror')
        .args([
            buildNumAndArrayUnionArg('值', 'value 本身不为错误值的情况下要返回的值'),
            buildNumAndArrayUnionArg('默认值', 'value 是错误值的情况下函数返回的值'),
        ])
        .returnType([ArgType.ARRAY])
        .description('如果表达式是错误的,则返回默认值,否则返回表达式自身的值')
        .build()
    /**
     * max(number | array, ...)
     */
    const maxOp = new SignatureBuilder()
        .image('max')
        .args([buildNumAndArrayUnionArg('值', '计算最大值时所用的值或范围')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.ARRAY])
        .description('返回一组数值中的最大值')
        .build()
    /**
     * min(number | array, ...)
     */
    const minOp = new SignatureBuilder()
        .image('min')
        .args([buildNumAndArrayUnionArg('值', '计算最小值时所用的值或范围')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.ARRAY])
        .description('返回一组数值中的最小值')
        .build()
    /**
     * power(number | array, number | array)
     */
    const powerOp = new SignatureBuilder()
        .image('power')
        .args([
            buildNumAndArrayUnionArg('基数', '要计算其指数次幂的数值（如果基数为负，则指数必须为整数）'),
            buildNumAndArrayUnionArg('指数', '指定底数的自乘幂次值'),
        ])
        .returnType([ArgType.ARRAY])
        .description('返回某一数值的某次幂')
        .build()
    /**
     * sum(number | array, ...)
     */
    const sumOp = new SignatureBuilder()
        .image('sum')
        .args([buildNumAndArrayUnionArg('值', '要相加的数值或范围')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.ARRAY])
        .description('计算对应区域的所有数值的和')
        .build()

    const switchOp = new SignatureBuilder()
        .image('switch')
        .args([buildNumAndArrayUnionArg('表达式', '任何有效的值'),
            buildNumAndArrayUnionArg('案例', '检查是否与表达式匹配的第一种情况'),
            buildNumAndArrayUnionArg('值', '案例与表达式匹配后返回的对应值'),
            buildNumAndArrayUnionArg('默认值', '没有与表达式匹配的情况后返回的可选值（指定为最后一个参数）'),
        ])
        // tslint:disable-next-line: no-magic-numbers
        .infinite(new RangeBuilder().start(1).end(2).build())
        .returnType([ArgType.ARRAY])
        .description('根据计算表达式的值返回与第一个匹配值对应的结果,如果没有匹配项,则返回默认值')
        .build()

    const ifOp = new SignatureBuilder()
        .image('if')
        .args([
            buildBoolArg(
                '条件',
                '一个表达式或对包含表达式的单元格的引用，该表达式代表某种逻辑值，即 TRUE 或 FALSE',
            ),
            buildNumAndArrayUnionArg('为 TRUE 时的返回值', '当逻辑表达式为 TRUE 时函数返回的值'),
            buildNumAndArrayUnionArg('为 FALSE 时的返回值', '当逻辑表达式为 FALSE 时函数返回的值'),
        ])
        .returnType([ArgType.ARRAY])
        .description('判断是否满足某个条件,如果满足,则返回第一个值,否则返回另一个值')
        .build()

    const gtOp = buildComparison('>', '>')
    const geOp = buildComparison('>=', '>=')
    const ltOp = buildComparison('<', '<')
    const leOp = buildComparison('<=', '<=')
    const eqOp = buildComparison('=', '=')
    const neOp = buildComparison('<>', '<>')
    const neOp2 = buildComparison('!=', '!=')

    const dateOp = new SignatureBuilder()
        .image('date')
        .args([
            buildNumAndArrayUnionArg('年', '日期中的年份'),
            buildNumAndArrayUnionArg('月', '日期中的月份'),
            buildNumAndArrayUnionArg('日', '日期中的“日”部分'),
        ])
        .returnType([ArgType.ARRAY])
        .description('返回在Excel日期时间中代表日期的数字')
        .build()
    /**
     * cos(number)
     */
    const cosOp = new SignatureBuilder()
        .image('cos')
        .args([buildNumAndArrayUnionArg('角度', '要取其余弦值的角度，以弧度表示')])
        .returnType([ArgType.NUMBER])
        .description('返回给定角度的余弦值')
        .build()
    /**
     * log(number)
     */
    const logOp = new SignatureBuilder()
        .image('log')
        .args([
            buildNumAndArrayUnionArg('值', '要计算其以给定底数为底的对数的值（值必须为正数）'),
            buildNumAndArrayUnionArg('底数', '用于计算此对数的底数'),
        ])
        .returnType([ArgType.NUMBER])
        .description('根据底数返回数值的对数')
        .build()
    /**
     * round(number, number)
     */
    const roundOp = new SignatureBuilder()
        .image('round')
        .args([
            buildNumAndArrayUnionArg('值', '要四舍五入为位数位小数的数值'),
            buildNumAndArrayUnionArg(
                '位数',
                '要舍入到的小数位数（位数可以取负值，在这种情况下会将值的小数点左侧部分舍入到指定的位数）',
            ),
        ])
        .returnType([ArgType.NUMBER])
        .description('按指定位数对数值进行四舍五入')
        .build()
    /**
     * sin(number)
     */
    const sinOp = new SignatureBuilder()
        .image('sin')
        .args([buildNumAndArrayUnionArg('角度', '要返回其正弦值的角度，以弧度表示')])
        .returnType([ArgType.NUMBER])
        .description('返回给定角度的正弦值')
        .build()

    const concatOp = new SignatureBuilder()
        .image('&')
        .args([
            buildNumAndArrayUnionArg(),
            buildNumAndArrayUnionArg(),
        ])
        .returnType([ArgType.ARRAY])
        .description('连接两个元素')
        .build()

    const andOp = new SignatureBuilder()
        .image('and')
        .args([buildNumAndBoolUnionArg('逻辑值', '逻辑表达式')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.BOOLEAN])
        .description('返回所有表达式的与值')
        .build()
    const orOp = new SignatureBuilder()
        .image('or')
        .args([buildNumAndBoolUnionArg('逻辑值', '逻辑表达式')])
        .infinite(new RangeBuilder().start(0).end(0).build())
        .returnType([ArgType.BOOLEAN])
        .description('返回所有表达式的或值')
        .build()
    const notOp = new SignatureBuilder()
        .image('not')
        .args([buildNumAndBoolUnionArg('逻辑值', '逻辑表达式')])
        .returnType([ArgType.BOOLEAN])
        .description('对逻辑表达式的值求反')
        .build()

    const isErrorOp = new SignatureBuilder()
        .image('iserror')
        .args([buildAllTypeArg('任意值', '任意一个表达式')])
        .returnType([ArgType.BOOLEAN])
        .description('检查值是否错误')
        .build()

    const yearFracOp = new SignatureBuilder()
        .image('yearfrac')
        .args([
            buildNumberArg('开始日期', '', true),
            buildNumberArg('结束日期', '', true),
            buildNumberArg(
                '计算方式',
                '要使用的日计数基准类型:\n0或省略:US(NASD) 30/360\n1:实际/实际\n2:实际/360\n3:实际/365\n4:欧洲 30/360',
                false,
            ),
        ])
        .returnType([ArgType.NUMBER])
        .description('计算两个日期之间的天数(取整天数)占一年的比例')
        .build()

    const absOp = new SignatureBuilder()
        .image('abs')
        .args([buildNumAndBoolUnionArg('值', '需要计算绝对值的值')])
        .returnType([ArgType.NUMBER])
        .description('计算绝对值')
        .build()

    return [
        absOp,
        andOp,
        averageOp,
        concatOp,
        cosOp,
        countOp,
        dateOp,
        divideOp,
        eqOp,
        geOp,
        gtOp,
        ifOp,
        iferrorOp,
        isErrorOp,
        leOp,
        logOp,
        ltOp,
        maxOp,
        minOp,
        minusOp,
        multiplyOp,
        neOp,
        neOp2,
        notOp,
        orOp,
        plusOp,
        powerOp,
        rangeOp,
        roundOp,
        sinOp,
        sumOp,
        switchOp,
        yearFracOp,
    ]
}

function buildComparison(image: string, description: string): Signature {
    return new SignatureBuilder()
        .image(image)
        .args([
            buildNumAndArrayUnionArg('element1', '', true),
            buildNumAndArrayUnionArg('element2', '', true),
        ])
        .returnType([ArgType.BOOLEAN])
        .description(description)
        .build()
}

export const TYPE2_REGISTRY = buildType2Registry()

// tslint:disable-next-line: max-func-body-length
function buildType2Registry(): readonly Signature[] {
    /**
     * {ref}.count()
     */
    const countOp = new SignatureBuilder()
        .image('.count')
        .returnType([ArgType.NUMBER, ArgType.ARRAY])
        .description('计算区域中包含数值的个数')
        .build()
    /**
     * {ref}.average()
     */
    const averageOp = new SignatureBuilder()
        .image('.average')
        .returnType([ArgType.NUMBER, ArgType.ARRAY])
        .description('计算区域中数值的算术平均数')
        .build()
    /**
     * {ref}.max()
     */
    const maxOp = new SignatureBuilder()
        .image('.max')
        .returnType([ArgType.NUMBER, ArgType.ARRAY])
        .description('计算区域中所有数值的最大值')
        .build()
    /**
     * {ref}.min()
     */
    const minOp = new SignatureBuilder()
        .image('.min')
        .returnType([ArgType.NUMBER, ArgType.ARRAY])
        .description('计算区域中所有数值的最小值')
        .build()
    /**
     * {ref}.sum()
     */
    const sumOp = new SignatureBuilder()
        .image('.sum')
        .returnType([ArgType.NUMBER, ArgType.ARRAY])
        .description('计算区域中所有数值的和')
        .build()
    return [
        averageOp,
        countOp,
        maxOp,
        minOp,
        sumOp,
    ]
}

export const TYPE3_REGISTRY = buildType3Registry()

function buildType3Registry(): readonly Signature[] {
    /**
     * {ref}.lag(date)
     */
    const lagOp = new SignatureBuilder()
        .image('.lag')
        .args([buildDateArg('时期')])
        .returnType([ArgType.ARRAY])
        .description('将一组数列右移若干个单位')
        .build()
    /**
     * {ref}.lead(date)
     */
    const leadOp = new SignatureBuilder()
        .image('.lead')
        .args([buildDateArg('时期')])
        .returnType([ArgType.ARRAY])
        .description('将一组数列左移若干个单位')
        .build()
    return [lagOp, leadOp]
}

export const TYPE4_REGISTRY = buildType4Registry()

// tslint:disable-next-line: max-func-body-length
function buildType4Registry(): readonly Signature[] {
    /**
     * irr(array)
     */
    const irrOp = new SignatureBuilder()
        .image('irr')
        .args([buildArrayArg(
            '现金流数额',
            '其中含有投资相关收益或支出的数组或范围（现金流数额中必须至少包含一项负的和一项正的现金流金额才能计算回报率）',
        )])
        .returnType([ArgType.NUMBER])
        .description('返回一系列现金流的内部收益率')
        .build()
    /**
     * npv(number, array)
     */
    const npvOp = new SignatureBuilder()
        .image('npv')
        .args([
            buildNumberArg('贴现率', '一个期间内的投资贴现率'),
            buildArrayArg('现金流', '未来现金流'),
        ])
        .returnType([ArgType.NUMBER])
        .description('根据收支现金流和贴现率,返回净限值')
        .build()
    const xirrOp = new SignatureBuilder()
        .image('xirr')
        .args([
            buildArrayArg(
                '现金流数额',
                '其中含有投资相关收益或支出的数组或范围(现金流数额中必须至少包含一项负的和一项正的现金流金额才能计算回报率)',
            ),
            buildArrayArg('现金流日期', '与现金流数额参数中的现金流对应的日期数组或范围'),
            buildNumberArg('收益率估值', '对内部回报率的估算值（默认值为0.1）', false),
        ])
        .returnType([ArgType.NUMBER])
        .description('计算一连续期间现金流的内部收益率')
        .build()
    const xnpvOp = new SignatureBuilder()
        .image('xnpv')
        .args([
            buildNumberArg('贴现率', '一个期间内的投资贴现率'),
            buildArrayArg('现金流数额', '其中含有投资相关收益或支出的单元格范围'),
            buildArrayArg('现金流日期', '与现金流数额参数中的现金流对应的日期值单元格范围'),
        ])
        .returnType([ArgType.NUMBER])
        .description('计算净现值')
        .build()
    return [
        irrOp,
        npvOp,
        xirrOp,
        xnpvOp,
    ]
}

export const TYPE5_REGISTRY = buildType5Registry()

function buildType5Registry(): readonly Signature[] {
    /**
     * empty()
     */
    const emptyOp = new SignatureBuilder()
        .image('empty')
        .returnType([])
        .description('')
        .build()
    return [emptyOp]
}

export const TYPE6_REGISTRY = buildType6Registry()

function buildType6Registry(): readonly Signature[] {
    /**
     * ref[slice]
     */
    const sliceOp = new SignatureBuilder()
        .image('[]')
        .args([buildArrayArg()])
        .returnType([ArgType.ARRAY, ArgType.MATRIX])
        .description('')
        .build()
    return [sliceOp]
}

export const TYPE7_REGISTRY = buildType7Registry()

function buildType7Registry(): readonly Signature[] {
    /**
     * {ref}.year()
     */
    const yearOp = new SignatureBuilder()
        .image('.year')
        .returnType([ArgType.ARRAY])
        .description('返回日期的年份值')
        .build()
    /**
     * {ref}.day()
     */
    const dayOp = new SignatureBuilder()
        .image('.day')
        .returnType([ArgType.ARRAY])
        .description('返回日期的日期值')
        .build()
    return [yearOp, dayOp]
}

export const TYPE8_REGISTRY = buildType8Registry()

function buildType8Registry(): readonly Signature[] {
    /**
     * {ref}.linear(number, number)
     */
    const linearOp = new SignatureBuilder()
        .image('.linear')
        .args([
            buildNumberArg('起始值'),
            buildNumberArg('终止值'),
        ])
        .returnType([ArgType.ARRAY])
        .description('根据起始值和终止值返回一组等差数列')
        .build()
    return [linearOp]
}

export const TYPE9_REGISTRY = buildType9Registry()

function buildType9Registry(): readonly Signature[] {
    /**
     * ref[slice1::slice2]
     */
    const rangeOp = new SignatureBuilder()
        .image('[::]')
        .args([buildArrayArg()])
        .returnType([ArgType.ARRAY])
        .description('')
        .build()
    return [rangeOp]
}

export const EXTERNAL_REGISTRY = buildExternalRegistry()

// tslint:disable-next-line: max-func-body-length
function buildExternalRegistry(): readonly Signature[] {
    /**
     * averageifv({ref1}, {ref2}) =
     *     sum(iferror({ref1, 0}, iferror({ref2, 0}))) / count({ref1}, {ref2})
     */
    const averageifv1 = new SignatureBuilder()
        .image('averageifv')
        .args([
            buildNumAndArrayUnionArg('值1', '计算平均值时用到的数值或范围'),
            buildNumAndArrayUnionArg('值2', '计算平均值时用到的数值或范围'),
        ])
        .returnType([ArgType.ARRAY])
        .description('返回算术平均值,忽略空值与错误')
        .build()
    /**
     * {a}.averageifv() = iferror({a}, 0).sum() / {a}.count()
     */
    const averageifv2 = new SignatureBuilder()
        .image('.averageifv')
        .returnType([ArgType.NUMBER])
        .description('返回算术平均值,忽略空值与错误')
        .build()
    /**
     * {ref}.diff(constant) = {ref} - {ref}.lag(constant)
     */
    const diff = new SignatureBuilder()
        .image('.diff')
        .args([buildDateArg('时期', '计算中要使用的开始日期-结束日期')])
        .returnType([ArgType.ARRAY])
        .description('计算两个日期之间的天数、月数或年数')
        .build()
    /**
     * {ref}.growth() = {ref} / {ref}.lag(1) - 1
     */
    const growth = new SignatureBuilder()
        .image('.growth')
        .returnType([ArgType.ARRAY])
        .description('')
        .build()
    /**
     * {ref}.averageprevious(date) = {ref}[__dp${date}__].average()
     */
    const averageprevious = new SignatureBuilder()
        .image('.averageprevious')
        .args([buildDateArg('时间', '')])
        .returnType([ArgType.ARRAY])
        .description('计算在此之前一段时间范围内的值的平均值')
        .build()

    const previous = new SignatureBuilder()
        .image('.previous')
        .args([
            buildDateArg('时间', ''),
        ])
        .description('取在此之前一段时间范围内的值')
        .returnType([ArgType.MATRIX])
        .build()

    const latter = new SignatureBuilder()
        .image('.latter')
        .args([
            buildDateArg('时间', ''),
        ])
        .description('取在此之后一段时间范围内的值')
        .returnType([ArgType.MATRIX])
        .build()

    const years = new SignatureBuilder()
        .image('.years')
        .returnType([ArgType.MATRIX])
        .description('取当前时间范围内的所有年度')
        .build()

    const halfyears = new SignatureBuilder()
        .image('.halfyears')
        .returnType([ArgType.MATRIX])
        .description('取当前时间范围内的所有半年度')
        .build()
    const quarters = new SignatureBuilder()
        .image('.quarters')
        .returnType([ArgType.MATRIX])
        .description('取当前时间范围内的所有季度')
        .build()

    const months = new SignatureBuilder()
        .image('.months')
        .returnType([ArgType.MATRIX])
        .description('取当前时间范围内的所有月度')
        .build()

    return [
        averageifv1,
        averageifv2,
        averageprevious,
        diff,
        growth,
        latter,
        previous,
        years,
        halfyears,
        quarters,
        months,
    ]
}

export const REGISTRY: readonly Signature[] = [
    ...TYPE1_REGISTRY,
    ...TYPE2_REGISTRY,
    ...TYPE3_REGISTRY,
    ...TYPE4_REGISTRY,
    ...TYPE5_REGISTRY,
    ...TYPE6_REGISTRY,
    ...TYPE7_REGISTRY,
    ...TYPE8_REGISTRY,
    ...TYPE9_REGISTRY,
    ...EXTERNAL_REGISTRY,
]
// tslint:disable-next-line: max-file-line-count
