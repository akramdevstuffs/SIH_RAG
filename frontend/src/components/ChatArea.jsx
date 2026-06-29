import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";
import "remixicon/fonts/remixicon.css";

import { search, downloadFile } from "../api";




function Chat() {
    const [ messages, setMessages] = useState([])
    const [query , setQuery] =  useState("");

    const scrollRef = useRef(null);
    const [chatLoading , setChatLoading] = useState(false);

   // to keep chat at bottom for better ux
   useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); 

    

 // handle user query
  const handleSubmit = async() => {

    if (!query.trim()) return;

      const userQuery = query;

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "user",
          parts: [{ text: userQuery }],
        },
      ]);

      setQuery("");
      setChatLoading(true);

      try {
        const data = await search(userQuery);

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "model",
            sources: data.results,
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "model",
            parts: [
              {
                text: `❌ ${err.message}`,
              },
            ],
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    }

return (
   <div className='h-screen pt-15'>
    {/* chat history  */}
    
      <div className= "flex justify-center">
        <div className='w-[full] max-h-[82vh]  overflow-y-scroll '>
      { messages.map((message) => (
        <div className='w-[55vw]'
        key={message.id}>

        { message.role === "user" ? ( 
          <div className='flex justify-end mt-1'>
          <div className='p-4 bg-neutral-700 text-white rounded-[20px] max-w-[60%] break-words'>
            {message.parts[0].text}
          </div>
        </div> ) :
          (<div className='p-4 mt-1'>
              <div className="space-y-4">
                {message.sources?.length > 0 ? (
                  message.sources.map((source) => (
                    <div
                      key={source.id}
                      className="border border-white/20 rounded-xl p-4 bg-neutral-900"
                    >
                      <div
                        className="text-white/80"
                        dangerouslySetInnerHTML={{
                          __html: marked(source.content),
                        }}
                      />

                      <button
                        className="mt-3 text-sm border border-white/20 px-3 py-1 rounded-full hover:bg-neutral-700"
                        onClick={async () => {
                          const blob = await downloadFile(source.file_id);

                          const url = URL.createObjectURL(blob);
                          window.open(url);

                          URL.revokeObjectURL(url);
                        }}
                      >
                        <i className="ri-link"></i>{" "}
                        {source.file_name} • Page {source.page_number}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No relevant documents found.</p>
                )}
              </div>
             
            <div className='w-fit border-1 mt-4 text-[15px] px-2 border-white/20 text-white/50 py-1 rounded-[20px] '>
                {message.sources?.map((source) => (
                  <button
                    key={source.id}
                    className="w-fit border mt-4 text-[15px] px-2 border-white/20 text-white/50 py-1 rounded-[20px]"
                    onClick={async () => {
                      const blob = await downloadFile(source.file_id);

                      const url = URL.createObjectURL(blob);

                      window.open(url);

                      URL.revokeObjectURL(url);
                    }}
                  >
                    <i className="ri-link"></i>
                    {source.file_name} (Page {source.page_number})
                  </button>
                ))}
            </div>

          </div>)
          }
             
        </div>
      ))}



      {chatLoading ? ( <Ripples
                       size="45"
                       speed="2"
                       color="grey" 
                    />) : (<div></div>)}
      <div ref={scrollRef} />
        </div>
      </div> 
    


    {/* form for input from user */}
    <div className='flex z-10 justify-center'>
    <form className='fixed bottom-9 w-fit p-2 border-1 border-white/60 rounded-[20px] '
    onSubmit={(e) => {
      console.log("submit")
      setChatLoading(true);
      e.preventDefault();
      handleSubmit(); 
      }}>

      <input type="text" 
      placeholder="Ask Your Query"
      className='p-1 px-2 border-none text-white/60 w-[50vw] outline-none text-xl'
      value={query}
      onChange={(e)=> setQuery(e.target.value)} />
      <button type="submit" className='px-2 py-1 border-white/60 text-white/50 border-1 rounded-[50%]'><i className="ri-arrow-up-line 
        text-2xl"></i></button>
    </form>
    </div>
    </div>

  )
}

export default Chat