# 학원 학생 관리 시스템

학원 원장과 선생님이 학생 정보, 출석, 수업 기록, 교재, 메모, 일반 일정, 시험 일정을 한 곳에서 관리할 수 있도록 만든 웹 기반 학생 관리 시스템입니다.

## 배포 주소

- 서비스: https://academy-student-manager.vercel.app
- GitHub: https://github.com/dldma/academy-student-manager

## 주요 기능

### 로그인 / 권한 관리

- Supabase 이메일/비밀번호 로그인
- `admin` / `teacher` 역할 구분
- 비로그인 사용자의 보호 페이지 접근 차단
- 일반 선생님의 원장 관리 페이지 접근 제한

### 학생 관리

- 학생 등록
- 학생 정보 수정
- 학생 연락처 / 학부모 연락처 관리
- 담당 선생님 배정
- 요일별 수업 일정 등록
- 학생 퇴원 / 재등록

### 출석 관리

- 오늘 수업 학생 확인
- 등교
- 유예등교
- 결석
- 하원
- 실제 등하원 시간 기록

### 학생별 수업 기록

- 월간 수업 기록 달력
- 숙제 상태 기록
- 지각 여부 기록
- 수업 내용 기록
- 숙제 내용 기록

### 교재 관리

- 앞으로 사용할 교재
- 현재 사용 중인 교재
- 사용 완료 교재
- 교재별 메모 관리

### 메모 관리

- 학생 개인 메모
- 공용 메모
- 학원 전체 날짜 메모

### 일정 관리

- 일반 일정 등록
- 여러 날짜에 걸친 일정 연속 표시
- 월간 달력에서 일정 바로 확인
- 일정 추가 / 확인

### 시험 일정 관리

- 학교 입력
- 시험명 선택
- 전체 시험기간 입력
- 시험 대상 학년 선택
- 학년별 시험일 설정
- 시험일 미확정 시 `보류` 처리
- 보류 해제 후 시험일 확정
- 시험 일정 수정
- 시험 일정 삭제
- 전체 시험기간을 월간 달력에 연속 막대로 표시

## 기술 스택

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS

### Backend / Database

- Supabase
- Supabase Authentication
- PostgreSQL
- Row Level Security
- PostgreSQL RPC

### Deployment / Version Control

- Vercel
- Git
- GitHub

## 프로젝트 구조

```text
src/
├── components/
│   ├── AdminRoute.jsx
│   ├── AppHeader.jsx
│   ├── CalendarPanel.jsx
│   ├── EmptyState.jsx
│   ├── ErrorState.jsx
│   ├── ExamSchedulePanel.jsx
│   ├── LoadingState.jsx
│   ├── ProtectedRoute.jsx
│   ├── StudentBookManager.jsx
│   ├── StudentMemoManager.jsx
│   ├── StudentRecordCalendar.jsx
│   └── TodayMemoPanel.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   ├── useStudents.js
│   └── useTodayAttendance.js
├── lib/
│   └── supabase.js
├── pages/
│   ├── AdminPage.jsx
│   ├── AdminStudentDetailPage.jsx
│   ├── AdminStudentNewPage.jsx
│   ├── AdminStudentsPage.jsx
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── NotFoundPage.jsx
│   └── StudentDetailPage.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx