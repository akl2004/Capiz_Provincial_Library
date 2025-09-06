import { useEffect } from 'react'

const Attendance = () => {
    useEffect(() => {
        document.title = "Attendance";
      }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Attendance Page</h1>
      <p>Welcome to the attendance page!</p>
    </div>
  )
}

export default Attendance
