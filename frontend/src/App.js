import React, { useState, useEffect } from 'react';
import { Layout, Typography, Input, Button, message, Card, Spin, Modal, Row, Col, Space, Dropdown, Menu, Divider, Badge } from 'antd';
import { DownloadOutlined, UserOutlined, InfoCircleOutlined, QuestionCircleOutlined, GlobalOutlined, GithubOutlined, EyeOutlined, FilePdfOutlined, HeartOutlined, MessageOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './i18n';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const LOGO = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <rect width="36" height="36" rx="8" fill="#1677ff"/>
    <text x="50%" y="56%" textAnchor="middle" fill="#fff" fontSize="20" fontFamily="Arial" fontWeight="bold" dy=".3em">合</text>
  </svg>
);

const EXAMPLE_TEXT_ZH = `甲方（用人单位）：XXX公司\n乙方（员工）：张三\n岗位：软件工程师\n试用期：3个月\n工资：12000元/月\n主要条款：\n1. 乙方应遵守公司规章制度。\n2. 合同期满自动终止，提前解除需提前30天通知。\n3. 其他未尽事宜，双方协商解决。`;
const EXAMPLE_TEXT_EN = `Party A (Employer): XXX Company\nParty B (Employee): John Doe\nPosition: Software Engineer\nProbation: 3 months\nSalary: $2000/month\nMain Terms:\n1. Party B shall comply with company rules.\n2. The contract ends automatically upon expiration; early termination requires 30 days notice.\n3. Other matters to be resolved by mutual agreement.`;

// 示例合同清单（已根据 public/pdfs 目录实际文件同步）
const SAMPLE_PDFS = [
  { label: '制造供货协议', lang: 'zh', path: '/pdfs/zh/制造供货协议.pdf' },
  { label: '劳务合同', lang: 'zh', path: '/pdfs/zh/劳务合同.pdf' },
  { label: 'Loan Agreement', lang: 'en', path: '/pdfs/en/LoanAgreement.pdf' },
  { label: 'Software Developer Employment', lang: 'en', path: '/pdfs/en/SOFTWARE_DEVELOPE_REMPLOYMENT.pdf' },
];

// 多种合同类型的示例文本（中英文）
const SAMPLE_TEXTS = [
  {
    key: 'employment',
    labelZh: '劳动合同',
    labelEn: 'Employment Agreement',
    textZh: `劳动合同示例\n甲方：某科技有限公司\n乙方：张三\n岗位：前端工程师\n试用期：3个月\n薪酬：基本工资+绩效\n主要条款：\n1. 工作时间与休假；\n2. 保密与知识产权归属；\n3. 竞业及违约责任；\n4. 解除与经济补偿；\n5. 争议解决与适用法。`,
    textEn: `Employment Agreement Sample\nEmployer: ABC Tech Co., Ltd.\nEmployee: John Doe\nPosition: Frontend Engineer\nProbation: 3 months\nCompensation: Base + Performance\nMain Clauses:\n1. Working hours and leave;\n2. Confidentiality and IP assignment;\n3. Non-compete and liabilities;\n4. Termination and severance;\n5. Dispute resolution and governing law.`,
  },
  {
    key: 'service',
    labelZh: '服务协议',
    labelEn: 'Service Agreement',
    textZh: `服务协议示例\n甲方：委托方\n乙方：服务方\n服务范围：UI设计与前端实现\n交付：高保真稿+组件库\n费用：分里程碑支付\n主要条款：服务标准、变更管理、验收、费用与税费、违约与赔偿、保密与IP、争议解决。`,
    textEn: `Service Agreement Sample\nClient: Party A\nContractor: Party B\nScope: UI design and frontend implementation\nDeliverables: Hi-fi mockups + component library\nPayment: Milestone-based\nKey Terms: Service levels, change management, acceptance, fees/taxes, default/remedies, confidentiality/IP, dispute resolution.`,
  },
  {
    key: 'nda',
    labelZh: '保密协议（NDA）',
    labelEn: 'NDA',
    textZh: `保密协议示例\n披露方：甲方\n接收方：乙方\n机密信息定义、使用目的限制、保密期限、例外情形、资料返还/销毁、禁令救济、适用法与争议解决。`,
    textEn: `NDA Sample\nDisclosing Party: Party A\nReceiving Party: Party B\nConfidential info definition, purpose limitation, term, exclusions, return/destruction, injunctive relief, governing law and dispute resolution.`,
  },
  {
    key: 'sales',
    labelZh: '买卖合同',
    labelEn: 'Sales Agreement',
    textZh: `买卖合同示例\n标的：电子产品\n规格/数量：见附件清单\n价格：含税价\n交付：Incoterms 2020\n验收：到货7日内\n主要条款：风险转移、质量保证、付款、违约与索赔、不可抗力、争议解决。`,
    textEn: `Sales Agreement Sample\nGoods: Electronics\nSpecs/Qty: See annex list\nPrice: Tax included\nDelivery: Incoterms 2020\nInspection: Within 7 days after arrival\nKey Terms: Risk transfer, warranty, payment, default/claims, force majeure, dispute resolution.`,
  },
  {
    key: 'lease',
    labelZh: '房屋租赁合同（住宅）',
    labelEn: 'Residential Lease',
    textZh: `住宅租赁合同示例\n地址：上海市XX路XX号\n租期：12个月\n租金与押金：详见条款\n主要条款：维修责任、入住检查、续租/退租、违约处理、房屋规则、争议解决。`,
    textEn: `Residential Lease Sample\nAddress: No. XX, XX Road, Shanghai\nTerm: 12 months\nRent & Deposit: See clauses\nKey Terms: Maintenance, move-in checklist, renewal/move-out, default handling, house rules, dispute resolution.`,
  },
  {
    key: 'loan',
    labelZh: '借款协议',
    labelEn: 'Loan Agreement',
    textZh: `借款协议示例\n本金：人民币100,000元\n利率：年化8%\n期限：12个月\n还款：等额本息\n担保：无/保证/抵押\n主要条款：提前还款、违约事件与加速到期、费用与税费、争议解决。`,
    textEn: `Loan Agreement Sample\nPrincipal: CNY 100,000\nInterest: 8% p.a.\nTerm: 12 months\nRepayment: Equal installments\nSecurity: None/Guarantee/Mortgage\nKey Terms: Prepayment, events of default and acceleration, fees/taxes, dispute resolution.`,
  },
];

