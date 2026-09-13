import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <h1>404</h1>

      <h2>
        페이지를 찾을 수 없습니다.
      </h2>

      <p>
        주소가 잘못되었거나 존재하지 않는 페이지입니다.
      </p>

      <Link to="/dashboard">
        대시보드로 돌아가기
      </Link>
    </div>
  )
}

export default NotFoundPage