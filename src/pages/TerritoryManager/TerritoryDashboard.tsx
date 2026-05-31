import { useState, useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import {
  mockChannelPartners as _partnerData,
  mockVisits as _mockVisitsData, mockTasks as _mockTasksData,
  mockPartnerVisits,
} from '../../data/mockData'
import type { PartnerVisit, VisitItem, ChannelPartner, TaskItem } from '../../types'
import AIAssistant from '../../components/AIAssistant/AIAssistant'
import './TerritoryDashboard.css'

interface CompanyVisitRecord {
  id: string; visitDate: string; visitTarget: string; visitType: string;
  attendees: string; summary: string; feedback: string; nextPlan: string;
}

interface AssocCompany {
  id: string; cdbid: string; name: string; industry: string; mainBusiness: string;
  businessScale: string; employeeCount: number; foundedDate: string;
  decisionMakerName: string; decisionMakerPhone: string;
  contactName: string; contactPhone: string;
  isHighValue: boolean; cooperationStatus: '已合作'|'洽谈中'|'待跟进';
  lastVisitDate: string; visitRecords: CompanyVisitRecord[];
}

type AssocMarkerEntry = {
  id: string; name: string; type: string; value: [number, number];
  status: string; address: string; contact: string; contactPhone: string; memberCount: number;
  signedPartner?: string;
}

const assocMarkerData: AssocMarkerEntry[] = [
  { id: 'TA-001', name: '上海软件行业协会', type: '协会', value: [121.455, 31.245], status: '洽谈中', address: '静安区江场西路299弄4号楼1205室', contact: '周会长', contactPhone: '13800138001', memberCount: 350 },
  { id: 'TA-002', name: '浦东新区商会', type: '商会', value: [121.525, 31.225], status: '洽谈中', address: '浦东新区民生路1286号汇商大厦6楼', contact: '钱秘书长', contactPhone: '13800138002', memberCount: 500 },
  { id: 'TA-003', name: '张江高科技园区', type: '园区', value: [121.585, 31.205], status: '待开发', address: '浦东新区张江高科技园区', contact: '郑主任', contactPhone: '13800138003', memberCount: 280 },
  { id: 'TA-004', name: '上海人工智能协会', type: '协会', value: [121.515, 31.195], status: '洽谈中', address: '浦东新区世博村路231号306室', contact: '赵副会长', contactPhone: '13800138004', memberCount: 420 },
  { id: 'TA-005', name: '金桥出口加工区', type: '园区', value: [121.605, 31.255], status: '待开发', address: '浦东新区金桥出口加工区', contact: '吴主任', contactPhone: '13800138005', memberCount: 380 },
  { id: 'TA-006', name: '浦东青年商会', type: '商会', value: [121.555, 31.175], status: '待开发', address: '浦东新区纳贤路800号张江科学城', contact: '孙会长', contactPhone: '13800138006', memberCount: 200 },
  { id: 'TA-007', name: '上海浦东软件园', type: '园区', value: [121.595, 31.185], status: '已签约', address: '浦东新区博云路2号', contact: '韩主任', contactPhone: '13800138007', memberCount: 510, signedPartner: '上海辰晔信息科技有限公司' },
  { id: 'TA-008', name: '上海漕河泾远中产业园', type: '园区', value: [121.535, 31.265], status: '已签约', address: '浦东新区张江碧波路500号', contact: '李秘书长', contactPhone: '13800138008', memberCount: 280, signedPartner: '上海致柏商贸有限公司' },
]

function generateCompaniesForAssoc(assocId: string): AssocCompany[] {
  const companyPool: Record<string, Omit<AssocCompany, 'visitRecords'>[]> = {
    'TA-001': [
      { id: 'CA-001', cdbid: 'CDB-20260001', name: '上海泛微网络科技股份有限公司', industry: '企业软件', mainBusiness: 'OA协同办公平台研发与销售', businessScale: '大型', employeeCount: 2800, foundedDate: '2001-03', decisionMakerName: '韦总', decisionMakerPhone: '13900010001', contactName: '陈经理', contactPhone: '13700010001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-06' },
      { id: 'CA-002', cdbid: 'CDB-20260002', name: '上海汉得信息技术股份有限公司', industry: 'IT咨询', mainBusiness: '企业数字化转型与ERP实施服务', businessScale: '大型', employeeCount: 4500, foundedDate: '2002-07', decisionMakerName: '范总', decisionMakerPhone: '13900010002', contactName: '张经理', contactPhone: '13700010002', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-03' },
      { id: 'CA-003', cdbid: 'CDB-20260003', name: '上海宝信软件股份有限公司', industry: '工业软件', mainBusiness: '钢铁行业MES与智能制造系统', businessScale: '大型', employeeCount: 3200, foundedDate: '2000-04', decisionMakerName: '夏总', decisionMakerPhone: '13900010003', contactName: '刘总监', contactPhone: '13700010003', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-004', cdbid: 'CDB-20260004', name: '上海万达信息股份有限公司', industry: '智慧城市', mainBusiness: '城市信息化与政务系统建设', businessScale: '大型', employeeCount: 5600, foundedDate: '1995-12', decisionMakerName: '胡总', decisionMakerPhone: '13900010004', contactName: '王经理', contactPhone: '13700010004', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-25' },
      { id: 'CA-005', cdbid: 'CDB-20260005', name: '上海金仕达软件科技股份有限公司', industry: '金融科技', mainBusiness: '证券交易系统与金融风控平台', businessScale: '中型', employeeCount: 1200, foundedDate: '2008-09', decisionMakerName: '林总', decisionMakerPhone: '13900010005', contactName: '赵经理', contactPhone: '13700010005', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-22' },
      { id: 'CA-006', cdbid: 'CDB-20260006', name: '上海南洋万邦软件技术有限公司', industry: '云计算', mainBusiness: '云迁移与云运维服务', businessScale: '中型', employeeCount: 800, foundedDate: '2012-06', decisionMakerName: '郑总', decisionMakerPhone: '13900010006', contactName: '李经理', contactPhone: '13700010006', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-05' },
      { id: 'CA-007', cdbid: 'CDB-20260007', name: '上海新致软件股份有限公司', industry: '金融IT', mainBusiness: '银行核心系统与支付平台开发', businessScale: '中型', employeeCount: 1500, foundedDate: '2005-11', decisionMakerName: '郭总', decisionMakerPhone: '13900010007', contactName: '周经理', contactPhone: '13700010007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-15' },
      { id: 'CA-008', cdbid: 'CDB-20260008', name: '上海普元信息技术股份有限公司', industry: '基础软件', mainBusiness: '中间件与低代码开发平台', businessScale: '中型', employeeCount: 900, foundedDate: '2003-02', decisionMakerName: '刘总', decisionMakerPhone: '13900010008', contactName: '杨总监', contactPhone: '13700010008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-10' },
      { id: 'CA-009', cdbid: 'CDB-20260009', name: '上海电科智能系统股份有限公司', industry: '智能交通', mainBusiness: '智慧交通管理平台与信号控制系统', businessScale: '中型', employeeCount: 1100, foundedDate: '2006-08', decisionMakerName: '何总', decisionMakerPhone: '13900010009', contactName: '吴经理', contactPhone: '13700010009', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-28' },
      { id: 'CA-010', cdbid: 'CDB-20260010', name: '上海数慧系统技术有限公司', industry: '地理信息', mainBusiness: 'GIS地理信息系统与空间大数据', businessScale: '小型', employeeCount: 450, foundedDate: '2010-03', decisionMakerName: '曹总', decisionMakerPhone: '13900010010', contactName: '孙经理', contactPhone: '13700010010', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-10' },
    ],
    'TA-002': [
      { id: 'CA-011', cdbid: 'CDB-20260011', name: '上海华勤通信技术有限公司', industry: '通信设备', mainBusiness: '通信设备ODM与智能制造', businessScale: '大型', employeeCount: 12000, foundedDate: '2005-08', decisionMakerName: '邱总', decisionMakerPhone: '13900020001', contactName: '沈经理', contactPhone: '13700020001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-04' },
      { id: 'CA-012', cdbid: 'CDB-20260012', name: '上海韦尔半导体股份有限公司', industry: '芯片设计', mainBusiness: 'CIS图像传感器设计与销售', businessScale: '大型', employeeCount: 3500, foundedDate: '2007-05', decisionMakerName: '虞总', decisionMakerPhone: '13900020002', contactName: '马经理', contactPhone: '13700020002', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-02' },
      { id: 'CA-013', cdbid: 'CDB-20260013', name: '上海外高桥造船有限公司', industry: '船舶制造', mainBusiness: '大型船舶与海洋工程装备制造', businessScale: '大型', employeeCount: 8000, foundedDate: '1999-10', decisionMakerName: '陈总', decisionMakerPhone: '13900020003', contactName: '黄经理', contactPhone: '13700020003', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-30' },
      { id: 'CA-014', cdbid: 'CDB-20260014', name: '上海微创医疗器械有限公司', industry: '医疗器械', mainBusiness: '心血管介入器械研发生产', businessScale: '大型', employeeCount: 4200, foundedDate: '1998-06', decisionMakerName: '常总', decisionMakerPhone: '13900020004', contactName: '曹经理', contactPhone: '13700020004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-26' },
      { id: 'CA-015', cdbid: 'CDB-20260015', name: '上海罗氏制药有限公司', industry: '医药研发', mainBusiness: '创新药研发与商业化', businessScale: '大型', employeeCount: 3000, foundedDate: '1994-05', decisionMakerName: '徐总', decisionMakerPhone: '13900020005', contactName: '潘经理', contactPhone: '13700020005', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-20' },
      { id: 'CA-016', cdbid: 'CDB-20260016', name: '上海锦江国际酒店股份有限公司', industry: '酒店旅游', mainBusiness: '酒店运营管理与旅游服务', businessScale: '大型', employeeCount: 6500, foundedDate: '1994-12', decisionMakerName: '张总', decisionMakerPhone: '13900020006', contactName: '蔡经理', contactPhone: '13700020006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-20' },
      { id: 'CA-017', cdbid: 'CDB-20260017', name: '上海光明乳业股份有限公司', industry: '食品饮料', mainBusiness: '乳制品生产与销售', businessScale: '大型', employeeCount: 5500, foundedDate: '1996-09', decisionMakerName: '黄总', decisionMakerPhone: '13900020007', contactName: '谢经理', contactPhone: '13700020007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-12' },
      { id: 'CA-018', cdbid: 'CDB-20260018', name: '上海建工一建集团有限公司', industry: '建筑工程', mainBusiness: '大型建筑工程项目总承包', businessScale: '大型', employeeCount: 7000, foundedDate: '1953-03', decisionMakerName: '李总', decisionMakerPhone: '13900020008', contactName: '魏经理', contactPhone: '13700020008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-05' },
      { id: 'CA-019', cdbid: 'CDB-20260019', name: '上海振华重工股份有限公司', industry: '港口机械', mainBusiness: '港口集装箱起重机研发制造', businessScale: '大型', employeeCount: 6000, foundedDate: '1992-02', decisionMakerName: '朱总', decisionMakerPhone: '13900020009', contactName: '袁经理', contactPhone: '13700020009', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-05' },
      { id: 'CA-020', cdbid: 'CDB-20260020', name: '华住酒店管理有限公司', industry: '酒店旅游', mainBusiness: '连锁酒店品牌运营与加盟管理', businessScale: '大型', employeeCount: 5000, foundedDate: '2005-03', decisionMakerName: '金总', decisionMakerPhone: '13900020010', contactName: '丁经理', contactPhone: '13700020010', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-02-28' },
    ],
    'TA-003': [
      { id: 'CA-021', cdbid: 'CDB-20260021', name: '展讯通信有限公司', industry: '通信芯片', mainBusiness: '移动通信基带芯片设计', businessScale: '大型', employeeCount: 2800, foundedDate: '2001-07', decisionMakerName: '任总', decisionMakerPhone: '13900030001', contactName: '高经理', contactPhone: '13700030001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-05' },
      { id: 'CA-022', cdbid: 'CDB-20260022', name: '格科微电子有限公司', industry: '图像传感器', mainBusiness: 'CMOS图像传感器设计制造', businessScale: '大型', employeeCount: 2000, foundedDate: '2003-09', decisionMakerName: '赵总', decisionMakerPhone: '13900030002', contactName: '吕经理', contactPhone: '13700030002', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-023', cdbid: 'CDB-20260023', name: '华虹半导体有限公司', industry: '晶圆代工', mainBusiness: '特色工艺晶圆代工服务', businessScale: '大型', employeeCount: 3500, foundedDate: '1996-04', decisionMakerName: '唐总', decisionMakerPhone: '13900030003', contactName: '施经理', contactPhone: '13700030003', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-25' },
      { id: 'CA-024', cdbid: 'CDB-20260024', name: '上海复旦微电子集团', industry: '集成电路', mainBusiness: '安全芯片与识别芯片设计', businessScale: '中型', employeeCount: 1500, foundedDate: '1998-07', decisionMakerName: '蒋总', decisionMakerPhone: '13900030004', contactName: '韩经理', contactPhone: '13700030004', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-01' },
      { id: 'CA-025', cdbid: 'CDB-20260025', name: '紫光展锐科技有限公司', industry: '移动芯片', mainBusiness: '5G移动通信芯片平台', businessScale: '大型', employeeCount: 5000, foundedDate: '2013-12', decisionMakerName: '楚总', decisionMakerPhone: '13900030005', contactName: '石经理', contactPhone: '13700030005', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-20' },
      { id: 'CA-026', cdbid: 'CDB-20260026', name: '上海兆芯集成电路有限公司', industry: 'CPU设计', mainBusiness: '国产x86兼容处理器研发', businessScale: '中型', employeeCount: 1200, foundedDate: '2013-04', decisionMakerName: '叶总', decisionMakerPhone: '13900030006', contactName: '崔经理', contactPhone: '13700030006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-15' },
      { id: 'CA-027', cdbid: 'CDB-20260027', name: '翱捷科技股份有限公司', industry: '物联网芯片', mainBusiness: '物联网通信芯片与平台方案', businessScale: '中型', employeeCount: 900, foundedDate: '2015-08', decisionMakerName: '戴总', decisionMakerPhone: '13900030007', contactName: '姜经理', contactPhone: '13700030007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-25' },
      { id: 'CA-028', cdbid: 'CDB-20260028', name: '澜起科技股份有限公司', industry: '内存接口', mainBusiness: 'DDR内存接口芯片设计', businessScale: '中型', employeeCount: 1000, foundedDate: '2004-05', decisionMakerName: '杨总', decisionMakerPhone: '13900030008', contactName: '秦经理', contactPhone: '13700030008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-18' },
      { id: 'CA-029', cdbid: 'CDB-20260029', name: '盛美半导体设备有限公司', industry: '半导体设备', mainBusiness: '单片晶圆清洗设备研发制造', businessScale: '中型', employeeCount: 800, foundedDate: '2005-05', decisionMakerName: '王总', decisionMakerPhone: '13900030009', contactName: '许经理', contactPhone: '13700030009', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-08' },
      { id: 'CA-030', cdbid: 'CDB-20260030', name: '安集微电子科技有限公司', industry: '半导体材料', mainBusiness: 'CMP抛光液与光刻胶研发', businessScale: '小型', employeeCount: 500, foundedDate: '2008-02', decisionMakerName: '王总', decisionMakerPhone: '13900030010', contactName: '尤经理', contactPhone: '13700030010', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-02' },
    ],
    'TA-004': [
      { id: 'CA-031', cdbid: 'CDB-20260031', name: '商汤科技开发有限公司', industry: 'AI视觉', mainBusiness: '计算机视觉与深度学习平台', businessScale: '大型', employeeCount: 4500, foundedDate: '2014-08', decisionMakerName: '徐总', decisionMakerPhone: '13900040001', contactName: '汪经理', contactPhone: '13700040001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-05' },
      { id: 'CA-032', cdbid: 'CDB-20260032', name: '依图网络科技有限公司', industry: 'AI平台', mainBusiness: 'AI算力平台与智慧城市方案', businessScale: '大型', employeeCount: 2500, foundedDate: '2012-09', decisionMakerName: '朱总', decisionMakerPhone: '13900040002', contactName: '傅经理', contactPhone: '13700040002', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-29' },
      { id: 'CA-033', cdbid: 'CDB-20260033', name: '云从科技集团股份有限公司', industry: '人机协同', mainBusiness: '人机协同操作系统与AI应用', businessScale: '大型', employeeCount: 2000, foundedDate: '2015-03', decisionMakerName: '周总', decisionMakerPhone: '13900040003', contactName: '钱经理', contactPhone: '13700040003', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-25' },
      { id: 'CA-034', cdbid: 'CDB-20260034', name: '旷视科技有限公司', industry: 'AIoT', mainBusiness: 'AIoT智能物联解决方案', businessScale: '大型', employeeCount: 2800, foundedDate: '2011-10', decisionMakerName: '印总', decisionMakerPhone: '13900040004', contactName: '唐经理', contactPhone: '13700040004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-20' },
      { id: 'CA-035', cdbid: 'CDB-20260035', name: '上海燧原科技有限公司', industry: 'AI算力', mainBusiness: '云端AI训练推理芯片', businessScale: '中型', employeeCount: 1200, foundedDate: '2018-03', decisionMakerName: '赵总', decisionMakerPhone: '13900040005', contactName: '鲍经理', contactPhone: '13700040005', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-02' },
      { id: 'CA-036', cdbid: 'CDB-20260036', name: '上海壁仞智能科技有限公司', industry: 'GPU芯片', mainBusiness: '通用GPU芯片与AI算力卡', businessScale: '中型', employeeCount: 1500, foundedDate: '2019-09', decisionMakerName: '张总', decisionMakerPhone: '13900040006', contactName: '倪经理', contactPhone: '13700040006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-12' },
      { id: 'CA-037', cdbid: 'CDB-20260037', name: '上海天数智芯半导体有限公司', industry: '通用GPU', mainBusiness: '通用GPU芯片与计算卡', businessScale: '中型', employeeCount: 800, foundedDate: '2020-05', decisionMakerName: '李总', decisionMakerPhone: '13900040007', contactName: '汤经理', contactPhone: '13700040007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-05' },
      { id: 'CA-038', cdbid: 'CDB-20260038', name: '上海登临科技股份有限公司', industry: 'AI芯片', mainBusiness: '云端AI推理芯片与加速卡', businessScale: '小型', employeeCount: 400, foundedDate: '2017-11', decisionMakerName: '李总', decisionMakerPhone: '13900040008', contactName: '费经理', contactPhone: '13700040008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-20' },
    ],
    'TA-005': [
      { id: 'CA-039', cdbid: 'CDB-20260039', name: '上海通用汽车有限公司', industry: '汽车制造', mainBusiness: '乘用车研发制造与销售', businessScale: '大型', employeeCount: 25000, foundedDate: '1997-06', decisionMakerName: '王总', decisionMakerPhone: '13900050001', contactName: '陆经理', contactPhone: '13700050001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-05' },
      { id: 'CA-040', cdbid: 'CDB-20260040', name: '联合汽车电子有限公司', industry: '汽车电子', mainBusiness: '汽车发动机管理及电控系统', businessScale: '大型', employeeCount: 6000, foundedDate: '1995-12', decisionMakerName: '熊总', decisionMakerPhone: '13900050002', contactName: '孔经理', contactPhone: '13700050002', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-041', cdbid: 'CDB-20260041', name: '上海三菱电梯有限公司', industry: '电梯制造', mainBusiness: '电梯及自动扶梯研发制造', businessScale: '大型', employeeCount: 5000, foundedDate: '1987-01', decisionMakerName: '万总', decisionMakerPhone: '13900050003', contactName: '曹经理', contactPhone: '13700050003', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-04-30' },
      { id: 'CA-042', cdbid: 'CDB-20260042', name: '上海夏普电器有限公司', industry: '家电制造', mainBusiness: '家用电器研发制造与销售', businessScale: '大型', employeeCount: 3000, foundedDate: '1992-08', decisionMakerName: '今井总', decisionMakerPhone: '13900050004', contactName: '杜经理', contactPhone: '13700050004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-22' },
      { id: 'CA-043', cdbid: 'CDB-20260043', name: '上海贝尔企业通信有限公司', industry: '通信设备', mainBusiness: '企业级通信网络设备制造', businessScale: '大型', employeeCount: 3500, foundedDate: '1984-06', decisionMakerName: 'Rodrigo总', decisionMakerPhone: '13900050005', contactName: '薛经理', contactPhone: '13700050005', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-15' },
      { id: 'CA-044', cdbid: 'CDB-20260044', name: '上海航天设备制造总厂', industry: '航空航天', mainBusiness: '航天器及运载火箭制造', businessScale: '大型', employeeCount: 8000, foundedDate: '1958-10', decisionMakerName: '何总', decisionMakerPhone: '13900050006', contactName: '雷经理', contactPhone: '13700050006', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-25' },
      { id: 'CA-045', cdbid: 'CDB-20260045', name: '上海第一机床厂有限公司', industry: '机床制造', mainBusiness: '精密数控机床研发制造', businessScale: '中型', employeeCount: 1500, foundedDate: '1946-05', decisionMakerName: '程总', decisionMakerPhone: '13900050007', contactName: '贺经理', contactPhone: '13700050007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-08' },
      { id: 'CA-046', cdbid: 'CDB-20260046', name: '上海ABB工程有限公司', industry: '工业机器人', mainBusiness: '工业机器人及自动化系统', businessScale: '大型', employeeCount: 2800, foundedDate: '1999-03', decisionMakerName: '顾总', decisionMakerPhone: '13900050008', contactName: '范经理', contactPhone: '13700050008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-28' },
      { id: 'CA-047', cdbid: 'CDB-20260047', name: '虎伯拉铰接系统有限公司', industry: '汽车零部件', mainBusiness: '客车铰接系统制造', businessScale: '中型', employeeCount: 1000, foundedDate: '2001-06', decisionMakerName: 'Hübner总', decisionMakerPhone: '13900050009', contactName: '苗经理', contactPhone: '13700050009', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-02' },
      { id: 'CA-048', cdbid: 'CDB-20260048', name: '华为上海研究所', industry: '通信技术', mainBusiness: '5G/6G通信技术研究', businessScale: '大型', employeeCount: 12000, foundedDate: '1996-06', decisionMakerName: '余总', decisionMakerPhone: '13900050010', contactName: '尹经理', contactPhone: '13700050010', isHighValue: true, cooperationStatus: '待跟进', lastVisitDate: '2026-04-18' },
    ],
    'TA-006': [
      { id: 'CA-049', cdbid: 'CDB-20260049', name: '上海哔哩哔哩科技有限公司', industry: '视频平台', mainBusiness: '在线视频及泛娱乐平台', businessScale: '大型', employeeCount: 6000, foundedDate: '2009-06', decisionMakerName: '陈总', decisionMakerPhone: '13900060001', contactName: '顾经理', contactPhone: '13700060001', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-05-02' },
      { id: 'CA-050', cdbid: 'CDB-20260050', name: '上海米哈游网络科技股份有限公司', industry: '游戏', mainBusiness: '移动游戏研发与全球发行', businessScale: '大型', employeeCount: 4000, foundedDate: '2011-02', decisionMakerName: '刘总', decisionMakerPhone: '13900060002', contactName: '邹经理', contactPhone: '13700060002', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-051', cdbid: 'CDB-20260051', name: '上海莉莉丝科技股份有限公司', industry: '游戏', mainBusiness: 'SLG策略手游研发与运营', businessScale: '中型', employeeCount: 1800, foundedDate: '2013-05', decisionMakerName: '王总', decisionMakerPhone: '13900060003', contactName: '侯经理', contactPhone: '13700060003', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-04' },
      { id: 'CA-052', cdbid: 'CDB-20260052', name: '上海喜马拉雅科技有限公司', industry: '音频', mainBusiness: '在线音频内容平台', businessScale: '中型', employeeCount: 2500, foundedDate: '2012-08', decisionMakerName: '余总', decisionMakerPhone: '13900060004', contactName: '万经理', contactPhone: '13700060004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-22' },
      { id: 'CA-053', cdbid: 'CDB-20260053', name: '小红书科技有限公司', industry: '社交电商', mainBusiness: '生活方式社区与电商平台', businessScale: '大型', employeeCount: 4500, foundedDate: '2013-06', decisionMakerName: '毛总', decisionMakerPhone: '13900060005', contactName: '段经理', contactPhone: '13700060005', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-20' },
      { id: 'CA-054', cdbid: 'CDB-20260054', name: '上海得物信息集团有限公司', industry: '潮流电商', mainBusiness: '潮流商品鉴别与电商平台', businessScale: '中型', employeeCount: 2000, foundedDate: '2015-03', decisionMakerName: '杨总', decisionMakerPhone: '13900060006', contactName: '赖经理', contactPhone: '13700060006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-10' },
      { id: 'CA-055', cdbid: 'CDB-20260055', name: '上海哈啰普惠科技有限公司', industry: '共享出行', mainBusiness: '共享单车与两轮电动车出行', businessScale: '大型', employeeCount: 5000, foundedDate: '2016-09', decisionMakerName: '杨总', decisionMakerPhone: '13900060007', contactName: '武经理', contactPhone: '13700060007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-05' },
      { id: 'CA-056', cdbid: 'CDB-20260056', name: '上海汇正财经顾问有限公司', industry: '金融科技', mainBusiness: '智能投顾与财富管理平台', businessScale: '小型', employeeCount: 480, foundedDate: '2018-04', decisionMakerName: '林总', decisionMakerPhone: '13900060008', contactName: '闵经理', contactPhone: '13700060008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-25' },
    ],
    'TA-007': [
      { id: 'CA-057', cdbid: 'CDB-20260057', name: '滴滴出行科技有限公司', industry: '出行', mainBusiness: '网约车与智慧出行平台', businessScale: '大型', employeeCount: 8000, foundedDate: '2012-07', decisionMakerName: '程总', decisionMakerPhone: '13900070001', contactName: '廖经理', contactPhone: '13700070001', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-04' },
      { id: 'CA-058', cdbid: 'CDB-20260058', name: 'SAP中国研究院', industry: '企业管理软件', mainBusiness: 'ERP云平台及企业应用开发', businessScale: '大型', employeeCount: 3500, foundedDate: '2003-11', decisionMakerName: 'Markus总', decisionMakerPhone: '13900070002', contactName: '查经理', contactPhone: '13700070002', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-02' },
      { id: 'CA-059', cdbid: 'CDB-20260059', name: '上海华讯网络系统有限公司', industry: '网络技术', mainBusiness: '企业网络架构与系统集成', businessScale: '中型', employeeCount: 1500, foundedDate: '2000-08', decisionMakerName: '宋总', decisionMakerPhone: '13900070003', contactName: '龙经理', contactPhone: '13700070003', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-060', cdbid: 'CDB-20260060', name: '上海汇纳科技股份有限公司', industry: '大数据', mainBusiness: '商业大数据分析与客流感知', businessScale: '小型', employeeCount: 600, foundedDate: '2004-07', decisionMakerName: '张总', decisionMakerPhone: '13900070004', contactName: '黎经理', contactPhone: '13700070004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-22' },
      { id: 'CA-061', cdbid: 'CDB-20260061', name: '上海大智慧股份有限公司', industry: '金融信息', mainBusiness: '证券信息服务平台', businessScale: '中型', employeeCount: 2000, foundedDate: '2000-12', decisionMakerName: '张总', decisionMakerPhone: '13900070005', contactName: '谷经理', contactPhone: '13700070005', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-01' },
      { id: 'CA-062', cdbid: 'CDB-20260062', name: '上海维宏电子科技股份有限公司', industry: '运动控制', mainBusiness: '数控系统与运动控制器', businessScale: '中型', employeeCount: 800, foundedDate: '2003-05', decisionMakerName: '汤总', decisionMakerPhone: '13900070006', contactName: '裴经理', contactPhone: '13700070006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-15' },
      { id: 'CA-063', cdbid: 'CDB-20260063', name: '上海天正软件有限公司', industry: '金融软件', mainBusiness: '银行信贷与风控系统开发', businessScale: '中型', employeeCount: 1000, foundedDate: '2005-09', decisionMakerName: '饶总', decisionMakerPhone: '13900070007', contactName: '薛经理', contactPhone: '13700070007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-08' },
      { id: 'CA-064', cdbid: 'CDB-20260064', name: '上海企源科技股份有限公司', industry: '管理咨询', mainBusiness: '企业管理咨询与IT实施', businessScale: '中型', employeeCount: 1200, foundedDate: '2001-06', decisionMakerName: '孔总', decisionMakerPhone: '13900070008', contactName: '蒋经理', contactPhone: '13700070008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-30' },
      { id: 'CA-065', cdbid: 'CDB-20260065', name: '上海讯飞瑞元信息技术有限公司', industry: 'AI', mainBusiness: '智能语音与自然语言处理', businessScale: '中型', employeeCount: 900, foundedDate: '2016-03', decisionMakerName: '刘总', decisionMakerPhone: '13900070009', contactName: '邵经理', contactPhone: '13700070009', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-02' },
      { id: 'CA-066', cdbid: 'CDB-20260066', name: '上海智臻智能网络科技股份有限公司', industry: 'AI客服', mainBusiness: '智能客服机器人与对话平台', businessScale: '小型', employeeCount: 500, foundedDate: '2015-07', decisionMakerName: '袁总', decisionMakerPhone: '13900070010', contactName: '郝经理', contactPhone: '13700070010', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-10' },
      { id: 'CA-067', cdbid: 'CDB-20260067', name: '上海中和软件有限公司', industry: '软件外包', mainBusiness: '对日软件外包与系统开发', businessScale: '中型', employeeCount: 1500, foundedDate: '1999-04', decisionMakerName: '陈总', decisionMakerPhone: '13900070011', contactName: '白经理', contactPhone: '13700070011', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-18' },
      { id: 'CA-068', cdbid: 'CDB-20260068', name: '上海博科资讯股份有限公司', industry: 'ERP', mainBusiness: '企业ERP管理软件研发', businessScale: '中型', employeeCount: 1100, foundedDate: '2000-10', decisionMakerName: '沈总', decisionMakerPhone: '13900070012', contactName: '易经理', contactPhone: '13700070012', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-05' },
    ],
    'TA-008': [
      { id: 'CA-069', cdbid: 'CDB-20260069', name: '上海仪电电子股份有限公司', industry: '电子制造', mainBusiness: '电子元器件与智能仪表制造', businessScale: '中型', employeeCount: 1800, foundedDate: '1993-06', decisionMakerName: '吴总', decisionMakerPhone: '13900080001', contactName: '梁经理', contactPhone: '13700080001', isHighValue: false, cooperationStatus: '已合作', lastVisitDate: '2026-05-05' },
      { id: 'CA-070', cdbid: 'CDB-20260070', name: '上海飞乐音响股份有限公司', industry: '照明', mainBusiness: 'LED照明及智慧城市照明方案', businessScale: '中型', employeeCount: 1200, foundedDate: '1984-11', decisionMakerName: '李总', decisionMakerPhone: '13900080002', contactName: '关经理', contactPhone: '13700080002', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-28' },
      { id: 'CA-071', cdbid: 'CDB-20260071', name: '科大讯飞上海有限公司', industry: 'AI', mainBusiness: '智能语音及AI开放平台', businessScale: '大型', employeeCount: 3000, foundedDate: '2010-05', decisionMakerName: '刘总', decisionMakerPhone: '13900080003', contactName: '田经理', contactPhone: '13700080003', isHighValue: true, cooperationStatus: '已合作', lastVisitDate: '2026-05-02' },
      { id: 'CA-072', cdbid: 'CDB-20260072', name: '上海微盟企业发展有限公司', industry: 'SaaS', mainBusiness: '微信生态SaaS营销云平台', businessScale: '中型', employeeCount: 2200, foundedDate: '2013-04', decisionMakerName: '孙总', decisionMakerPhone: '13900080004', contactName: '华经理', contactPhone: '13700080004', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-22' },
      { id: 'CA-073', cdbid: 'CDB-20260073', name: '上海有孚网络股份有限公司', industry: '云计算', mainBusiness: '云计算数据中心与云服务', businessScale: '中型', employeeCount: 900, foundedDate: '2012-08', decisionMakerName: '安总', decisionMakerPhone: '13900080005', contactName: '邓经理', contactPhone: '13700080005', isHighValue: false, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-18' },
      { id: 'CA-074', cdbid: 'CDB-20260074', name: '上海百事通信息技术有限公司', industry: '法律科技', mainBusiness: '法律咨询服务平台', businessScale: '中型', employeeCount: 800, foundedDate: '2006-03', decisionMakerName: '冯总', decisionMakerPhone: '13900080006', contactName: '余经理', contactPhone: '13700080006', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-10' },
      { id: 'CA-075', cdbid: 'CDB-20260075', name: '上海复深蓝软件股份有限公司', industry: '金融科技', mainBusiness: '保险核心系统与金融软件测试', businessScale: '中型', employeeCount: 1500, foundedDate: '2007-09', decisionMakerName: '杨总', decisionMakerPhone: '13900080007', contactName: '康经理', contactPhone: '13700080007', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-05' },
      { id: 'CA-076', cdbid: 'CDB-20260076', name: '上海凯诘电子商务股份有限公司', industry: '电商', mainBusiness: '品牌电商代运营与数字营销', businessScale: '中型', employeeCount: 1000, foundedDate: '2011-06', decisionMakerName: '许总', decisionMakerPhone: '13900080008', contactName: '贺经理', contactPhone: '13700080008', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-03-28' },
      { id: 'CA-077', cdbid: 'CDB-20260077', name: '上海银联商务有限公司', industry: '支付', mainBusiness: '综合支付与信息服务', businessScale: '大型', employeeCount: 4500, foundedDate: '2002-12', decisionMakerName: '田总', decisionMakerPhone: '13900080009', contactName: '严经理', contactPhone: '13700080009', isHighValue: true, cooperationStatus: '洽谈中', lastVisitDate: '2026-04-25' },
      { id: 'CA-078', cdbid: 'CDB-20260078', name: '上海网鱼信息科技有限公司', industry: '电竞', mainBusiness: '网咖连锁与电竞空间运营', businessScale: '中型', employeeCount: 2000, foundedDate: '1998-10', decisionMakerName: '黄总', decisionMakerPhone: '13900080010', contactName: '牛经理', contactPhone: '13700080010', isHighValue: false, cooperationStatus: '待跟进', lastVisitDate: '2026-04-15' },
    ],
  }

  const pool = companyPool[assocId] || []
  return pool.map(c => {
    const visitCount = (c.id.charCodeAt(c.id.length - 1) + assocId.charCodeAt(assocId.length - 1)) % 4
    const visitRecords: CompanyVisitRecord[] = []
    const visitTypes = ['上门拜访', '电话沟通', '腾讯会议']
    const baseDate = new Date('2026-01-01')
    for (let i = 0; i < visitCount; i++) {
      const vDate = new Date(baseDate)
      vDate.setDate(vDate.getDate() + (c.id.charCodeAt(3) + i * 45) % 150)
      visitRecords.push({
        id: `VR-${c.id}-${i + 1}`,
        visitDate: vDate.toISOString().slice(0, 10),
        visitTarget: c.decisionMakerName,
        visitType: visitTypes[i % 3],
        attendees: `黄俊、${c.contactName}`,
        summary: `本次拜访围绕"${c.mainBusiness.slice(0, 12)}"业务展开，与${c.decisionMakerName}进行了深入沟通。客户对联想企业级产品线表现出较强兴趣，重点关注产品性能与售后服务响应速度。`,
        feedback: `${c.decisionMakerName}表示目前IT设备采购周期较长，联想的供货速度具有竞争优势。同时对DaaS租赁模式表示了兴趣，希望获得更详细的服务方案。`,
        nextPlan: `${i + 1}. 发送${i === 0 ? 'ThinkPad T14 Gen 6详细报价单' : i === 1 ? 'ThinkSystem服务器方案' : '产品演示预约'}; ${i + 2}. 安排后续深度沟通`,
      })
    }
    return { ...c, visitRecords }
  })
}

const assocWithCompanies = assocMarkerData.map(entry => ({
  ...entry,
  companies: generateCompaniesForAssoc(entry.id),
}))

function getCompanyById(companyId: string): AssocCompany | undefined {
  for (const entry of assocWithCompanies) {
    const c = entry.companies.find(co => co.id === companyId)
    if (c) return c
  }
  return undefined
}

function getCompanyVisitLog(companyId: string): CompanyVisitRecord[] {
  const company = getCompanyById(companyId)
  return company?.visitRecords || []
}

function getFilteredCompanies(
  companies: AssocCompany[],
  search: string, industryFilter: string,
  highValueFilter: string, cooperationFilter: string
): AssocCompany[] {
  return companies.filter(c => {
    if (search && !c.name.includes(search)) return false
    if (industryFilter !== '全部' && c.industry !== industryFilter) return false
    if (highValueFilter === '是' && !c.isHighValue) return false
    if (highValueFilter === '否' && c.isHighValue) return false
    if (cooperationFilter !== '全部' && c.cooperationStatus !== cooperationFilter) return false
    return true
  })
}

function getCompanyStats(companies: AssocCompany[]) {
  return {
    total: companies.length,
    highValue: companies.filter(c => c.isHighValue).length,
    cooperating: companies.filter(c => c.cooperationStatus === '已合作').length,
    negotiating: companies.filter(c => c.cooperationStatus === '洽谈中').length,
    pending: companies.filter(c => c.cooperationStatus === '待跟进').length,
  }
}

function getAssocById(assocId: string): AssocMarkerEntry | undefined {
  return assocMarkerData.find(a => a.id === assocId)
}

function getAssocWithCompanies(assocId: string) {
  return assocWithCompanies.find(a => a.id === assocId)
}

const partnerMarkerData: {
  id: string; channelCode: string; name: string; city: string;
  level: string; quarterlyCommit: number; quarterlySales: number; lastQuarterSales: number;
  yearlySales: number; province: string; warZone: string; district: string;
  signType: string; isActive: boolean; outreach: string;
}[] = [
  { id: 'CH-001', channelCode: 'K10086001', name: '神州数码', city: '上海', level: '钻石', quarterlyCommit: 800, quarterlySales: 650, lastQuarterSales: 580, yearlySales: 2450, province: '上海', warZone: '华东战区', district: '浦东辖区', signType: '增值经销商', isActive: true, outreach: 'OS' },
  { id: 'CH-002', channelCode: 'K10086002', name: '联强国际', city: '上海', level: '钻石', quarterlyCommit: 700, quarterlySales: 580, lastQuarterSales: 520, yearlySales: 2100, province: '上海', warZone: '华东战区', district: '徐汇辖区', signType: '增值经销商', isActive: true, outreach: 'IS' },
  { id: 'CH-003', channelCode: 'K10086003', name: '上海金陵网络', city: '上海', level: '金牌', quarterlyCommit: 400, quarterlySales: 350, lastQuarterSales: 300, yearlySales: 1280, province: '上海', warZone: '华东战区', district: '杨浦辖区', signType: '增值代理商', isActive: true, outreach: 'BPP' },
  { id: 'CH-004', channelCode: 'K10086004', name: '伟仕佳杰', city: '上海', level: '金牌', quarterlyCommit: 500, quarterlySales: 420, lastQuarterSales: 380, yearlySales: 1520, province: '上海', warZone: '华东战区', district: '静安辖区', signType: '增值经销商', isActive: true, outreach: 'OS' },
  { id: 'CH-005', channelCode: 'K10086005', name: '上海康硕信息', city: '上海', level: '银牌', quarterlyCommit: 220, quarterlySales: 180, lastQuarterSales: 150, yearlySales: 620, province: '上海', warZone: '华东战区', district: '闵行辖区', signType: '增值代理商', isActive: true, outreach: 'IS' },
  { id: 'CH-006', channelCode: 'K10086006', name: '上海翎云科技', city: '上海', level: '银牌', quarterlyCommit: 180, quarterlySales: 155, lastQuarterSales: 120, yearlySales: 520, province: '上海', warZone: '华东战区', district: '长宁辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-007', channelCode: 'K10086007', name: '上海贝加信息', city: '上海', level: '银牌', quarterlyCommit: 120, quarterlySales: 95, lastQuarterSales: 80, yearlySales: 340, province: '上海', warZone: '华东战区', district: '普陀辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-008', channelCode: 'K10086008', name: '英迈中国', city: '上海', level: '银牌', quarterlyCommit: 90, quarterlySales: 72, lastQuarterSales: 65, yearlySales: 260, province: '上海', warZone: '华东战区', district: '虹口辖区', signType: '开放伙伴', isActive: true, outreach: 'BPP' },
  { id: 'CH-009', channelCode: 'K10086009', name: '上海赢家信息', city: '上海', level: '铜牌', quarterlyCommit: 60, quarterlySales: 48, lastQuarterSales: 42, yearlySales: 165, province: '上海', warZone: '华东战区', district: '宝山辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-010', channelCode: 'K10086010', name: '上海华信科技', city: '上海', level: '铜牌', quarterlyCommit: 45, quarterlySales: 35, lastQuarterSales: 30, yearlySales: 120, province: '上海', warZone: '华东战区', district: '松江辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-011', channelCode: 'K10086011', name: '上海东讯科技', city: '上海', level: '金牌', quarterlyCommit: 450, quarterlySales: 380, lastQuarterSales: 340, yearlySales: 1380, province: '上海', warZone: '华东战区', district: '浦东辖区', signType: '增值代理商', isActive: true, outreach: 'OS' },
  { id: 'CH-012', channelCode: 'K10086012', name: '上海辰晔信息', city: '上海', level: '金牌', quarterlyCommit: 350, quarterlySales: 290, lastQuarterSales: 260, yearlySales: 1050, province: '上海', warZone: '华东战区', district: '徐汇辖区', signType: '增值经销商', isActive: true, outreach: 'IS' },
  { id: 'CH-013', channelCode: 'K10086013', name: '上海致柏商贸', city: '上海', level: '银牌', quarterlyCommit: 200, quarterlySales: 165, lastQuarterSales: 140, yearlySales: 560, province: '上海', warZone: '华东战区', district: '杨浦辖区', signType: '增值代理商', isActive: true, outreach: 'BPP' },
  { id: 'CH-014', channelCode: 'K10086014', name: '上海恒盈科技', city: '上海', level: '银牌', quarterlyCommit: 170, quarterlySales: 140, lastQuarterSales: 120, yearlySales: 480, province: '上海', warZone: '华东战区', district: '静安辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-015', channelCode: 'K10086015', name: '上海智远科技', city: '上海', level: '铜牌', quarterlyCommit: 110, quarterlySales: 88, lastQuarterSales: 75, yearlySales: 300, province: '上海', warZone: '华东战区', district: '闵行辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-016', channelCode: 'K10086016', name: '上海联创世纪', city: '上海', level: '铜牌', quarterlyCommit: 80, quarterlySales: 65, lastQuarterSales: 55, yearlySales: 220, province: '上海', warZone: '华东战区', district: '长宁辖区', signType: '开放伙伴', isActive: true, outreach: '' },
  { id: 'CH-017', channelCode: 'K10086017', name: '上海博睿信息', city: '上海', level: '铜牌', quarterlyCommit: 55, quarterlySales: 42, lastQuarterSales: 38, yearlySales: 145, province: '上海', warZone: '华东战区', district: '普陀辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-018', channelCode: 'K10086018', name: '上海云图科技', city: '上海', level: '铜牌', quarterlyCommit: 50, quarterlySales: 38, lastQuarterSales: 32, yearlySales: 130, province: '上海', warZone: '华东战区', district: '虹口辖区', signType: '注册伙伴', isActive: true, outreach: '' },
  { id: 'CH-019', channelCode: 'K10086019', name: '上海华勤信息', city: '上海', level: '银牌', quarterlyCommit: 210, quarterlySales: 175, lastQuarterSales: 155, yearlySales: 600, province: '上海', warZone: '华东战区', district: '宝山辖区', signType: '增值代理商', isActive: true, outreach: 'OS' },
  { id: 'CH-020', channelCode: 'K10086020', name: '上海盛美电子', city: '上海', level: '铜牌', quarterlyCommit: 95, quarterlySales: 78, lastQuarterSales: 68, yearlySales: 265, province: '上海', warZone: '华东战区', district: '松江辖区', signType: '注册伙伴', isActive: true, outreach: '' },
]

// B4 客户经营数据
const b4Customers: {
  id: string; warZone: string; name: string; cdbid: string; city: string;
  industryCategory: string; registeredCapital: string; foundedDate: string;
}[] = [
  { id: 'B4-001', warZone: '华东战区', name: '上海华信科技有限公司', cdbid: '91310000123456789A', city: '上海', industryCategory: '制造业', registeredCapital: '5000万', foundedDate: '2001-03-15' },
  { id: 'B4-002', warZone: '华东战区', name: '上海浦东发展银行股份有限公司', cdbid: '9131000013221158XC', city: '上海', industryCategory: '金融业', registeredCapital: '293.52亿', foundedDate: '1992-10-19' },
  { id: 'B4-003', warZone: '华东战区', name: '上海微电子装备有限公司', cdbid: '91310115703056789B', city: '上海', industryCategory: '制造业', registeredCapital: '2.5亿', foundedDate: '2002-03-07' },
  { id: 'B4-004', warZone: '华东战区', name: '中芯国际集成电路制造', cdbid: '91310000710912345C', city: '上海', industryCategory: '制造业', registeredCapital: '78.9亿', foundedDate: '2000-12-21' },
  { id: 'B4-005', warZone: '华东战区', name: '上海汽车集团股份有限公司', cdbid: '91310000132200010D', city: '上海', industryCategory: '制造业', registeredCapital: '116.83亿', foundedDate: '1984-04-16' },
  { id: 'B4-006', warZone: '华东战区', name: '交通银行股份有限公司', cdbid: '91310000100012345E', city: '上海', industryCategory: '金融业', registeredCapital: '742.63亿', foundedDate: '1987-03-30' },
  { id: 'B4-007', warZone: '华东战区', name: '上海电气集团股份有限公司', cdbid: '91310000132229867F', city: '上海', industryCategory: '制造业', registeredCapital: '155.8亿', foundedDate: '2004-03-01' },
  { id: 'B4-008', warZone: '华东战区', name: '拼多多网络科技有限公司', cdbid: '91310000329645678G', city: '上海', industryCategory: '信息传输、软件和信息技术服务业', registeredCapital: '1000万', foundedDate: '2014-09-23' },
  { id: 'B4-009', warZone: '华东战区', name: '上海医药集团股份有限公司', cdbid: '91310000132256789H', city: '上海', industryCategory: '批发和零售业', registeredCapital: '37.05亿', foundedDate: '1994-01-18' },
  { id: 'B4-010', warZone: '华东战区', name: '携程计算机技术有限公司', cdbid: '91310115703098765I', city: '上海', industryCategory: '信息传输、软件和信息技术服务业', registeredCapital: '500万', foundedDate: '2000-07-18' },
  { id: 'B4-011', warZone: '华东战区', name: '上海宝钢股份有限公司', cdbid: '91310000132234567J', city: '上海', industryCategory: '制造业', registeredCapital: '220亿', foundedDate: '2000-02-03' },
  { id: 'B4-012', warZone: '华东战区', name: '东方财富证券股份有限公司', cdbid: '91310000703087654K', city: '上海', industryCategory: '金融业', registeredCapital: '158.5亿', foundedDate: '2005-01-20' },
  { id: 'B4-013', warZone: '华东战区', name: '上海机场集团股份有限公司', cdbid: '91310000132278901L', city: '上海', industryCategory: '交通运输、仓储和邮政业', registeredCapital: '19.35亿', foundedDate: '1998-02-11' },
  { id: 'B4-014', warZone: '华东战区', name: '上海复星医药有限公司', cdbid: '91310000132234568M', city: '上海', industryCategory: '制造业', registeredCapital: '26.72亿', foundedDate: '1995-05-31' },
  { id: 'B4-015', warZone: '华东战区', name: '上海建工集团股份有限公司', cdbid: '91310000132290123N', city: '上海', industryCategory: '建筑业', registeredCapital: '88.9亿', foundedDate: '1998-06-15' },
  { id: 'B4-016', warZone: '华东战区', name: '圆通速递股份有限公司', cdbid: '91310000132245678O', city: '上海', industryCategory: '交通运输、仓储和邮政业', registeredCapital: '34.42亿', foundedDate: '2000-04-14' },
  { id: 'B4-017', warZone: '华东战区', name: '上海光明食品集团', cdbid: '91310000132256789P', city: '上海', industryCategory: '制造业', registeredCapital: '49.6亿', foundedDate: '2006-08-08' },
  { id: 'B4-018', warZone: '华东战区', name: '上海家化联合股份有限公司', cdbid: '91310000132267890Q', city: '上海', industryCategory: '制造业', registeredCapital: '6.77亿', foundedDate: '1995-12-01' },
  { id: 'B4-019', warZone: '华东战区', name: '申能股份有限公司', cdbid: '91310000132278901R', city: '上海', industryCategory: '电力、热力、燃气及水生产和供应业', registeredCapital: '49.12亿', foundedDate: '1993-02-22' },
  { id: 'B4-020', warZone: '华东战区', name: '上海临港经济发展集团', cdbid: '91310000132289012S', city: '上海', industryCategory: '房地产业', registeredCapital: '75亿', foundedDate: '2003-09-10' },
  { id: 'B4-021', warZone: '华东战区', name: '上海张江高科技园区开发', cdbid: '91310000132290123T', city: '上海', industryCategory: '房地产业', registeredCapital: '15.5亿', foundedDate: '1996-04-18' },
  { id: 'B4-022', warZone: '华东战区', name: '上海外高桥保税区开发', cdbid: '91310000132201234U', city: '上海', industryCategory: '房地产业', registeredCapital: '11.36亿', foundedDate: '1992-12-10' },
  { id: 'B4-023', warZone: '华东战区', name: '上海隧道工程股份有限公司', cdbid: '91310000132212345V', city: '上海', industryCategory: '建筑业', registeredCapital: '31.44亿', foundedDate: '1993-08-09' },
  { id: 'B4-024', warZone: '华东战区', name: '上海华谊集团股份有限公司', cdbid: '91310000132223456W', city: '上海', industryCategory: '制造业', registeredCapital: '21.17亿', foundedDate: '1992-05-05' },
  { id: 'B4-025', warZone: '华东战区', name: '上海锦江国际酒店发展', cdbid: '91310000132234567X', city: '上海', industryCategory: '住宿和餐饮业', registeredCapital: '9.83亿', foundedDate: '1994-12-13' },
  { id: 'B4-026', warZone: '华东战区', name: '上海豫园旅游商城股份', cdbid: '91310000132245678Y', city: '上海', industryCategory: '批发和零售业', registeredCapital: '38.85亿', foundedDate: '1987-11-25' },
  { id: 'B4-027', warZone: '华东战区', name: '上海兰生股份有限公司', cdbid: '91310000132256789Z', city: '上海', industryCategory: '批发和零售业', registeredCapital: '4.2亿', foundedDate: '1993-10-07' },
  { id: 'B4-028', warZone: '华东战区', name: '上海开开实业股份有限公司', cdbid: '91310000132267890A', city: '上海', industryCategory: '制造业', registeredCapital: '2.43亿', foundedDate: '1992-12-28' },
  { id: 'B4-029', warZone: '华东战区', name: '上海三枪集团股份有限公司', cdbid: '91310000132278901B', city: '上海', industryCategory: '制造业', registeredCapital: '3.5亿', foundedDate: '1994-06-28' },
  { id: 'B4-030', warZone: '华东战区', name: '上海龙头集团股份有限公司', cdbid: '91310000132289012C', city: '上海', industryCategory: '制造业', registeredCapital: '4.26亿', foundedDate: '1991-11-18' },
  { id: 'B4-031', warZone: '华东战区', name: '上海友谊集团股份有限公司', cdbid: '91310000132290123D', city: '上海', industryCategory: '批发和零售业', registeredCapital: '17.2亿', foundedDate: '1993-12-21' },
  { id: 'B4-032', warZone: '华东战区', name: '上海第一百货商店股份', cdbid: '91310000132201234E', city: '上海', industryCategory: '批发和零售业', registeredCapital: '5.31亿', foundedDate: '1992-06-01' },
]

// Drill-down data types
type DrillLevel = 'assoc' | 'partner' | 'visit' | 'task'
interface DrillState {
  open: boolean
  level: DrillLevel
  title: string
  data: any
}

// Mock drill-down data generators
function getPartnerOrders(partnerId: string) {
  const orders: { id: string; product: string; quantity: number; amount: number; status: string; date: string }[] = [
    { id: 'E011847924', product: 'ThinkPad X1 Carbon Gen 12', quantity: 50, amount: 625000, status: '排产中', date: '2026-05-01' },
    { id: 'E012498733', product: 'ThinkPad T14 Gen 6 + 扩展坞', quantity: 80, amount: 1120000, status: '生产中', date: '2026-04-25' },
    { id: 'E012320880', product: 'ThinkSystem SR650 V3 + 存储', quantity: 8, amount: 1860000, status: '运输中', date: '2026-04-28' },
    { id: 'E011596720', product: 'ThinkCentre M75q Gen5', quantity: 200, amount: 960000, status: '已签收', date: '2026-04-20' },
    { id: 'E011596719', product: 'ThinkBook 16 G7+', quantity: 30, amount: 255000, status: '排产中', date: '2026-05-02' },
    { id: 'E011596704', product: 'ThinkSystem SD530 V4', quantity: 20, amount: 2800000, status: '待排产', date: '2026-05-04' },
  ]
  return orders.filter((_, i) => (partnerId.charCodeAt(partnerId.length - 1) + i) % 2 === 0).slice(0, 3 + (partnerId.charCodeAt(partnerId.length - 1) % 3))
}

function getPartnerTasks(partnerId: string): TaskItem[] {
  const allTasks: TaskItem[] = [
    { id: 'T-001', content: '完成中芯国际需求调研报告', priority: '高', dueDate: '2026-05-08', status: '待处理', relatedCompany: '中芯国际' },
    { id: 'T-002', content: '提交浦发银行投标文件', priority: '高', dueDate: '2026-05-13', status: '处理中', relatedCompany: '浦发银行' },
    { id: 'T-003', content: '审核伟仕佳杰金牌升级材料', priority: '中', dueDate: '2026-05-10', status: '待处理', relatedCompany: '伟仕佳杰' },
    { id: 'T-004', content: '跟进华勤技术数据中心方案报价', priority: '高', dueDate: '2026-05-09', status: '处理中', relatedCompany: '华勤技术' },
    { id: 'T-005', content: '更新上海市软件行业协会会员联系名录', priority: '低', dueDate: '2026-05-15', status: '待处理' },
    { id: 'T-006', content: '处理上海翎云科技注册伙伴激活流程', priority: '中', dueDate: '2026-05-08', status: '待处理', relatedCompany: '上海翎云科技' },
    { id: 'T-007', content: '神州数码季度对账确认', priority: '中', dueDate: '2026-05-12', status: '处理中', relatedCompany: '神州数码' },
    { id: 'T-008', content: '联强国际承载率提升方案制定', priority: '高', dueDate: '2026-05-11', status: '待处理', relatedCompany: '联强国际' },
  ]
  return allTasks.filter((_, i) => (partnerId.charCodeAt(partnerId.length - 1) + i) % 3 !== 0).slice(0, 3)
}

function getPartnerVisits(partnerId: string): VisitItem[] {
  const allVisits: VisitItem[] = [
    { id: 'V-001', companyName: '中芯国际', contact: '黄总', purpose: '初次拜访，介绍联想ThinkSystem服务器方案', date: '2026-05-07', time: '09:30', status: '待拜访', address: '浦东新区张江路18号' },
    { id: 'V-002', companyName: '韦尔股份', contact: '马总', purpose: '智慧工厂项目需求深化沟通', date: '2026-05-07', time: '14:00', status: '待拜访', address: '浦东新区张江高科技园区' },
    { id: 'V-003', companyName: '华勤技术', contact: '赵总监', purpose: '数据中心二期扩容方案汇报', date: '2026-05-08', time: '10:00', status: '待拜访', address: '浦东新区科苑路399号' },
    { id: 'V-004', companyName: '神州数码', contact: '周总', purpose: '季度业务回顾及下季度订货计划', date: '2026-05-06', time: '15:30', status: '已拜访', address: '浦东新区世纪大道88号' },
    { id: 'V-005', companyName: '芯原股份', contact: '赵总监', purpose: '芯片设计EDA平台IT设备需求调研', date: '2026-05-09', time: '09:00', status: '待拜访', address: '浦东新区松涛路560号' },
    { id: 'V-006', companyName: '上海金陵网络', contact: '姚经理', purpose: '政府集采项目合作洽谈', date: '2026-05-10', time: '10:00', status: '待拜访', address: '浦东新区张杨路550号' },
  ]
  return allVisits.filter((_, i) => (partnerId.charCodeAt(partnerId.length - 1) + i) % 2 === 0).slice(0, 3)
}

function markerColor(status: string): string {
  if (status === '已签约') return '#22c55e'
  if (status === '洽谈中') return '#f59e0b'
  return '#9ca3af'
}

function partnerMarkerColor(level: string): string {
  if (level === '钻石') return '#f59e0b'
  if (level === '金牌') return '#6366f1'
  if (level === '银牌') return '#3b82f6'
  if (level === '铜牌') return '#64748b'
  return '#9ca3af'
}

function ShanghaiMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const [mode, setMode] = useState<'assoc' | 'partner'>('assoc')

  useEffect(() => {
    if (!containerRef.current) return

    const fetchAndInit = async () => {
      const resp = await fetch(import.meta.env.BASE_URL + 'data/上海市.geojson')
      const geoJson = await resp.json()
      echarts.registerMap('shanghai', geoJson)

      if (!containerRef.current) return

      if (chartRef.current) chartRef.current.dispose()
      const chart = echarts.init(containerRef.current)
      chartRef.current = chart

      const isAssoc = mode === 'assoc'
      const seriesData = isAssoc
        ? assocMarkerData.map(m => ({ name: m.name, value: m.value, _raw: m, itemStyle: { color: markerColor(m.status) } }))
        : partnerMarkerData.map((m, i) => {
            const angle = (i / partnerMarkerData.length) * Math.PI * 2
            const radius = 0.08 + (i % 3) * 0.04
            const lng = 121.47 + Math.cos(angle) * radius
            const lat = 31.22 + Math.sin(angle) * radius * 0.7
            return { name: m.name, value: [lng, lat], _raw: m, itemStyle: { color: partnerMarkerColor(m.level) } }
          })

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.seriesType === 'scatter') {
              const d = params.data as any
              if (!d || !d._raw) return ''
              const r = d._raw
              if (isAssoc) {
                const statusColor = r.status === '已签约' ? '#22c55e' : r.status === '洽谈中' ? '#f59e0b' : '#9ca3af'
                const signedHtml = r.signedPartner ? `<div style="font-size:11px;color:#22c55e;margin-bottom:4px;font-weight:600;">✅ 已签约的客户代理商：${r.signedPartner}</div>` : ''
                return `<div style="min-width:180px;font-size:12px;">
                  <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${r.name}</div>
                  <div style="display:flex;gap:6px;margin-bottom:4px;">
                    <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:#e0e7ff;color:#4338ca">${r.type}</span>
                    <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;color:${statusColor}">${r.status}</span>
                  </div>
                  ${signedHtml}
                  <div style="font-size:11px;color:#64748b;margin-bottom:2px;">📍 ${r.address}</div>
                  <div style="font-size:11px;color:#94a3b8;">👤 ${r.contact} · 👥 ${r.memberCount}家会员</div>
                </div>`
              } else {
                const levelColor = partnerMarkerColor(r.level)
                const statusColor = r.status === '活跃' ? '#22c55e' : r.status === '一般' ? '#f59e0b' : '#9ca3af'
                const visitColor = r.visitStatus === '已拜访' ? '#22c55e' : r.visitStatus === '本月已访' ? '#f59e0b' : '#9ca3af'
                return `<div style="min-width:220px;font-size:12px;">
                  <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${r.name}</div>
                  <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:${levelColor}20;color:${levelColor}">${r.level}</span>
                    <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;color:${statusColor}">${r.status}</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#64748b;margin-bottom:4px;">
                    <div>📊 月STI: <b>${r.monthlySTI}</b>台</div>
                    <div>🔒 锁定率: <b>${r.lockRate}%</b></div>
                    <div>📎 承载率: <b>${r.attachRate}%</b></div>
                    <div>📅 最近拜访: <b>${r.lastVisit}</b></div>
                  </div>
                  <div style="font-size:11px;color:${visitColor};font-weight:600;">👤 拜访情况: ${r.visitStatus}</div>
                </div>`
              }
            }
            return params.name || ''
          },
          backgroundColor: '#fff',
          borderColor: '#e2e8f0',
          textStyle: { color: '#1e293b' },
          extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:10px;',
        },
        geo: {
          map: 'shanghai',
          roam: true,
          zoom: 1.2,
          center: [121.47, 31.22],
          label: {
            show: true,
            fontSize: 10,
            color: '#e2e8f0',
            fontWeight: 600,
          },
          itemStyle: {
            areaColor: '#1e3a5f',
            borderColor: '#00d4ff',
            borderWidth: 1.2,
            shadowColor: 'rgba(0, 212, 255, 0.3)',
            shadowBlur: 10,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#2d6aa0',
              borderColor: '#00ffff',
              borderWidth: 2,
            },
            label: {
              show: true,
              fontSize: 12,
              color: '#fff',
              fontWeight: 700,
            },
          },
          select: {
            itemStyle: {
              areaColor: '#2d6aa0',
            },
          },
        },
        series: [
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            data: seriesData,
            symbol: 'pin',
            symbolSize: 28,
            itemStyle: {
              color: '#ef4444',
              borderColor: '#fff',
              borderWidth: 1.5,
              shadowBlur: 8,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{b}',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              textShadowBlur: 4,
              textShadowColor: '#000',
              distance: 6,
            },
            emphasis: {
              scale: 1.5,
              itemStyle: { color: '#ff6666' },
            },
          },
        ],
      }

      chart.setOption(option)
    }

    fetchAndInit()

    const handleResize = () => chartRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.dispose()
        chartRef.current = null
      }
    }
  }, [mode])

  return (
    <div className="shanghai-map-container">
      <div className="shanghai-map-title">
        <span>作战地图</span>
        <div className="map-mode-switch">
          <button className={`map-mode-btn ${mode === 'assoc' ? 'active' : ''}`} onClick={() => setMode('assoc')}>两会一园</button>
          <button className={`map-mode-btn ${mode === 'partner' ? 'active' : ''}`} onClick={() => setMode('partner')}>联想伙伴</button>
        </div>
      </div>
      <div className="chart-sizer" ref={containerRef} />
      <div className="shanghai-map-legend">
        {mode === 'assoc' ? (
          <>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-assoc" />协会</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-chamber" />商会</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-park" />园区</span>
            <span className="map-legend-item" style={{ marginLeft: 'auto', gap: 6 }}>
              <span className="map-legend-dot legend-dot-signed" />已签约
              <span className="map-legend-dot legend-dot-negotiating" />洽谈中
              <span className="map-legend-dot legend-dot-pending" />待开发
            </span>
          </>
        ) : (
          <>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-diamond" />钻石</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-gold" />金牌</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-silver" />银牌</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-bronze" />铜牌</span>
            <span className="map-legend-item"><span className="map-legend-dot legend-dot-reg" />注册</span>
          </>
        )}
      </div>
    </div>
  )
}

function levelClass(level: string) {
  switch (level) {
    case '钻石': return 'diamond'
    case '金牌': return 'gold'
    case '银牌': return 'silver'
    case '铜牌': return 'bronze'
    default: return 'reg'
  }
}

export default function TerritoryDashboard() {
  const [recordModal, setRecordModal] = useState<VisitItem | null>(null)
  const [visitNotes, setVisitNotes] = useState('')
  const [visitLoading, setVisitLoading] = useState(false)
  const [visitResult, setVisitResult] = useState<{ summary: string; nextPlan: string } | null>(null)
  const [visits, setVisits] = useState(_mockVisitsData)
  const [tasks, setTasks] = useState(_mockTasksData)
  const [partnerData] = useState(partnerMarkerData)
  const [assocFilter, setAssocFilter] = useState<string>('全部')
  const [assocSearch, setAssocSearch] = useState('')
  const [partnerPeriodFilter, setPartnerPeriodFilter] = useState<string>('全部')
  const [partnerOutreachFilter, setPartnerOutreachFilter] = useState<string>('全部')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [b4IndustryFilter, setB4IndustryFilter] = useState('全部')
  const [b4Search, setB4Search] = useState('')
  const [b4CdbidSearch, setB4CdbidSearch] = useState('')

  // Drill-down modal state
  const [drill, setDrill] = useState<DrillState>({ open: false, level: 'assoc', title: '', data: null })

  // Company list filtering state (inside the assoc drill modal)
  const [companySearch, setCompanySearch] = useState('')
  const [companyIndustryFilter, setCompanyIndustryFilter] = useState('全部')
  const [companyHighValueFilter, setCompanyHighValueFilter] = useState('全部')
  const [companyCooperationFilter, setCompanyCooperationFilter] = useState('全部')
  // Visit log drill-down
  const [visitLogCompanyId, setVisitLogCompanyId] = useState<string | null>(null)

  const openAssocDrill = (assoc: AssocMarkerEntry) => {
    setDrill({ open: true, level: 'assoc', title: assoc.name, data: assoc })
  }
  const openPartnerDrill = (partner: ChannelPartner) => {
    setDrill({ open: true, level: 'partner', title: partner.name, data: partner })
  }
  const openVisitDrill = (visit: PartnerVisit) => {
    setDrill({ open: true, level: 'visit', title: `${visit.partnerName} · 拜访记录`, data: visit })
  }
  const openTaskDrill = (task: TaskItem) => {
    setDrill({ open: true, level: 'task', title: '任务详情', data: task })
  }
  const closeDrill = () => {
    setDrill(prev => ({ ...prev, open: false }))
    setCompanySearch('')
    setCompanyIndustryFilter('全部')
    setCompanyHighValueFilter('全部')
    setCompanyCooperationFilter('全部')
    setVisitLogCompanyId(null)
  }

  const handleVisitRecord = async () => {
    if (!visitNotes.trim() || !recordModal) return
    setVisitLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const summary = `本次拜访围绕"${recordModal.purpose}"展开，与${recordModal.contact}进行了深入沟通。客户对联想SMB产品线（尤其是ThinkPad T14 Gen 6和ThinkBook 16 G7+）表现出较强兴趣。客户关注点集中在：1）产品价格竞争力；2）售后服务响应速度；3）DaaS租赁模式的灵活性。客户反馈当前竞品Dell Latitude系列供货周期偏长（4-5周），联想交货速度是核心优势。`
    const nextPlan = `1. 本周内发送ThinkPad T14 Gen 6和ThinkBook 16 G7+详细报价单；2. 安排下周三下午上门演示T14样机；3. 跟进DaaS服务方案的财务测算；4. 约两周后进行第二次深度沟通。`
    setVisitResult({ summary, nextPlan })
    setVisitLoading(false)
  }

  const handleConfirmRecord = () => {
    if (!recordModal) return
    setVisits(prev => prev.map(v => v.id === recordModal.id ? { ...v, status: '已拜访' } : v))
    setRecordModal(null)
  }

  const filteredB4Customers = b4Customers.filter(c => {
    const industryMatch = b4IndustryFilter === '全部' || c.industryCategory === b4IndustryFilter
    const searchMatch = b4Search === '' || c.name.includes(b4Search)
    const cdbidMatch = b4CdbidSearch === '' || c.cdbid.includes(b4CdbidSearch)
    return industryMatch && searchMatch && cdbidMatch
  })

  const filteredAssocs = assocMarkerData.filter(a => {
    if (assocFilter !== '全部' && a.status !== assocFilter) return false
    if (assocSearch && !a.name.includes(assocSearch)) return false
    return true
  })

  const filteredPartners = partnerData.filter(p => {
    if (partnerSearch && !p.name.includes(partnerSearch) && !p.channelCode.includes(partnerSearch)) return false
    if (partnerOutreachFilter !== '全部' && p.outreach !== partnerOutreachFilter) return false
    return true
  })

  const getPartnerVisit = (partnerId: string): PartnerVisit | undefined => {
    return mockPartnerVisits.find(v => v.partnerId === partnerId)
  }

  const getPartnerVisitStatus = (visit: PartnerVisit | undefined): string => {
    if (!visit) return '无'
    const days = Math.floor((Date.now() - new Date(visit.visitDate).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 7) return '已拜访'
    if (days <= 30) return '本月已访'
    return '超过1月'
  }

  const getPartnerVisitStatusClass = (visit: PartnerVisit | undefined): string => {
    if (!visit) return 'pv-none'
    const days = Math.floor((Date.now() - new Date(visit.visitDate).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 7) return 'pv-recent'
    if (days <= 30) return 'pv-month'
    return 'pv-old'
  }

  const visitTypeIcon = (t: string) => {
    switch (t) {
      case '例行拜访': return '🔄'
      case '专项沟通': return '💬'
      case '问题处理': return '🔧'
      case '签约拜访': return '✍️'
      default: return '📋'
    }
  }

  return (
    <div>
      <div className="dash-top">
        <div className="dash-greet">
          <h2>您好，黄俊</h2>
          <p>华东战区 | 上海 | 2026年5月9日 周六</p>
        </div>
      </div>

      <div className="map-indicators-row">
        <div className="map-col">
          <ShanghaiMap />
        </div>
        <div className="indicators-col">
          <div className="assoc-section territory-overview-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="section-card-top">
              <span className="section-card-title">辖区总览</span>
            </div>
            <div className="territory-overview-stats">
              {/* ASTI 指标 - 矮卡片 */}
              <div className="overview-stat-item overview-item-short">
                <div className="overview-stat-label">ASTI QTD（台）</div>
                <div className="overview-stat-value">3,280</div>
                <div className="overview-stat-trend up">+8.2% 环比</div>
              </div>
              <div className="overview-stat-item overview-item-short">
                <div className="overview-stat-label">ASTI Target</div>
                <div className="overview-stat-value">4,000</div>
                <div className="overview-stat-trend">季度目标</div>
              </div>
              <div className="overview-stat-item overview-item-short">
                <div className="overview-stat-label">ASTI达成率</div>
                <div className="overview-stat-value">82%</div>
                <div className="channel-progress-bar">
                  <div className="channel-progress-fill" style={{ width: '82%' }} />
                </div>
              </div>
              {/* 渠道激活 + B4客户 - 高卡片 */}
              <div className="overview-stat-item overview-item-tall">
                <div className="overview-stat-label">L1渠道激活情况（辖区计划任务周期内）</div>
                <div className="overview-stat-value">14 / 20</div>
                <div className="channel-progress-bar">
                  <div className="channel-progress-fill" style={{ width: '70%' }} />
                </div>
                <div className="channel-progress-labels">
                  <span>已激活 14</span>
                  <span>未激活 6</span>
                </div>
              </div>
              <div className="overview-stat-item overview-item-tall">
                <div className="overview-stat-label">B4 客户数量</div>
                <div className="overview-stat-value">32 家</div>
                <div className="overview-stat-sub">已触达 20 家 · 未触达 12 家</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row-assoc-partner" style={{ gridTemplateColumns: '1fr' }}>
        <div className="partner-section">
          <div className="section-card-top">
            <span className="section-card-title">辖区作战</span>
            <span className="leads-card-count">共 {filteredPartners.length} 家</span>
          </div>
          <div className="filter-bar">
            <input className="filter-input" placeholder="搜索渠道名称或编码..." value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} />
            <select className="filter-select" value={partnerPeriodFilter} onChange={e => setPartnerPeriodFilter(e.target.value)}>
              <option value="全部">全部周期</option>
              <option value="2026-05">2026-05</option>
              <option value="2026-04">2026-04</option>
              <option value="2026-03">2026-03</option>
            </select>
            <select className="filter-select" value={partnerOutreachFilter} onChange={e => setPartnerOutreachFilter(e.target.value)}>
              <option value="全部">全部触达</option>
              <option value="OS">OS</option>
              <option value="IS">IS</option>
              <option value="BPP">BPP</option>
            </select>
          </div>
          <div className="partner-table-wrapper">
            <table className="partner-table">
              <thead><tr><th>渠道城市</th><th>渠道编码</th><th>渠道名称</th><th>签约级别</th><th>当前财季承诺量</th><th>当季度销量</th><th>上季度销量</th><th>近一年销量</th><th>渠道省份</th><th>战区名称</th><th>签约类型</th><th>是否激活</th><th>触达方式</th></tr></thead>
              <tbody>
                {filteredPartners.map(p => (
                  <tr key={p.id}>
                    <td>{p.city}</td>
                    <td><span className="partner-code">{p.channelCode}</span></td>
                    <td><span className="partner-name-link">{p.name}</span></td>
                    <td><span className={`partner-lvl lvl-${levelClass(p.level)}`}>{p.level}</span></td>
                    <td>{p.quarterlyCommit}</td>
                    <td style={{ fontWeight: 600, color: p.quarterlySales >= p.quarterlyCommit * 0.8 ? 'var(--success)' : 'var(--warning)' }}>{p.quarterlySales}</td>
                    <td>{p.lastQuarterSales}</td>
                    <td>{p.yearlySales}</td>
                    <td>{p.province}</td>
                    <td>{p.warZone}</td>
                    <td><span className="partner-sign-type">{p.signType}</span></td>
                    <td><span className={`partner-active ${p.isActive ? 'active-yes' : 'active-no'}`}>{p.isActive ? '是' : '否'}</span></td>
                    <td><span className={`partner-outreach ${p.outreach ? 'outreach-' + p.outreach.toLowerCase() : 'outreach-empty'}`}>{p.outreach || '——'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="b4-customers-section">
        <div className="section-card b4-management-card">
          <div className="section-card-top">
            <span className="section-card-title">📋 B4 客户经营</span>
            <span className="triple-card-badge">共 {filteredB4Customers.length} 家</span>
          </div>
          <div className="b4-management-content">
            {/* 左侧子卡片：两会一园 */}
            <div className="b4-sub-card b4-left-card">
              <div className="b4-sub-card-title">两会一园</div>
              <div className="filter-bar">
                <input className="filter-input" placeholder="搜索名称..." value={assocSearch} onChange={e => setAssocSearch(e.target.value)} />
                <select className="filter-select" value={assocFilter} onChange={e => setAssocFilter(e.target.value)}>
                  <option value="全部">全部状态</option>
                  <option value="已签约">已签约</option>
                  <option value="洽谈中">洽谈中</option>
                  <option value="待开发">待开发</option>
                </select>
              </div>
              <div className="scrollable-list b4-left-scroll">
                {filteredAssocs.map(item => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'background 150ms', background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`assoc-type ${item.type === '协会' ? 'type-assoc' : item.type === '商会' ? 'type-chamber' : 'type-park'}`}>{item.type}</span>
                      <span style={{ fontWeight: 500, color: 'var(--accent)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); openAssocDrill(item) }}>{item.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--brand-600)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); openAssocDrill(item) }}>{item.memberCount} 家</span>
                      <span className={`assoc-status ${item.status === '已签约' ? 'as-signed' : item.status === '洽谈中' ? 'as-negotiating' : 'as-pending'}`}>{item.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>👤 {item.contact}</span>
                      <span>📞 {item.contactPhone}</span>
                      <span>📍 {item.address}</span>
                      <span>🤝 {item.signedPartner || '——'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 右侧子卡片：B4客户列表 */}
            <div className="b4-sub-card b4-right-card">
              <div className="b4-sub-card-title">客户列表</div>
              <div className="b4-filter-bar">
                <select className="b4-filter-select" value={b4IndustryFilter} onChange={e => setB4IndustryFilter(e.target.value)}>
                  <option value="全部">全部行业门类</option>
                  <option value="制造业">制造业</option>
                  <option value="金融业">金融业</option>
                  <option value="信息传输、软件和信息技术服务业">信息传输、软件和信息技术服务业</option>
                  <option value="批发和零售业">批发和零售业</option>
                  <option value="交通运输、仓储和邮政业">交通运输、仓储和邮政业</option>
                  <option value="建筑业">建筑业</option>
                  <option value="房地产业">房地产业</option>
                  <option value="住宿和餐饮业">住宿和餐饮业</option>
                  <option value="电力、热力、燃气及水生产和供应业">电力、热力、燃气及水生产和供应业</option>
                </select>
                <input className="b4-search-input" placeholder="搜索客户名称..." value={b4Search} onChange={e => setB4Search(e.target.value)} />
                <input className="b4-search-input" placeholder="CDBID精准搜索..." value={b4CdbidSearch} onChange={e => setB4CdbidSearch(e.target.value)} style={{ flex: 0.8 }} />
              </div>
              <div className="b4-table-wrapper b4-right-scroll">
                <table className="b4-table">
                  <thead>
                    <tr>
                      <th>战区</th>
                      <th>客户名称</th>
                      <th>CDBID</th>
                      <th>所属城市</th>
                      <th>国标行业门类</th>
                      <th>注册资本</th>
                      <th>成立日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredB4Customers.map(c => (
                      <tr key={c.id}>
                        <td><span className="b4-warzone">{c.warZone}</span></td>
                        <td><span className="b4-customer-name">{c.name}</span></td>
                        <td><span className="b4-cdbid">{c.cdbid}</span></td>
                        <td>{c.city}</td>
                        <td><span className="b4-industry">{c.industryCategory}</span></td>
                        <td style={{ fontWeight: 600 }}>{c.registeredCapital}</td>
                        <td style={{ fontSize: 11 }}>{c.foundedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIAssistant />

      {/* Unified Drill-down Modal */}
      {drill.open && (
        <div className="modal-overlay" onClick={closeDrill}>
          <div className="visit-modal drill-modal" onClick={e => e.stopPropagation()} style={drill.level === 'assoc' ? { width: 900, maxWidth: '95vw' } : undefined}>
            <div className="visit-modal-head">
              <span className="visit-modal-title">{drill.title}</span>
              <button className="modal-close" onClick={closeDrill}>✕</button>
            </div>
            <div className="visit-modal-body">
              {drill.level === 'assoc' && (() => {
                const assocId = (drill.data as AssocMarkerEntry).id
                const assocEntry = getAssocWithCompanies(assocId)
                if (!assocEntry) return null
                const stats = getCompanyStats(assocEntry.companies)
                const allIndustries = [...new Set(assocEntry.companies.map(c => c.industry))]
                const filtered = getFilteredCompanies(assocEntry.companies, companySearch, companyIndustryFilter, companyHighValueFilter, companyCooperationFilter)
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                      <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>总企业数</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-600)' }}>{stats.total}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>⭐ 高价值客户</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{stats.highValue}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>已合作</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{stats.cooperating}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>洽谈中</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{stats.negotiating}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>待跟进</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}>{stats.pending}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        placeholder="搜索公司名称..."
                        value={companySearch}
                        onChange={e => setCompanySearch(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none', flex: '0 0 180px' }}
                      />
                      <select value={companyIndustryFilter} onChange={e => setCompanyIndustryFilter(e.target.value)} style={{ padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="全部">全部行业</option>
                        {allIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <select value={companyHighValueFilter} onChange={e => setCompanyHighValueFilter(e.target.value)} style={{ padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="全部">高价值客户（全部）</option>
                        <option value="是">是</option>
                        <option value="否">否</option>
                      </select>
                      <select value={companyCooperationFilter} onChange={e => setCompanyCooperationFilter(e.target.value)} style={{ padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="全部">全部状态</option>
                        <option value="已合作">已合作</option>
                        <option value="洽谈中">洽谈中</option>
                        <option value="待跟进">待跟进</option>
                      </select>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>共 {filtered.length} 家</span>
                    </div>
                    <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                      <table style={{ minWidth: 1200, width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>CDBID</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>公司名称</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>行业</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>主营业务</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>营业规模</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>员工人数</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>成立时间</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>决策人</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>决策人电话</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>联系人</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>联系人电话</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>⭐高价值</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>合作状态</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>最近拜访</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(c => (
                            <tr key={c.id} style={{ background: c.isHighValue ? 'rgba(255, 215, 0, 0.08)' : 'transparent' }}>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.cdbid}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', fontWeight: 500 }}>{c.name}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 }}>{c.industry}</span>
                              </td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.mainBusiness}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.businessScale}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.employeeCount}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.foundedDate}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.decisionMakerName}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.decisionMakerPhone}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.contactName}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.contactPhone}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{c.isHighValue ? '⭐是' : '否'}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600, background: c.cooperationStatus === '已合作' ? 'var(--success-light)' : c.cooperationStatus === '洽谈中' ? 'var(--warning-light)' : 'var(--bg-surface)', color: c.cooperationStatus === '已合作' ? 'var(--success)' : c.cooperationStatus === '洽谈中' ? 'var(--warning)' : 'var(--text-muted)' }}>{c.cooperationStatus}</span>
                              </td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                                {c.lastVisitDate ? (
                                  <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setVisitLogCompanyId(c.id)}>{c.lastVisitDate}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>——</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })()}

              {drill.level === 'partner' && (() => {
                const partner = drill.data as any
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>渠道编码</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{partner.channelCode}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>签约级别</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{partner.level}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>所属辖区</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{partner.district || '-'}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>签约类型</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{partner.signType}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>当前财季承诺量</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-600)' }}>{partner.quarterlyCommit}台</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>当季度销量</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{partner.quarterlySales}台</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>上季度销量</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{partner.lastQuarterSales}台</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>近一年销量</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{partner.yearlySales}台</div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {drill.level === 'visit' && (() => {
                const visit = drill.data as PartnerVisit
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>拜访日期</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{visit.visitDate}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>拜访类型</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{visit.visitType}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>参与人员</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{visit.attendees}</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📋 拜访摘要</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{visit.summary}</div>
                    </div>
                    <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📌 下一步计划</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{visit.nextPlan}</div>
                    </div>
                  </div>
                )
              })()}

              {drill.level === 'task' && (() => {
                const task = drill.data as TaskItem
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>任务内容</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{task.content}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>优先级</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: task.priority === '高' ? 'var(--danger)' : task.priority === '中' ? 'var(--warning)' : 'var(--text-muted)' }}>{task.priority}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>截止日期</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{task.dueDate}</div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>状态</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{task.status}</div>
                      </div>
                    </div>
                    {task.relatedCompany && (
                      <div style={{ background: 'var(--bg-body)', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>关联企业</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{task.relatedCompany}</div>
                      </div>
                    )}
                    <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📋 任务说明</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        该任务由辖区经理于本周创建，需在规定时间内完成并提交相关报告。请确保与相关渠道商保持密切沟通，按时推进任务进度。如有困难请及时上报战区协调资源。
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {visitLogCompanyId && (() => {
        const logs = getCompanyVisitLog(visitLogCompanyId)
        const company = getCompanyById(visitLogCompanyId)
        return (
          <div className="modal-overlay" onClick={() => setVisitLogCompanyId(null)}>
            <div className="visit-modal" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: '95vw' }}>
              <div className="visit-modal-head">
                <span className="visit-modal-title">📋 拜访记录 · {company?.name || ''}</span>
                <button className="modal-close" onClick={() => setVisitLogCompanyId(null)}>✕</button>
              </div>
              <div className="visit-modal-body" style={{ maxHeight: 450, overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>暂无拜访记录</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {logs.map(log => (
                      <div key={log.id} style={{ background: 'var(--bg-body)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>📅 {log.visitDate}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>拜访对象：{log.visitTarget}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 }}>
                            {log.visitType === '上门拜访' ? '🚶' : log.visitType === '电话沟通' ? '📞' : '💻'} {log.visitType}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>参与：{log.attendees}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>📝 拜访摘要：</span>{log.summary}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>💬 客户反馈：</span>{log.feedback}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🔜 下一步计划/复盘：</span>{log.nextPlan}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {recordModal && (
        <div className="modal-overlay" onClick={() => !visitLoading && setRecordModal(null)}>
          <div className="visit-record-modal" onClick={e => e.stopPropagation()}>
            <div className="visit-modal-head">
              <span className="visit-modal-title">✍️ 拜访记录 · {recordModal.companyName}</span>
              <button className="modal-close" onClick={() => !visitLoading && setRecordModal(null)}>✕</button>
            </div>
            <div className="visit-record-body">
              <div className="visit-record-info">
                <div className="visit-record-info-item"><span className="vm-label">拜访对象</span><span className="vm-value">{recordModal.companyName}</span></div>
                <div className="visit-record-info-item"><span className="vm-label">联系人</span><span className="vm-value">{recordModal.contact}</span></div>
                <div className="visit-record-info-item"><span className="vm-label">拜访目的</span><span className="vm-value">{recordModal.purpose}</span></div>
                <div className="visit-record-info-item"><span className="vm-label">计划时间</span><span className="vm-value">{recordModal.date} {recordModal.time}</span></div>
              </div>
              <div className="visit-record-input-area">
                <div className="visit-record-label">📝 语音/文字输入拜访内容</div>
                <textarea
                  className="visit-record-textarea"
                  placeholder="请描述本次拜访的内容、讨论要点、客户反馈等...&#10;&#10;支持直接粘贴语音转文字内容，或手动输入拜访记录"
                  value={visitNotes}
                  onChange={e => setVisitNotes(e.target.value)}
                  rows={5}
                />
                <div className="visit-record-actions">
                  <button className="voice-btn" title="语音输入（浏览器语音识别）" onClick={() => {
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                    if (!SpeechRecognition) { alert('当前浏览器不支持语音识别，请使用Chrome或Edge浏览器'); return }
                    const recognition = new SpeechRecognition()
                    recognition.lang = 'zh-CN'
                    recognition.continuous = true
                    recognition.interimResults = true
                    let finalTranscript = visitNotes
                    recognition.onresult = (event: any) => {
                      let interimTranscript = ''
                      for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript
                        if (event.results[i].isFinal) finalTranscript += transcript
                        else interimTranscript += transcript
                      }
                      setVisitNotes(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''))
                    }
                    recognition.onerror = () => recognition.stop()
                    recognition.start()
                  }}>🎤 语音输入</button>
                </div>
              </div>
              {!visitResult && (
                <button className="visit-record-submit" onClick={handleVisitRecord} disabled={!visitNotes.trim() || visitLoading}>
                  {visitLoading ? <span>🤖 AI整理中...</span> : <span>🤖 AI整理纪要和待办</span>}
                </button>
              )}
              {visitResult && (
                <div className="visit-result">
                  <div className="visit-result-section">
                    <div className="visit-result-title">📋 AI 整理的拜访摘要</div>
                    <div className="visit-result-content">{visitResult.summary}</div>
                  </div>
                  <div className="visit-result-section">
                    <div className="visit-result-title">📌 下一步计划（待办）</div>
                    <div className="visit-result-content">{visitResult.nextPlan}</div>
                  </div>
                  <div className="visit-confirm-actions">
                    <button className="visit-confirm-btn" onClick={handleConfirmRecord}>✅ 确认完成拜访</button>
                    <button className="visit-retry-btn" onClick={() => { setVisitResult(null); setVisitNotes('') }}>🔄 重新输入</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}