function App() {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // 动画演示状态
  const [demoText, setDemoText] = useState('');
  const [demoStage, setDemoStage] = useState('typing'); // typing, generating, complete
  const [showDemoPdf, setShowDemoPdf] = useState(false);

  // 获取展示用的PDF URL
  const showcaseUrl = (
    i18n.language === 'zh'
      ? SAMPLE_PDFS.find(i => i.lang === 'zh')?.path
      : SAMPLE_PDFS.find(i => i.lang === 'en')?.path
  ) || SAMPLE_PDFS[0]?.path || '';

  // 动画演示逻辑
  useEffect(() => {
    const demoPromptZh = '甲方：XXX科技公司\n乙方：张三\n岗位：高级软件工程师\n试用期：3个月\n薪资：月薪15000元\n工作地点：北京市朝阳区\n合同期限：3年\n主要条款：遵守公司规章制度，保密协议，社保福利完善';
    const demoPromptEn = 'Party A: XXX Tech Company\nParty B: John Smith\nPosition: Senior Software Engineer\nProbation: 3 months\nSalary: $3000/month\nLocation: Beijing\nTerm: 3 years\nTerms: Follow company rules, NDA, full benefits';

    let currentIndex = 0;
    let typingTimer = null;
    let generatingTimer = null;
    let completeTimer = null;
    let restartTimer = null;
    let isCancelled = false;

    const startAnimation = () => {
      if (isCancelled) return;
      
      // 每次动画开始时重新获取当前语言的文本
      const currentText = i18n.language === 'zh' ? demoPromptZh : demoPromptEn;
      
      // 重置状态
      setDemoText('');
      setDemoStage('typing');
      setShowDemoPdf(false);
      currentIndex = 0;

      // 打字效果
      typingTimer = setInterval(() => {
        if (isCancelled) {
          clearInterval(typingTimer);
          return;
        }
        
        if (currentIndex < currentText.length) {
          setDemoText(currentText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingTimer);
          // 打字完成，进入生成阶段
          generatingTimer = setTimeout(() => {
            if (isCancelled) return;
            setDemoStage('generating');
            // 生成中持续2秒
            completeTimer = setTimeout(() => {
              if (isCancelled) return;
              setDemoStage('complete');
              setShowDemoPdf(true);
              // 完成后停留3秒，然后重新开始
              restartTimer = setTimeout(() => {
                if (isCancelled) return;
                startAnimation();
              }, 4000);
            }, 2000);
          }, 500);
        }
      }, 50);
    };

    startAnimation();

    return () => {
      // 清理所有定时器
      isCancelled = true;
      if (typingTimer) clearInterval(typingTimer);
      if (generatingTimer) clearTimeout(generatingTimer);
      if (completeTimer) clearTimeout(completeTimer);
      if (restartTimer) clearTimeout(restartTimer);
    };
  }, [i18n.language]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      message.warning(t('failMsg'));
      return;
    }
    if (!activationCode.trim()) {
      message.warning(t('activationCodeRequired'));
      return;
    }
    setLoading(true);
    setPdfUrl(null);
    try {
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('activation_code', activationCode);
      const response = await fetch('http://192.168.5.15:8000/generate_contract/', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        // 如果是401错误，说明激活码无效
        if (response.status === 401 || response.status === 403) {
          throw new Error(t('activationCodeInvalid'));
        }
        throw new Error(t('failMsg'));
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      message.success(t('successMsg'));
    } catch (e) {
      message.error(e.message || t('failMsg'));
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setInputText(i18n.language === 'zh' ? EXAMPLE_TEXT_ZH : EXAMPLE_TEXT_EN);
    message.info(t('fillExample'));
  };

  const handleFillExampleByKey = (key) => {
    const item = SAMPLE_TEXTS.find(i => i.key === key);
    if (!item) return;
    setInputText(i18n.language === 'zh' ? item.textZh : item.textEn);
    message.success(i18n.language === 'zh' ? `已填入：${item.labelZh}` : `Filled: ${item.labelEn}`);
  };

  const exampleMenu = (
    <Menu onClick={({ key }) => handleFillExampleByKey(key)}>
      {SAMPLE_TEXTS.map(i => (
        <Menu.Item key={i.key}>{i18n.language === 'zh' ? i.labelZh : i.labelEn}</Menu.Item>
      ))}
    </Menu>
  );

  const handleLangChange = ({ key }) => {
    i18n.changeLanguage(key);
  };

  const langMenu = (
    <Menu onClick={handleLangChange} selectedKeys={[i18n.language]}>
      <Menu.Item key="zh">中文</Menu.Item>
      <Menu.Item key="en">English</Menu.Item>
    </Menu>
  );

  const openPreview = (url) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{ background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: 0 }}>
        <Row align="middle" justify="space-between" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Col>
            <Space align="center">
              <span style={{display: 'flex', alignItems: 'center', marginRight: 10}}>{LOGO}</span>
              <Title level={3} style={{ margin: 0, color: '#1677ff', lineHeight: '36px' }}>{t('appName')}</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>{t('slogan')}</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Dropdown overlay={langMenu} placement="bottomRight">
                <Button icon={<GlobalOutlined />}>{i18n.language === 'zh' ? '中文' : 'English'}</Button>
              </Dropdown>
              <Button type="text" icon={<QuestionCircleOutlined />} onClick={() => setShowModal(true)}>
                {t('faq')}
              </Button>
              <Button
                type="primary"
                icon={<HeartOutlined />}
                onClick={() => {
                  const pricingSection = document.querySelector('.pricing-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {i18n.language === 'zh' ? '查看定价' : 'View Pricing'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: 600, padding: '32px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 动画演示区域 */}
          <Card style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={3} style={{ marginBottom: 8 }}>
                {t('demoTitle')}
              </Title>
            </div>
            <Row gutter={[24, 24]} align="stretch">
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#fafafa', 
                  borderRadius: 8, 
                  padding: 16, 
                  height: '100%',
                  minHeight: 300,
                  border: '1px solid #e8e8e8',
                  position: 'relative'
                }}>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#999', 
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: demoStage === 'typing' ? '#52c41a' : '#d9d9d9' 
                    }} />
                    {i18n.language === 'zh' ? '输入合同信息' : 'Input Contract Details'}
                  </div>
                  <div className={demoStage === 'generating' || demoStage === 'complete' ? 'ai-generating' : ''}>
                    <TextArea
                      value={demoText}
                      readOnly
                      rows={10}
                      style={{ 
                        resize: 'none',
                        cursor: 'default',
                        background: '#fff',
                        fontFamily: 'monospace'
                      }}
                      className={demoStage === 'generating' || demoStage === 'complete' ? 'ai-generating-inner' : ''}
                      placeholder={i18n.language === 'zh' ? '正在输入...' : 'Typing...'}
                    />
                  </div>
                  {demoStage === 'typing' && (
                    <div style={{
                      position: 'absolute',
                      bottom: 24,
                      right: 24,
                      width: 2,
                      height: 20,
                      background: '#1677ff',
                      animation: 'blink 1s infinite'
                    }} />
                  )}
                  {demoStage === 'generating' && (
                    <div style={{ 
                      marginTop: 16, 
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}>
                      <Spin size="small" />
                      <Text type="secondary">{t('demoGenerating')}</Text>
                    </div>
                  )}
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#fafafa', 
                  borderRadius: 8, 
                  padding: 16, 
                  height: '100%',
                  minHeight: 300,
                  border: '1px solid #e8e8e8',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#999', 
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: demoStage === 'complete' ? '#52c41a' : '#d9d9d9' 
                    }} />
                    {i18n.language === 'zh' ? '生成专业PDF合同' : 'Generate Professional PDF'}
                  </div>
                  {!showDemoPdf ? (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fff',
                      borderRadius: 8,
                      border: '2px dashed #d9d9d9'
                    }}>
                      {demoStage === 'generating' ? (
                        <div style={{ textAlign: 'center' }}>
                          <Spin size="large" />
                          <div style={{ marginTop: 16, color: '#666' }}>{t('demoGenerating')}</div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#999' }}>
                          <FilePdfOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                          <div style={{ marginTop: 8 }}>
                            {i18n.language === 'zh' ? '等待生成...' : 'Waiting...'}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      flex: 1,
                      background: '#fff',
                      borderRadius: 8,
                      overflow: 'hidden',
                      position: 'relative',
                      animation: 'fadeIn 0.5s ease-in'
                    }}>
                      <iframe
                        title="demo-pdf"
                        src={showcaseUrl}
                        style={{ width: '100%', height: '100%', border: 0, minHeight: 260 }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#52c41a',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircleOutlined />
                        {t('demoComplete')}
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 24px #e6eaf1' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>{t('inputTitle')}</Title>
          <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
            {t('inputDesc')}
          </Paragraph>
          <div className={loading ? 'ai-generating' : ''} style={{ marginBottom: 16, borderRadius: 8 }}>
            <TextArea
              rows={8}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={t('inputPlaceholder')}
              style={{ resize: 'vertical' }}
              className={loading ? 'ai-generating-inner' : ''}
              allowClear
            />
          </div>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
            <Space wrap>
              <Button onClick={handleExample} type="dashed" icon={<InfoCircleOutlined />}>{t('exampleBtn')}</Button>
              <Dropdown overlay={exampleMenu} placement="bottomLeft" trigger={['click']}>
                <Button>{i18n.language === 'zh' ? '更多示例' : 'More Samples'}</Button>
              </Dropdown>
            </Space>
          </Space>
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong>{t('activationCode')}:</Text>
              <Button 
                type="link" 
                size="small" 
                icon={<QuestionCircleOutlined />}
                onClick={() => {
                  Modal.info({
                    title: t('howToGetCode'),
                    content: t('codeInstruction'),
                  });
                }}
                style={{ padding: 0, height: 'auto' }}
              >
                {t('howToGetCode')}
              </Button>
            </div>
            <Input
              value={activationCode}
              onChange={e => setActivationCode(e.target.value)}
              placeholder={t('activationCodePlaceholder')}
              style={{ marginBottom: 8 }}
              size="large"
              prefix={<UserOutlined style={{ color: '#999' }} />}
              allowClear
            />
            <Button 
              type="primary" 
              loading={loading} 
              onClick={handleGenerate} 
              block 
              size="large"
              style={{ height: 48 }}
            >
              {t('generateBtn')}
            </Button>
          </Space>
          {loading && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <Spin tip={t('loadingTip')} size="large" />
            </div>
          )}
          {pdfUrl && !loading && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              href={pdfUrl}
              download="contract.pdf"
              block
              size="large"
              style={{ marginTop: 16, background: '#52c41a', borderColor: '#52c41a' }}
            >
              {t('downBtn')}
            </Button>
          )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ width: '100%', height: '100%', borderRadius: 12, boxShadow: '0 4px 24px #e6eaf1' }}>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {i18n.language === 'zh' ? '即时预览' : 'Live Preview'}
                </Title>
                <Paragraph type="secondary" style={{ marginTop: -4, marginBottom: 12 }}>
                  {i18n.language === 'zh' ? '右侧展示一个合同 PDF 示例，帮助快速了解效果' : 'A sample contract PDF to help you understand the output instantly'}
                </Paragraph>
                <div style={{ width: '100%', height: 600, borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0', position: 'relative' }}>
                  <iframe title="pdf-showcase" src={showcaseUrl} style={{ width: '100%', height: '100%', border: 0 }} />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      right: 8, 
                      background: 'rgba(0,0,0,0.7)', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      fontSize: 12,
                      display: 'none'
                    }}
                    className="mobile-pdf-hint"
                  >
                    {i18n.language === 'zh' ? '点击查看大图' : 'Tap to view full size'}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          <Card style={{ width: '100%', marginTop: 24, borderRadius: 12, boxShadow: '0 4px 24px #e6eaf1' }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
              <FilePdfOutlined style={{ color: '#d4380d' }} />
              {i18n.language === 'zh' ? '示例合同预览' : 'Contract Sample Preview'}
            </span>
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={5} style={{ marginTop: 0 }}>{i18n.language === 'zh' ? '中文示例' : 'Chinese Samples'}</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {SAMPLE_PDFS.filter(i => i.lang === 'zh').map(item => (
                  <Row key={item.path} align="middle" justify="space-between" style={{ width: '100%' }}>
                    <Col span={14}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                      <Space>
                        <Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(item.path)}>
                          {i18n.language === 'zh' ? '预览' : 'Preview'}
                        </Button>
                        <Button size="small" type="primary" icon={<DownloadOutlined />} href={item.path} download>
                          {i18n.language === 'zh' ? '下载' : 'Download'}
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                ))}
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5} style={{ marginTop: 0 }}>{i18n.language === 'zh' ? '英文示例' : 'English Samples'}</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {SAMPLE_PDFS.filter(i => i.lang === 'en').map(item => (
                  <Row key={item.path} align="middle" justify="space-between" style={{ width: '100%' }}>
                    <Col span={14}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                      <Space>
                        <Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(item.path)}>
                          {i18n.language === 'zh' ? '预览' : 'Preview'}
                        </Button>
                        <Button size="small" type="primary" icon={<DownloadOutlined />} href={item.path} download>
                          {i18n.language === 'zh' ? '下载' : 'Download'}
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                ))}
              </Space>
            </Col>
          </Row>
          </Card>

          {/* 定价部分 */}
          <Card className="pricing-section" style={{ width: '100%', marginTop: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ marginBottom: 8 }}>
                {t('pricingTitle')}
              </Title>
              <Text type="secondary">{t('pricingSubtitle')}</Text>
            </div>
            <Row gutter={[24, 24]}>
              {/* 基础套餐 */}
              <Col xs={24} md={12}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      {t('basicPlan')}
                    </Title>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 36, fontWeight: 'bold', color: '#000' }}>{t('price3')}</span>
                    </div>
                    <div style={{ marginBottom: 24, color: '#666' }}>
                      {t('uses20')}
                    </div>
                    <Divider style={{ margin: '16px 0' }} />
                    <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24, textAlign: 'left' }}>
                      <div style={{ fontSize: 14 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {t('feature1')}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {t('feature2')}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {t('feature3')}
                      </div>
                    </Space>
                    <Button
                      type="default"
                      size="large"
                      block
                      href="https://paypal.me/helpassister/3"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('purchaseNow')}
                    </Button>
                  </div>
                </Card>
              </Col>

              {/* 专业套餐 */}
              <Col xs={24} md={12}>
                <Badge.Ribbon 
                  text={t('mostPopular')} 
                  color="#1677ff"
                >
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: 8,
                      border: '2px solid #1677ff'
                    }}
                    bodyStyle={{ padding: '24px' }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={4} style={{ marginBottom: 16 }}>
                        {t('proPlan')}
                      </Title>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 36, fontWeight: 'bold', color: '#000' }}>{t('price15')}</span>
                      </div>
                      <div style={{ marginBottom: 24, color: '#666' }}>
                        {t('usesUnlimited')}
                      </div>
                      <Divider style={{ margin: '16px 0' }} />
                      <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24, textAlign: 'left' }}>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature1')}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature2')}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature3')}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature4')}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature5')}
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {t('feature6')}
                        </div>
                      </Space>
                      <Button
                        type="primary"
                        size="large"
                        block
                        href="https://paypal.me/helpassister/15"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('purchaseNow')}
                      </Button>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            </Row>
          </Card>
        </div>
        <Modal
          title={i18n.language === 'zh' ? 'PDF 合同预览' : 'PDF Contract Preview'}
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          footer={null}
          width={980}
          style={{ top: 24 }}
          bodyStyle={{ padding: 0 }}
        >
          <iframe
            title="pdf-preview"
            src={previewUrl}
            style={{ width: '100%', height: '80vh', border: 0, borderRadius: 8 }}
          />
        </Modal>
        <Modal
          title={t('faq')}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
        >
          <Paragraph><b>{t('faq1q')}</b><br />{t('faq1a')}</Paragraph>
          <Paragraph><b>{t('faq2q')}</b><br />{t('faq2a')}</Paragraph>
          <Paragraph><b>{t('faq3q')}</b><br />{t('faq3a')}</Paragraph>
          <Paragraph><b>{t('faq4q')}</b><br />{t('faq4a')}</Paragraph>
        </Modal>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text>{t('footer1')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{t('footer2')}</Text>
          
          {/* 社区链接 */}
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
              {i18n.language === 'zh' ? '加入社区交流' : 'Join Our Community'}
            </Text>
            <Space size={8} wrap>
              <a
                href="https://discord.gg/VTpU6DsnNG"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#5865F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#4752C4';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#5865F2';
                }}
              >
                <MessageOutlined style={{ fontSize: 14 }} />
                Discord
              </a>
              <a
                href="https://t.me/+hac-zqnBjXs4NzI9"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#0088cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#0077b3';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#0088cc';
                }}
              >
                <SendOutlined style={{ fontSize: 14 }} />
                Telegram
              </a>
            </Space>
          </div>
          
          <span style={{fontSize: 14, color: '#888', marginTop: 8}}>开源地址：</span>
          <a
            href="https://github.com/HuangRunzhe/Text2Contract"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#f5f7fa',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              padding: '2px 12px',
              fontSize: 14,
              color: '#1677ff',
              fontWeight: 500,
              marginTop: 2,
              textDecoration: 'none',
              transition: 'background 0.2s, border 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#e6f4ff';
              e.currentTarget.style.border = '1px solid #1677ff';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#f5f7fa';
              e.currentTarget.style.border = '1px solid #e0e0e0';
            }}
          >
            <GithubOutlined style={{ fontSize: 16 }} />
            HuangRunzhe/Text2Contract
          </a>
        </Space>
      </Footer>
    </Layout>
  );
}

export default App;
