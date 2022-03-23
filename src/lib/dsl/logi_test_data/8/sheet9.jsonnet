local defs = import '../defs.jsonnet';

local table1 = defs.Table('balance_cn.csv', {
    subnodes: [
        defs.Row('货币资金', {
            is_def_scalar: false,
            sources: [
                277.1071768021,
                368.0074989506,
                668.5496211822,
                878.6886991334,
                1120.7479142006,
            ],
        }),
        defs.Row('交易性金融资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应收票据', {
            is_def_scalar: false,
            sources: [
                18.4783861783,
                85.7893540682,
                8.17627172,
                12.21706039,
                5.6373971,
            ],
        }),
        defs.Row('应收账款', {
            is_def_scalar: false,
            sources: [
                0.043061612400000004,
                0.0023076889000000003,
                0,
                0,
                0,
            ],
        }),
        defs.Row('预付款项', {
            is_def_scalar: false,
            sources: [
                28.642104042800003,
                14.777348599000002,
                10.4610069692,
                7.9080732207,
                11.823785080599999,
            ],
        }),
        defs.Row('其他应收款', {
            is_def_scalar: false,
            sources: [
                0.8088892058,
                0.4821901875,
                0.7722756537000001,
                0.3132346335,
                3.9389049312,
            ],
        }),
        defs.Row('应收关联公司款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应收利息', {
            is_def_scalar: false,
            sources: [
                0.8060292232999999,
                0.8534705147,
                1.4090485687999998,
                2.4145861588999997,
                3.4388994447,
            ],
        }),
        defs.Row('应收股利', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('存货', {
            is_def_scalar: false,
            sources: [
                149.8236436785,
                180.13297022700002,
                206.2225182555,
                220.57481376459998,
                235.06950842220002,
            ],
        }),
        defs.Row('消耗性生物资产消耗性生物资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('一年内到期的非流动资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('流动资产合计', {
            is_def_scalar: false,
            sources: [
                475.7092907432,
                650.0451402358999,
                901.8054880557,
                1122.491859616,
                1378.6183530757,
            ],
        }),
        defs.Row('可供出售金融资产', {
            is_def_scalar: false,
            sources: [
                0.04,
                0.29,
                0.29,
                0.29,
                0.29,
            ],
        }),
        defs.Row('持有至到期投资', {
            is_def_scalar: false,
            sources: [
                0.6,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('长期应收款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('长期股权投资', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('投资性房地产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('固定资产', {
            is_def_scalar: false,
            sources: [
                103.7575777159,
                114.1595318972,
                144.5317743934,
                152.4409663202,
                152.4855658502,
            ],
        }),
        defs.Row('在建工程', {
            is_def_scalar: false,
            sources: [
                34.2177444802,
                48.951507165100004,
                27.4557999568,
                20.1640500577,
                19.5432296868,
            ],
        }),
        defs.Row('工程物资', {
            is_def_scalar: false,
            sources: [
                0.0026085592,
                0.0026085592,
                0,
                0,
                0,
            ],
        }),
        defs.Row('固定资产清理', {
            is_def_scalar: false,
            sources: [
                0,
                0.0068259404,
                0,
                0,
                0,
            ],
        }),
        defs.Row('生产性生物资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('油气资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('无形资产', {
            is_def_scalar: false,
            sources: [
                35.8262368224,
                35.8246243104,
                35.317406256,
                34.5862223938,
                34.9917537452,
            ],
        }),
        defs.Row('开发支出', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('商誉', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('长期待摊费用', {
            is_def_scalar: false,
            sources: [
                0.0540828683,
                1.9860353781,
                1.8811877651,
                1.7785967454,
                1.6841467877,
            ],
        }),
        defs.Row('递延所得税资产', {
            is_def_scalar: false,
            sources: [
                8.216011057100001,
                11.5533607414,
                17.4553912068,
                14.0179736177,
                10.4929482145,
            ],
        }),
        defs.Row('非流动资产合计', {
            is_def_scalar: false,
            sources: [
                183.0223615031,
                212.9694939918,
                227.5398947484,
                223.6093091348,
                219.84839428439997,
            ],
        }),
        defs.Row('资产总计', {
            is_def_scalar: false,
            sources: [
                658.7316522463,
                863.0146342277001,
                1129.3453828041,
                1346.1011687508,
                1598.4667473601,
            ],
        }),
        defs.Row('短期借款', {
            is_def_scalar: false,
            sources: [
                0.62552484,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('交易性金融负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应付票据', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应付账款', {
            is_def_scalar: false,
            sources: [
                7.0753464754,
                8.8097607209,
                10.406082031799999,
                9.9205591047,
                0,
            ],
        }),
        defs.Row('预收款项', {
            is_def_scalar: false,
            sources: [
                14.7623309609,
                82.6158207304,
                175.4108223701,
                144.2910690238,
                135.7651681344,
            ],
        }),
        defs.Row('应付职工薪酬', {
            is_def_scalar: false,
            sources: [
                9.8864384256,
                9.754777470599999,
                16.285072520299998,
                19.0164419364,
                20.3451465891,
            ],
        }),
        defs.Row('应交税费', {
            is_def_scalar: false,
            sources: [
                21.051781658699998,
                25.1551615683,
                42.7228919457,
                77.26135741899999,
                107.7107596685,
            ],
        }),
        defs.Row('应付利息', {
            is_def_scalar: false,
            sources: [
                0.1536519791,
                0.274094474,
                0.3448163533,
                0.23414593670000003,
                0.4277045184,
            ],
        }),
        defs.Row('应付股利', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他应付款', {
            is_def_scalar: false,
            sources: [
                12.318862403499999,
                14.231392059300001,
                17.246385714400002,
                30.399483038000003,
                34.0477107233,
            ],
        }),
        defs.Row('应付关联公司款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('一年内到期的非流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('流动负债合计', {
            is_def_scalar: false,
            sources: [
                105.4384438351,
                200.5172300148,
                370.2042542569,
                385.749194,
                424.3818681348,
            ],
        }),
        defs.Row('长期借款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应付债券', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('长期应付款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('专项应付款', {
            is_def_scalar: false,
            sources: [
                0.1777,
                0.1557,
                0.1557,
                0.1557,
                0,
            ],
        }),
        defs.Row('预计负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('递延所得税负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('非流动负债合计', {
            is_def_scalar: false,
            sources: [
                0.1777,
                0.1557,
                0.1557,
                0.1557,
                0,
            ],
        }),
        defs.Row('负债合计', {
            is_def_scalar: false,
            sources: [
                105.6161438351,
                200.6729300148,
                370.35995425690004,
                385.904894,
                424.3818681348,
            ],
        }),
        defs.Row('实收资本（或股本）', {
            is_def_scalar: false,
            sources: [
                11.41998,
                12.561978,
                12.561978,
                12.561978,
                12.561978,
            ],
        }),
        defs.Row('资本公积', {
            is_def_scalar: false,
            sources: [
                13.7496441572,
                13.7496441572,
                13.7496441572,
                13.7496441572,
                13.7496441572,
            ],
        }),
        defs.Row('专项储备', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('盈余公积', {
            is_def_scalar: false,
            sources: [
                52.4940723462,
                62.1052449754,
                71.3564996312,
                82.1559550969,
                134.4422124484,
            ],
        }),
        defs.Row('库存股', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('未分配利润', {
            is_def_scalar: false,
            sources: [
                455.6605733737,
                548.7896449776999,
                627.1780803661001,
                800.1130745033,
                959.8194395355999,
            ],
        }),
        defs.Row('归属于母公司所有者权益', {
            is_def_scalar: false,
            sources: [
                534.3040244609,
                639.2597843899,
                728.9413778325,
                914.5152282896,
                1128.3856433205,
            ],
        }),
        defs.Row('少数股东权益', {
            is_def_scalar: false,
            sources: [
                18.8114839503,
                23.081919823000003,
                30.0440507147,
                45.6810464612,
                45.6992359048,
            ],
        }),
        defs.Row('外币报表折算价差', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('非正常经营项目收益调整', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('所有者权益（或股东权益）合计', {
            is_def_scalar: false,
            sources: [
                553.1155084112,
                662.3417042129,
                758.9854285472001,
                960.1962747508001,
                1174.0848792253,
            ],
        }),
        defs.Row('负债和所有者权益（或股东权益）合计', {
            is_def_scalar: false,
            sources: [
                658.7316522463,
                863.0146342277001,
                1129.3453828041,
                1346.1011687508,
                1598.4667473601,
            ],
        }),
        defs.Row('其他综合收益', {
            is_def_scalar: false,
            sources: [
                -0.0061904399,
                -0.1303407547,
                -0.1124084156,
                -0.074015764,
                -0.070657257,
            ],
        }),
        defs.Row('递延收益_非流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('结算备付金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('拆出资金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                3.9,
                0,
                0,
            ],
        }),
        defs.Row('发放贷款及垫款_流动资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('衍生金融资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应收保费', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应收分保账款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应收分保合同准备金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('买入返售金融资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('划分为持有待售的资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('发放贷款及垫款_非流动资产', {
            is_def_scalar: false,
            sources: [
                0,
                0.195,
                0.6083351703000001,
                0.3315,
                0.36075,
            ],
        }),
        defs.Row('向中央银行借款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('吸收存款及同业存放', {
            is_def_scalar: false,
            sources: [
                0,
                59.6762229913,
                107.7881833213,
                104.6261375414,
                114.7301188536,
            ],
        }),
        defs.Row('拆入资金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('衍生金融负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('卖出回购金融资产款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应付手续费及佣金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('应付分保账款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('保险合同准备金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('代理买卖证券款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('代理承销证券款', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('划分为持有待售的负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('预计负债_流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('递延收益_流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('优先股_非流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('永续债_非流动负债', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('长期应付职工薪酬', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他权益工具', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其中：优先股_所有者权益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('永续债_所有者权益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('总资产误差项', {
            is_def_scalar: false,
            sources: [
                -3.814697265625e-14,
                7.62939453125e-14,
                -3.814697265625e-14,
                -3.814697265625e-14,
                3.814697265625e-14,
            ],
        }),
        defs.Row('其他流动资产杂项', {
            is_def_scalar: false,
            sources: [
                3.2782554626464802e-15,
                -1.16229057312012e-14,
                6.214745706300071,
                0.375392314900106,
                -2.03805610359991,
            ],
        }),
        defs.Row('其他非流动资产杂项', {
            is_def_scalar: false,
            sources: [
                0.30810000000000803,
                0.195000000000007,
                0.6083351702999971,
                0.331499999999986,
                0.360749999999979,
            ],
        }),
        defs.Row('总负债误差项', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他流动负债杂项', {
            is_def_scalar: false,
            sources: [
                40.1900319319,
                59.6762229913,
                107.7881833213,
                104.6261375414,
                126.08537850110001,
            ],
        }),
        defs.Row('其他非流动负债杂项', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他应计入所有者权益的杂项', {
            is_def_scalar: false,
            sources: [
                19.7912385341,
                25.1351921026,
                34.1392263927,
                51.6156229934,
                53.5116050841,
            ],
        }),
        defs.Row('资产负债表配平误差项', {
            is_def_scalar: false,
            sources: [
                7.62939453125e-14,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Col('2014', {}),
        defs.Col('2015', {}),
        defs.Col('2016', {}),
        defs.Col('2017', {}),
        defs.Col('2018', {}),
    ],
});

local table2 = defs.Table('cashflow_cn.csv', {
    subnodes: [
        defs.Row('销售商品、提供劳务收到的现金', {
            is_def_scalar: false,
            sources: [
                333.8483571404,
                370.8307183558,
                610.1296410254,
                644.2147934302,
                842.6869573262,
            ],
        }),
        defs.Row('收到的税费返还', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('经营活动现金流入小计', {
            is_def_scalar: false,
            sources: [
                354.87849677459997,
                400.1390685005,
                672.7914563793,
                673.6946251181,
                893.4563539869999,
            ],
        }),
        defs.Row('购买商品、接受劳务支付的现金', {
            is_def_scalar: false,
            sources: [
                28.3802840497,
                29.6773263037,
                27.7302040327,
                48.7576850416,
                52.985180325500004,
            ],
        }),
        defs.Row('支付给职工以及为职工支付的现金', {
            is_def_scalar: false,
            sources: [
                33.9360975687,
                45.36877341100001,
                46.7415423666,
                54.89606122479999,
                66.5313773366,
            ],
        }),
        defs.Row('支付的各项税费', {
            is_def_scalar: false,
            sources: [
                144.9645081241,
                140.0304893321,
                175.105163312,
                230.6564850305,
                320.3217812592,
            ],
        }),
        defs.Row('经营活动现金流出小计', {
            is_def_scalar: false,
            sources: [
                228.5532724086,
                225.77566708330002,
                298.2789599088,
                452.1642642768,
                479.60400991980003,
            ],
        }),
        defs.Row('经营活动现金流量净额', {
            is_def_scalar: false,
            sources: [
                126.325224366,
                174.3634014172,
                374.5124964705,
                221.53036084130002,
                413.8523440672,
            ],
        }),
        defs.Row('收回投资收到的现金', {
            is_def_scalar: false,
            sources: [
                0.05,
                0.6005,
                0,
                0,
                0,
            ],
        }),
        defs.Row('取得投资收益收到的现金', {
            is_def_scalar: false,
            sources: [
                0.0309526575,
                0.0386917205,
                0,
                0,
                0,
            ],
        }),
        defs.Row('处置固定资产、无形资产和其他长期资产收回的', {
            is_def_scalar: false,
            sources: [
                0.1022693939,
                0.0877293739,
                0.000920845,
                0.0001645,
                0,
            ],
        }),
        defs.Row('处置子公司及其他营业单位收到的现金净额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('投资活动现金流入小计', {
            is_def_scalar: false,
            sources: [
                1.2504905714,
                1.0604999549,
                0.0565443569,
                0.2144712295,
                0.112441813,
            ],
        }),
        defs.Row('购建固定资产、无形资产和其他长期资产支付的', {
            is_def_scalar: false,
            sources: [
                44.3106506605,
                20.6147048132,
                10.1917813692,
                11.2501719245,
                16.0675022628,
            ],
        }),
        defs.Row('投资支付的现金', {
            is_def_scalar: false,
            sources: [
                0.15,
                0.2505,
                0,
                0,
                0,
            ],
        }),
        defs.Row('质押贷款净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('取得子公司及其他营业单位支付的现金净额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('投资活动现金流出小计', {
            is_def_scalar: false,
            sources: [
                47.0520863733,
                21.5484026008,
                11.081552398900001,
                11.4209233755,
                16.4020688586,
            ],
        }),
        defs.Row('投资活动现金流量净额', {
            is_def_scalar: false,
            sources: [
                -45.80159580189999,
                -20.4879026459,
                -11.025008042,
                -11.206452145999998,
                -16.2896270456,
            ],
        }),
        defs.Row('吸收投资收到的现金', {
            is_def_scalar: false,
            sources: [
                0.348,
                0,
                0.16,
                0.06,
                0,
            ],
        }),
        defs.Row('取得借款收到的现金', {
            is_def_scalar: false,
            sources: [
                0.67382607,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('发行债券收到的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('筹资活动现金流入小计', {
            is_def_scalar: false,
            sources: [
                1.02182607,
                0.22,
                0.16,
                0.06,
                0,
            ],
        }),
        defs.Row('偿还债务支付的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0.55917672,
                0,
                0,
                0,
            ],
        }),
        defs.Row('分配股利、利润或偿付利息支付的现金', {
            is_def_scalar: false,
            sources: [
                51.2160933633,
                55.5410196661,
                83.5051225223,
                89.051778808,
                164.4109316006,
            ],
        }),
        defs.Row('筹资活动现金流出小计', {
            is_def_scalar: false,
            sources: [
                51.436093363299996,
                56.100196386099995,
                83.5051225223,
                89.051778808,
                164.4109316006,
            ],
        }),
        defs.Row('筹资活动现金流量净额', {
            is_def_scalar: false,
            sources: [
                -50.4142672933,
                -55.880196386099996,
                -83.3451225223,
                -88.99177880799999,
                -164.4109316006,
            ],
        }),
        defs.Row('汇率变动对现金的影响', {
            is_def_scalar: false,
            sources: [
                -0.054491669900000005,
                -0.1627353171,
                0.000723178,
                0.0007294886,
                0.00029006860000000003,
            ],
        }),
        defs.Row('其他原因对现金的影响', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('现金及现金等价物净增加额', {
            is_def_scalar: false,
            sources: [
                30.054869600900002,
                97.83256706809999,
                280.14308908419997,
                121.3328593759,
                233.15207548959998,
            ],
        }),
        defs.Row('期初现金及现金等价物余额', {
            is_def_scalar: false,
            sources: [
                219.9174223767,
                249.97229197759998,
                347.80485904569997,
                627.9479481298999,
                749.2808075058,
            ],
        }),
        defs.Row('期末现金及现金等价物余额', {
            is_def_scalar: false,
            sources: [
                249.97229197759998,
                347.80485904569997,
                627.9479481298999,
                749.2808075058,
                982.4328829954,
            ],
        }),
        defs.Row('净利润', {
            is_def_scalar: false,
            sources: [
                162.6937150983,
                164.5499662522,
                179.3064310988,
                290.06423236,
                378.29617756809995,
            ],
        }),
        defs.Row('资产减值准备', {
            is_def_scalar: false,
            sources: [
                0.0043274588000000004,
                -0.0054031339,
                0.1232749622,
                -0.0805370395,
                0.0128968501,
            ],
        }),
        defs.Row('固定资产折旧、油气资产折耗、生产性生物资产折旧', {
            is_def_scalar: false,
            sources: [
                6.7534978698,
                7.6145867829,
                8.427280720399999,
                10.3505273345,
                10.846627285799999,
            ],
        }),
        defs.Row('无形资产摊销', {
            is_def_scalar: false,
            sources: [
                0.7760752320000001,
                0.7988327042,
                0.8045789599,
                0.8052270576999999,
                0.8043166722,
            ],
        }),
        defs.Row('长期待摊费用摊销', {
            is_def_scalar: false,
            sources: [
                0.0384265048,
                0.06804749019999999,
                0.1100870417,
                0.10259101970000001,
                0.10331100619999999,
            ],
        }),
        defs.Row('处置固定资产、无形资产和其他长期资产的损失', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('固定资产报废损失', {
            is_def_scalar: false,
            sources: [
                0.8511958331999999,
                -0.00017419860000000002,
                0.0186986913,
                0.032918955,
                0.0180893093,
            ],
        }),
        defs.Row('公允价值变动损失', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('财务费用', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('投资损失', {
            is_def_scalar: false,
            sources: [
                -0.0309526575,
                -0.038692769,
                0,
                0,
                0,
            ],
        }),
        defs.Row('递延所得税资产减少', {
            is_def_scalar: false,
            sources: [
                0.0377141894,
                -3.3373496843,
                -5.902030465399999,
                3.4374175891000003,
                3.5250254032,
            ],
        }),
        defs.Row('递延所得税负债增加', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('存货的减少', {
            is_def_scalar: false,
            sources: [
                -31.455541288200003,
                -30.3093265485,
                -26.089548028499998,
                -14.352295509100001,
                -14.4946946576,
            ],
        }),
        defs.Row('经营性应收项目的减少', {
            is_def_scalar: false,
            sources: [
                -15.1798242056,
                -67.0517783934,
                76.6965056584,
                -4.5872852399,
                5.2566501445,
            ],
        }),
        defs.Row('经营性应付项目的增加', {
            is_def_scalar: false,
            sources: [
                1.836590331,
                102.07469291540001,
                141.0172178317,
                -64.2424356862,
                29.4839444854,
            ],
        }),
        defs.Row('其他', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('经营活动现金流量净额_间接法', {
            is_def_scalar: false,
            sources: [
                126.325224366,
                174.3634014172,
                374.5124964705,
                221.53036084130002,
                413.8523440672,
            ],
        }),
        defs.Row('债务转为资本', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('一年内到期的可转换公司债券', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('融资租入固定资产', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('现金的期末余额', {
            is_def_scalar: false,
            sources: [
                249.97229197759998,
                347.80485904569997,
                627.9479481298999,
                749.2808075058,
                982.4328829954,
            ],
        }),
        defs.Row('现金的期初余额', {
            is_def_scalar: false,
            sources: [
                219.9174223767,
                249.97229197759998,
                347.80485904569997,
                627.9479481298999,
                749.2808075058,
            ],
        }),
        defs.Row('现金等价物的期末余额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('现金等价物的期初余额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他原因对现金的影响_间接法', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('现金及现金等价物净增加额_间接法', {
            is_def_scalar: false,
            sources: [
                30.054869600900002,
                97.83256706809999,
                280.14308908419997,
                121.3328593759,
                233.15207548959998,
            ],
        }),
        defs.Row('客户存款和同业存放款项净增加额', {
            is_def_scalar: false,
            sources: [
                11.8326160965,
                20.1117158994,
                48.11196033,
                -3.1620457799,
                10.1039813122,
            ],
        }),
        defs.Row('向中央银行借款净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('向其他金融机构拆入资金净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('收到原保险合同保费取得的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('收到再保险业务现金净额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('保户储金及投资款净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('处置以公允价值计量且其变动计入当期损益的金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('收取利息、手续费及佣金的现金', {
            is_def_scalar: false,
            sources: [
                6.2002297487,
                7.660161832899999,
                12.6584277844,
                27.220255363099998,
                34.4498316657,
            ],
        }),
        defs.Row('拆入资金净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('回购业务资金净增加额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('客户贷款及垫款净增加额', {
            is_def_scalar: false,
            sources: [
                -0.598475,
                -0.116,
                0.42393350799999996,
                -0.283933508,
                0.03,
            ],
        }),
        defs.Row('存放中央银行和同业款项净增加额', {
            is_def_scalar: false,
            sources: [
                -5.0177861156,
                -8.4823182496,
                23.4036243674,
                87.2717006853,
                9.2071395776,
            ],
        }),
        defs.Row('支付原保险合同赔付款项的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('支付利息、手续费及佣金的现金', {
            is_def_scalar: false,
            sources: [
                0.7212263814000001,
                0.6229719696,
                1.1596245533,
                1.4633021672,
                1.1708630902,
            ],
        }),
        defs.Row('支付保单红利的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('子公司吸收少数股东投资收到的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('子公司支付给少数股东的股利、利润', {
            is_def_scalar: false,
            sources: [
                5.8009457797,
                5.1300933272,
                0,
                3.7936340561,
                26.241735492300002,
            ],
        }),
        defs.Row('投资性房地产的折旧及摊销', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('收到其他与经营活动有关的现金', {
            is_def_scalar: false,
            sources: [
                21.0301396342,
                29.308350144699997,
                62.6618153539,
                29.4798316879,
                50.7693966608,
            ],
        }),
        defs.Row('支付其他与经营活动有关的现金', {
            is_def_scalar: false,
            sources: [
                21.2723826661,
                10.6990780365,
                48.7020501975,
                117.8540329799,
                39.7656709985001,
            ],
        }),
        defs.Row('经营活动现金流量净额误差项', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                3.814697265625e-14,
                7.62939453125e-14,
                7.62939453125e-14,
            ],
        }),
        defs.Row('收到其他与投资活动有关的现金', {
            is_def_scalar: false,
            sources: [
                1.06726852,
                0.3335788605,
                0.055623511900000006,
                0.2143067295,
                0.112441813,
            ],
        }),
        defs.Row('支付其他与投资活动有关的现金', {
            is_def_scalar: false,
            sources: [
                2.5914357128,
                0.6831977876,
                0.889771029700001,
                0.170751450999999,
                0.33456659579999903,
            ],
        }),
        defs.Row('投资活动现金流量净额误差项', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('收到其他与筹资活动有关的现金', {
            is_def_scalar: false,
            sources: [
                0,
                0.22,
                0,
                0,
                0,
            ],
        }),
        defs.Row('支付其他与筹资活动有关的现金', {
            is_def_scalar: false,
            sources: [
                0.22,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('筹资活动现金流量净额误差项', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('影响现金和现金等价物的其他杂项', {
            is_def_scalar: false,
            sources: [
                -7.24568963050842e-15,
                -3.72529029846191e-16,
                -5.5313139455393e-14,
                2.51769961323589e-14,
                -1.08337408164516e-13,
            ],
        }),
        defs.Col('2014', {}),
        defs.Col('2015', {}),
        defs.Col('2016', {}),
        defs.Col('2017', {}),
        defs.Col('2018', {}),
    ],
});

local table3 = defs.Table('income_cn.csv', {
    subnodes: [
        defs.Row('营业总收入', {
            is_def_scalar: false,
            sources: [
                322.1721374108,
                334.46859045580004,
                401.5508441293,
                610.6275686616,
                771.9938411022,
            ],
        }),
        defs.Row('营业收入', {
            is_def_scalar: false,
            sources: [
                315.7392853094,
                326.5958372528,
                388.62189993839996,
                582.1786131417,
                736.3887238803,
            ],
        }),
        defs.Row('营业总成本', {
            is_def_scalar: false,
            sources: [
                101.1733575593,
                112.9173635961,
                158.8945924351,
                221.04002079880001,
                258.4407695811,
            ],
        }),
        defs.Row('营业成本', {
            is_def_scalar: false,
            sources: [
                23.3855053233,
                25.383374490599998,
                34.1010408597,
                59.4043637197,
                65.2292183377,
            ],
        }),
        defs.Row('营业税金及附加', {
            is_def_scalar: false,
            sources: [
                27.889944360500003,
                34.491706374,
                65.0892634326,
                84.04214470689999,
                112.8892684697,
            ],
        }),
        defs.Row('销售费用', {
            is_def_scalar: false,
            sources: [
                16.7473345106,
                14.8496151921,
                16.810520229,
                29.860685449899997,
                25.7207687216,
            ],
        }),
        defs.Row('管理费用', {
            is_def_scalar: false,
            sources: [
                33.7849954459,
                38.1285207619,
                41.8718984042,
                47.017955673100005,
                53.2594076224,
            ],
        }),
        defs.Row('堪探费用', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('财务费用', {
            is_def_scalar: false,
            sources: [
                -1.2316879384000001,
                -0.6726680097,
                -0.3317518852,
                -0.5572234618999999,
                -0.0352120923,
            ],
        }),
        defs.Row('资产减值损失', {
            is_def_scalar: false,
            sources: [
                0.0043274588000000004,
                -0.0054031339,
                0.1232749622,
                -0.0805370395,
                0.0128968501,
            ],
        }),
        defs.Row('公允价值变动净收益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('投资收益', {
            is_def_scalar: false,
            sources: [
                0.0309526575,
                0.038692769,
                0,
                0,
                0,
            ],
        }),
        defs.Row('对联营企业和合营企业的投资收益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('汇兑收益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('影响营业利润的其他科目', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('营业利润', {
            is_def_scalar: false,
            sources: [
                221.029732509,
                221.5899196287,
                242.6562516942,
                389.40007533449995,
                513.4298768118,
            ],
        }),
        defs.Row('补贴收入', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('营业外收入', {
            is_def_scalar: false,
            sources: [
                0.0656255218,
                0.048231833200000004,
                0.0855392606,
                0.12201990509999999,
                0.11619526109999999,
            ],
        }),
        defs.Row('营业外支出', {
            is_def_scalar: false,
            sources: [
                2.2719336575,
                1.6210018485,
                3.1629813837,
                2.1213738136,
                5.2700375982,
            ],
        }),
        defs.Row('非流动资产处置净损失', {
            is_def_scalar: false,
            sources: [
                0.8675448123,
                0.0018843942,
                0,
                0,
                0,
            ],
        }),
        defs.Row('影响利润总额的其他科目', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('利润总额', {
            is_def_scalar: false,
            sources: [
                218.8234243733,
                220.0171496134,
                239.5788095711,
                387.40072142599996,
                508.2760344747,
            ],
        }),
        defs.Row('所得税', {
            is_def_scalar: false,
            sources: [
                56.129709275,
                55.4671833612,
                60.2723784723,
                97.336489066,
                129.9798569066,
            ],
        }),
        defs.Row('影响净利润的其他科目', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('净利润', {
            is_def_scalar: false,
            sources: [
                162.6937150983,
                164.5499662522,
                179.3064310988,
                290.06423236,
                378.29617756809995,
            ],
        }),
        defs.Row('归属于母公司所有者的净利润', {
            is_def_scalar: false,
            sources: [
                153.4980432227,
                155.0309027638,
                167.1836273416,
                270.7936025574,
                352.0362526322,
            ],
        }),
        defs.Row('少数股东损益', {
            is_def_scalar: false,
            sources: [
                9.195671875599999,
                9.5190634884,
                12.1228037572,
                19.2706298026,
                26.259924935900003,
            ],
        }),
        defs.Row('每股收益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('基本每股收益', {
            is_def_scalar: false,
            sources: [
                1.222e-7,
                1.234e-7,
                1.331e-7,
                2.156e-7,
                2.802e-7,
            ],
        }),
        defs.Row('稀释每股收益', {
            is_def_scalar: false,
            sources: [
                1.222e-7,
                1.234e-7,
                1.331e-7,
                2.156e-7,
                2.802e-7,
            ],
        }),
        defs.Row('其他综合收益', {
            is_def_scalar: false,
            sources: [
                -0.0061904399,
                -0.12415031480000001,
                0.0179323391,
                0.0383926516,
                0.003358507,
            ],
        }),
        defs.Row('综合收益总额', {
            is_def_scalar: false,
            sources: [
                162.6875246584,
                164.4258159374,
                179.32436343790002,
                290.1026250116,
                378.29953607510004,
            ],
        }),
        defs.Row('归属于母公司所有者的综合收益总额', {
            is_def_scalar: false,
            sources: [
                153.4918527828,
                154.906752449,
                167.2015596807,
                270.831995209,
                352.03961113919996,
            ],
        }),
        defs.Row('归属于少数股东的综合收益总额', {
            is_def_scalar: false,
            sources: [
                9.195671875599999,
                9.5190634884,
                12.1228037572,
                19.2706298026,
                26.259924935900003,
            ],
        }),
        defs.Row('利息收入', {
            is_def_scalar: false,
            sources: [
                6.4308521014,
                7.8654532029999995,
                12.927229096600001,
                28.443106463299998,
                35.596343637,
            ],
        }),
        defs.Row('已赚保费', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('手续费及佣金收入', {
            is_def_scalar: false,
            sources: [
                0.002,
                0.0073,
                0.0017150943,
                0.0058490566,
                0.008773584899999999,
            ],
        }),
        defs.Row('利息支出', {
            is_def_scalar: false,
            sources: [
                0.592172891,
                0.7415961928,
                1.2296104954,
                1.3518779706,
                1.3631777984,
            ],
        }),
        defs.Row('手续费及佣金支出', {
            is_def_scalar: false,
            sources: [
                0.0007655075999999999,
                0.0006217283,
                0.0007359372,
                0.00075378,
                0.0012438735000000001,
            ],
        }),
        defs.Row('退保金', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('赔付支出净额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('提取保险合同准备金净额', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('保单红利支出', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('分保费用', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0,
            ],
        }),
        defs.Row('非流动资产处置利得', {
            is_def_scalar: false,
            sources: [
                0.016348979099999997,
                0.0020585928,
                0,
                0,
                0,
            ],
        }),
        defs.Row('其他收益', {
            is_def_scalar: false,
            sources: [
                0,
                0,
                0,
                0,
                0.09634135,
            ],
        }),
        defs.Row('应计入营业总收入的其他杂项', {
            is_def_scalar: false,
            sources: [
                3.21865081787109e-14,
                3.09944152832031e-14,
                3.8814614526927495e-14,
                5.56942541152239e-14,
                2.632150426507e-14,
            ],
        }),
        defs.Row('其他业务成本', {
            is_def_scalar: false,
            sources: [
                0.5929383986,
                0.7422179211,
                1.2303464326,
                1.3526317506,
                1.3644216719,
            ],
        }),
        defs.Row('应计入营业总成本的其他杂项', {
            is_def_scalar: false,
            sources: [
                9.68575477600098e-16,
                1.4305114746093802e-14,
                5.2154064178466795e-15,
                5.96046447753906e-16,
                1.22189521789551e-14,
            ],
        }),
        defs.Row('其他营业收支', {
            is_def_scalar: false,
            sources: [
                0.0309526575,
                0.038692769,
                0,
                0,
                0,
            ],
        }),
        defs.Row('影响营业利润的其他杂项', {
            is_def_scalar: false,
            sources: [
                0,
                -2.28872522711754e-14,
                -1.9073486328125e-14,
                -0.187472528300056,
                -0.123194709300003,
            ],
        }),
        defs.Row('影响利润总额的其他杂项', {
            is_def_scalar: false,
            sources: [
                0.851195833200003,
                -0.00017419859998778103,
                2.44379043579102e-14,
                1.54972076416016e-14,
                -0.0963413499999911,
            ],
        }),
        defs.Row('影响净利润的其他杂项', {
            is_def_scalar: false,
            sources: [
                1.9073486328125e-14,
                1.9073486328125e-14,
                0,
                0,
                0,
            ],
        }),
        defs.Row('归属于母公司所有者的净利润误差项', {
            is_def_scalar: false,
            sources: [
                -4.76837158203125e-15,
                1.19209289550781e-15,
                1.19209289550781e-14,
                -1.66893005371094e-14,
                -3.814697265625e-14,
            ],
        }),
        defs.Row('影响综合收益总额的其他杂项', {
            is_def_scalar: false,
            sources: [
                2.2887252271175402e-15,
                4.58210706710815e-15,
                -1.52504071593285e-15,
                -1.52736902236938e-15,
                4.5776250772178196e-14,
            ],
        }),
        defs.Row('其他业务收入', {
            is_def_scalar: false,
            sources: [
                6.43285,
                7.872753,
                12.928944,
                28.4489555,
                35.605117,
            ],
        }),
        defs.Row('营业外收支', {
            is_def_scalar: false,
            sources: [
                -3.0575039,
                -1.572595,
                -3.0774421,
                -1.9993539,
                -5.0575,
            ],
        }),
        defs.Col('2014', {}),
        defs.Col('2015', {}),
        defs.Col('2016', {}),
        defs.Col('2017', {}),
        defs.Col('2018', {}),
    ],
});

local sheet = defs.Sheet(
    'data', {
        subnodes: [
            table1,
            table2,
            table3,
        ],
    }
);

sheet
