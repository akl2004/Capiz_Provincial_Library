import React, { useEffect } from 'react'

const Reports = () => {
    useEffect(() => {
        document.title = "Reports";
      }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Reports Page</h1>
      <p>Welcome to the reports page!</p>
    </div>
  )
}

export default Reports
