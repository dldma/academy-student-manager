function ErrorState({ message = '요청에 실패했습니다.' }) {
  return (
    <div>
      <p>{message}</p>
      <p>잠시 후 다시 시도해주세요.</p>
    </div>
  )
}

export default ErrorState