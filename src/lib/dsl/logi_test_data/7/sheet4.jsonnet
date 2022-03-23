local defs = import '../defs.jsonnet';

local table = defs.Table('Data Prepare', {
    subnodes: [
        defs.Col('2014', { labels: ['hist'] }),
        defs.Col('2015', { labels: ['hist'] }),
        defs.Col('2016', { labels: ['hist'] }),
        defs.Col('2017', { labels: ['hist'] }),
        defs.Col('2018', { labels: ['hist'] }),
        defs.Row('营业费用', {
            expression: 'SUM({销售费用},{管理费用},{研发费用},{其他营业费用})',
        }),
        defs.Row('销售费用', {
            expression: '',
            modifier: '--',
            sources: [0.54014, 0.80787, 1.13, 2.01, 4.55],
        }),
        defs.Row('管理费用', {
            expression: '',
            modifier: '--',
            sources: [0.58951, 0.91797, 1.64, 4.6, 7.53],
        }),
        defs.Row('研发费用', {
            expression: '',
            modifier: '--',
            sources: [0.3413, 0.76153, 1.09, 1.26, 2.19],
        }),
        defs.Row('其他营业费用', {
            expression: '',
            modifier: '--',
            sources: [0.54241, 0.26143, 0.24679, 0.11855, 0.02502],
        }),
        defs.Row('', {
        }),
        defs.Row('非经常性损益', {
            expression: 'SUM({公允价值变动及减值准备},{其他收入},{营业外收入})',
        }),
        defs.Row('公允价值变动及减值准备', {
            expression: '',
            modifier: '--',
            sources: [0, 0, 0, 0, 0.26248],
        }),
        defs.Row('其他收入', {
            expression: '',
            modifier: '--',
            sources: [0.82738, 0.14702, 0.12787, 0.52389, 0.28334],
        }),
        defs.Row('营业外收入', {
            expression: '',
            modifier: '--',
            sources: [0, 0, 0.04567, 0.00004, 0.12432],
        }),
        defs.Row('', {
        }),
        defs.Row('新增或出售固定资产', {
            expression: '{新增固定资产}-{出售固定资产}',
        }),
        defs.Row('新增固定资产', {
            expression: '',
            modifier: '--',
            sources: [0.03481, 0.08736, 0.0214, 0.05731, 0.06102],
        }),
        defs.Row('出售固定资产', {
            expression: '',
            modifier: '--',
            sources: [0.00118, 0, 0.00076, 0.00013, 0.00048],
        }),
        defs.Row('净新增投资', {
            expression: '{新增投资}-{减少投资}',
        }),
        defs.Row('新增投资', {
            expression: '',
            sources: [0, 0, 3.5, 5.39, 32.75],
        }),
        defs.Row('减少投资', {
            expression: '',
            sources: [0, 0, 0, 0, 0],
        }),
        defs.Row('', {
        }),
        defs.Row('筹资活动现金流量', {
            expression: '',
            sources: [10.61, 0, 1.93, 12.48, 17.08],
        }),
        defs.Row('收到其他与筹资活动相关的现金', {
            expression: '{筹资活动现金流量}-{DCF模型!现金流量表!借款净增加}-{DCF模型!现金流量表!股权融资}-{DCF模型!现金流量表!利息净收入}+{DCF模型!现金流量表!已付股息}',
        }),
        defs.Row('经营活动现金流量', {
            expression: '',
            sources: [-0.55387, -1.17, -2.26, -0.70272, 3.96],
        }),
        defs.Row('经营活动现金流入', {
            expression: '{细项分解!经营活动现金流量!间接法经营活动现金流入}',
        }),
        defs.Row('经营活动现金流出', {
            expression: '-{经营活动现金流量}+{Data Prepare!Data Prepare!经营活动现金流入}',
        }),
        defs.Row('经营活动现金流量间接法计算误差', {
            expression: '{细项分解!经营活动现金流量!间接法计算误差}',
        }),
        defs.Row('投资活动现金流量', {
            expression: '',
            sources: [0.35177, -4.21, -1.59, -12.11, -23.96],
        }),
        defs.Row('其他投资活动现金流量', {
            expression: '{投资活动现金流量}+{Data Prepare!Data Prepare!净新增投资}+{Data Prepare!Data Prepare!新增或出售固定资产}',
        }),
        defs.Row('利息净收入', {
            expression: '{已收利息}-{已付利息}',
        }),
        defs.Row('已收利息', {
            expression: '',
            sources: [0.14874, 0.14164, 0.09088, 0.08836, 0.32486],
        }),
        defs.Row('已付利息', {
            expression: '',
            sources: [0, 0, 0.06584, 0.10428, 0.10624],
        }),
        defs.Row('贷款净增加', {
            expression: '{新增贷款}-{偿还贷款}',
        }),
        defs.Row('新增贷款', {
            expression: '',
            sources: [0, 0, 2, 5.96, 23.04],
        }),
        defs.Row('偿还贷款', {
            expression: '',
            sources: [0, 0, 0.00735, 7.96, 6.04],
        }),
        defs.Row('汇率变化对现金及现金等价物的影响及其他现金流量', {
            expression: '{DCF模型!资产负债表!流动资产小计!现金及现金等价物}-{DCF模型!资产负债表!流动资产小计!现金及现金等价物}.lag(1Y) - {DCF模型!现金流量表!现金及现金等价物增加或减少}[hist]',
        }),
        defs.Row('', {
        }),
        defs.Row('所有者权益合计', {
            expression: 'SUM({股本总额},{股份溢价},{资本储备及其他储备},{未分配利润},{少数股东权益},{其他权益})',
        }),
        defs.Row('股本总额', {
            expression: '',
            sources: [0.72305, 0.72305, 0.72481, 0.86617, 1.03],
        }),
        defs.Row('股份溢价', {
            expression: '',
            sources: [18.64, 18.64, 19.07, 72.56, 199.67],
        }),
        defs.Row('资本储备及其他储备', {
            expression: '',
            sources: [0.95766, 1.83, 3.03, -35.59, -159.95],
        }),
        defs.Row('未分配利润', {
            expression: '',
            sources: [-7.06, -8.98, -11.05, -12.03, -12.81],
        }),
        defs.Row('少数股东权益', {
            expression: '',
            sources: [-0.58729, -0.66089, -0.58174, -0.57191, -0.57693],
        }),
        defs.Row('其他权益', {
            expression: '',
            sources: [0, 0, 0, 0, 0],
        }),
    ],
});

local sheet = defs.Sheet(
    'Data Prepare', {
        subnodes: [table],
    }
);

sheet
