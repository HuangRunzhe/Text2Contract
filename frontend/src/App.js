import React, { useState } from 'react';
import { Layout, Typography, Input, Button, message, Card, Spin, Modal, Row, Col, Space, Dropdown, Menu } from 'antd';
import { DownloadOutlined, UserOutlined, InfoCircleOutlined, QuestionCircleOutlined, GlobalOutlined, GithubOutlined } from '@ant-design/icons';
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

function App() {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      message.warning(t('failMsg'));
      return;
    }
    setLoading(true);
    setPdfUrl(null);
    try {
      const formData = new FormData();
      formData.append('text', inputText);
      const response = await fetch('http://localhost:8000/generate_contract/', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(t('failMsg'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      message.success(t('successMsg'));
    } catch (e) {
      message.error(t('failMsg'));
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setInputText(i18n.language === 'zh' ? EXAMPLE_TEXT_ZH : EXAMPLE_TEXT_EN);
    message.info(t('fillExample'));
  };

  const handleLangChange = ({ key }) => {
    i18n.changeLanguage(key);
  };

  const langMenu = (
    <Menu onClick={handleLangChange} selectedKeys={[i18n.language]}>
      <Menu.Item key="zh">中文</Menu.Item>
      <Menu.Item key="en">English</Menu.Item>
    </Menu>
  );

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
              <Button type="primary" icon={<UserOutlined />}>{t('login')}</Button>
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ width: 500, margin: '48px 0', borderRadius: 12, boxShadow: '0 4px 24px #e6eaf1' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>{t('inputTitle')}</Title>
          <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
            {t('inputDesc')}
          </Paragraph>
          <TextArea
            rows={8}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('inputPlaceholder')}
            style={{ marginBottom: 16, resize: 'vertical' }}
            allowClear
          />
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
            <Button onClick={handleExample} type="dashed" icon={<InfoCircleOutlined />}>{t('exampleBtn')}</Button>
            <Button type="primary" loading={loading} onClick={handleGenerate} style={{ width: 180 }} size="large">
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
          <span style={{fontSize: 14, color: '#888', marginTop: 2}}>开源地址：</span>
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
