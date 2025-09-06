import { useEffect } from "react";


const Patron = () => {
    useEffect(() => {
        document.title = "Patron";
      }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Patron Page</h1>
      <p>Welcome to the patron page!</p>
    </div>
  )
}

export default Patron
