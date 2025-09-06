import { useEffect } from 'react'

const Circulation = () => {
    useEffect(() => {
        document.title = "Circulation";
      }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Circulation Page</h1>
      <p>Welcome to the circulation page!</p>
    </div>
  )
}

export default Circulation
