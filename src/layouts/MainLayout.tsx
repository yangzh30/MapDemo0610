import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { mockNews } from '../data/mockData'
import './MainLayout.css'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const getUserName = () => {
    if (location.pathname === '/hq') return '李'
    if (location.pathname === '/warzone') return '王'
    return '张'
  }
  const getUserRole = () => {
    if (location.pathname === '/hq') return '总部管理者 · 全国'
    if (location.pathname === '/warzone') return '战区总经理 · 上海'
    return '辖区经理 · 浦东'
  }

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><img src={import.meta.env.BASE_URL + 'logo.png'} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} /></div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">销售智能体</span>
            <span className="sidebar-brand-sub">Lenovo SMB</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">角色视图</div>
          <button className={`nav-item ${location.pathname === '/territory' ? 'active' : ''}`} onClick={() => navigate('/territory')}>
            <span className="nav-item-icon territory">T</span>
            <span>辖区经理</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{getUserName()}</div>
          <div className="sidebar-user">
            <div className="sidebar-user-name">{getUserName() === '张' ? '张经理' : getUserName() === '王' ? '王总' : '李经理'}</div>
            <div className="sidebar-user-role">{getUserRole()}</div>
          </div>
        </div>
      </aside>

      {location.pathname !== '/hq' && (
        <div className="news-ticker">
          <span className="news-ticker-label">📡 上海快讯</span>
          <div className="news-ticker-track">
            <div className="news-ticker-scroll">
              {[...mockNews, ...mockNews].map((n, i) => (
                <a key={`${n.id}-${i}`} className="news-ticker-item" href={n.url} target="_blank" rel="noopener noreferrer">
                  <span className="news-ticker-tag">{n.tag}</span>
                  <span>{n.text}</span>
                  <span style={{ fontSize: 10, color: 'oklch(0.75 0.04 270)' }}>{n.time}</span>
                  <span className="news-ticker-dot" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="main-content" style={location.pathname === '/hq' ? { marginTop: 0 } : undefined}>
        <div className="content-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
