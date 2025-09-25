import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'


function App() {
  const [count, setCount] = useState(0)

  return (
   <div className='flex h-screen items-center justify-center'>
    <h1 className='text-4xl font-mono'>SIH RAG</h1>
   </div>
  )
}

export default App
