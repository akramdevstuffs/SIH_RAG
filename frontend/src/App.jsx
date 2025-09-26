import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ChatArea from './components/ChatArea'


function App() {
  const [count, setCount] = useState(0)

  return (
   <div className='flex h-screen items-center justify-center'>
      <ChatArea/>
   </div>
  )
}

export default App
