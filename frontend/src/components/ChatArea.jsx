import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import 'remixicon/fonts/remixicon.css';
import { v4 as uuidv4 } from 'uuid';
import { Ripples } from 'ldrs/react'
import 'ldrs/react/Ripples.css'




function Chat() {
    const [ messages, setMessages] = useState([])
    const [query , setQuery] =  useState("");
    const [answer , setAnswer] = useState("");
    
    const apiKey = import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const chatSession = useRef(null); // to keep chatsession consistent during re render
    const [loading , setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [streamAnswer , setStreamAnswer] = useState("")
    const [chatLoading , setChatLoading] = useState(false);

   // to keep chat at bottom for better ux
   useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


// setup google chat when it mounts 
  useEffect(()=>{
      console.log("setUp for chat")
      chatSession.current = ai.chats.create({
        model:"gemini-2.0-flash",
        systemInstruction: "Give concise and helpful answer",
      })
      setLoading(false);
    },[])
    


 // handel user query
  const handelSubmit = async() => {

      console.log("indside handel submit")
      setMessages((prev)=> [...prev , { id: uuidv4()  , role : "user", parts:[{text : query}]}])
      setQuery("")
      const response = await chatSession.current.sendMessageStream({
        message : query,
      })
      setChatLoading(false)
      let ans = ""
      for await (const chunk of response){
        ans += chunk.text;
        setStreamAnswer(ans)

       // 👇 Artificial delay for “typing” effect
        await new Promise((resolve) => setTimeout(resolve, 100)); // 30ms delay per chunk
      }
      console.log(ans)
      setAnswer(ans)
      setStreamAnswer("")
      setMessages((prev) => [...prev , {id: uuidv4() , role : "model" , parts:[{text : ans}]}])
    }



    // to load gemini api 
    if(loading)
      return <div className="flex justify-center h-screen items-center text-2xl">ScreenSense AI is Loading...</div>


  return (
   <div className='h-screen pt-15'>
    {/* chat history  */}
    
      <div className= "flex justify-center">
        <div className='w-full max-h-[82vh]  overflow-y-scroll '>
      { messages.map((message) => (
        <div className='w-[55vw]'
        key={message.id}>

        { message.role === "user" ? ( 
          <div className='flex justify-end mt-1'>
          <div className='p-4 bg-[#222931] text-white rounded-[20px] max-w-[60%] break-words'>
            {message.parts[0].text}
          </div>
        </div> ) :
          (<div className='p-4 mt-1'>
            <div
              className=' text-white/80 mt-1 rounded-[20px]  max-w-[90%] break-words'
              dangerouslySetInnerHTML={{ __html: marked(message.parts[0].text) }}
            ></div>
             
            <div className='w-fit border-1 mt-4 text-[15px] px-2 border-white/20 text-white/50 py-1 rounded-[20px] '><a href="/sihpdf.pdf" target="_blank" rel="noopener noreferrer"><i className="ri-link"></i> source</a></div>

          </div>)
          }
             
        </div>
      ))}



      {/* Live Gemini Typing */}
    {streamAnswer && (
      <div className="flex justify-start mt-1">
      <div
      className="p-4 text-white mt-1 rounded-[20px]  max-w-[60%] break-words"
      dangerouslySetInnerHTML={{ __html: marked(streamAnswer) }}
    ></div>
     </div>
     )}
      {chatLoading ? ( <Ripples
                       size="45"
                       speed="2"
                       color="#0F4C75" 
                    />) : (<div></div>)}
      <div ref={scrollRef} />
        </div>
      </div> 
    


    {/* form for input from user */}
    <div className='flex z-10 justify-center'>
    <form className='fixed bottom-9 w-fit p-2 border-1 border-white/40 rounded-[20px] '
    onSubmit={(e) => {
      console.log("submit")
      setChatLoading(true);
      e.preventDefault();
      handelSubmit(); 
      }}>

      <input type="text" 
      placeholder="Ask Your Query"
      className='p-1 px-2 border-none text-white/60 w-[50vw] outline-none text-xl'
      value={query}
      onChange={(e)=> setQuery(e.target.value)} />
      <button type="submit" className='px-2 py-1 border-white/40 text-white/50 border-1 rounded-[50%]'><i className="ri-arrow-up-line 
        text-2xl"></i></button>
    </form>
    </div>
    </div>

  )
}

export default Chat