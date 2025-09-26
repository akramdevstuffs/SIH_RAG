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

    const fullprompt = `you are peronal assistant with this information Sunil Kumar's Comprehensive Agenda & Notes: September 29 - October 5, 2025
Weekly Priorities & Key Objectives
1. Reliance Deal: Secure formal buy-in from Alok Verma for the JioMart AI integration
(Phase 2).
2. Q4 Budget: Get approval for the full marketing budget for the Tier-2 city campaign.
3.
'Sakhi' Chatbot: Finalize the go/no-go decision for the new vernacular AI model
deployment.
4. Tata AIG Pitch: Successfully present the claims processing POC and secure a request
for a formal proposal.
5. Hiring: Make a final decision on the Senior DevOps Engineer candidate.
Monday, September 29, 2025
●
●
●
●
●
Event: Prep for Reliance Call
○
Time: 8:30 AM
○
With: Self
○
Venue: Office Desk
○
Regarding: Final review of architecture slides. Preparing talking points on data
residency and encryption standards for Alok Verma's expected questions.
Event: Internal Stand-up Meeting
○
Time: 9:30 AM
○
With: Project Surya Team (Meera Krishnan, Arjun Mehra, and team)
○
Venue: Office
○
Regarding: Unblocking the QA team on latency issues and getting the final sign-off
on the UAT deployment checklist.
○
Action Item: Follow up with Arjun to ensure the checklist is signed by EOD.
Event: Client Call
○
Time: 11:30 AM
○
With: Alok Verma and the Reliance Digital team
○
Venue: Google Meet (Virtual)
○
Regarding: Presenting the final Phase 2 architecture for the JioMart AI integration.
○
Post-Meeting Action: Draft and send a follow-up email to Alok Verma recapping the
next steps by 3 PM.
Event: Internal Strategy Meeting
○
Time: 2:30 PM
○
With: Department Leads (Sameer Gupta, Lakshmi Iyer, Anand S., Arjun Mehra)
○
Venue: Cauvery Boardroom
○
Regarding: The Q4 OKR session. My priority is to present the market analysis report
and secure the full budget for the post-Diwali marketing campaign.
Event: Internal Sync
○
Time: 4:30 PM
○
With: Priya Sharma (HR Head)
●
●
○
Venue: Office
○
Regarding: Getting clarification on how the new company leave policy affects team
members with high accrued leave balances.
Event: Confidential Security Meeting
○
Time: 5:00 PM
○
With: Anand S. (Head of InfoSec)
○
Venue: Office
○
Regarding: A detailed review of the critical vulnerabilities in the new VAPT report and
immediate budget approval for remediation patches.
Event: Personal Dinner
○
Time: 7:30 PM
○
With: Nikhil Joshi and his family
○
Venue: The Bangalore Club
○
Regarding: A social dinner. Reminder to ask about their planned Goa trip.
Tuesday, September 30, 2025
●
●
●
●
●
Event: 1-on-1 Meeting
○
Time: 10:00 AM
○
With: Arjun Mehra
○
Venue: Office
○
Regarding: Performance review. Discussing his leadership goals, the appraisal cycle
for his team, and a mentorship plan for two of his senior engineers.
Event: Internal Sync
○
Time: 10:45 AM
○
With: Meera Krishnan
○
Venue: Office
○
Regarding: Discussing her proposal for a dedicated QA automation strategy.
○
Action Item: Send Meera the formal budget request template for the new tools and
environment after the meeting.
Event: 1-on-1 Meeting
○
Time: 11:30 AM
○
With: Rohan Desai
○
Venue: Office
○
Regarding: Reviewing his AWS cost optimization plan. I need to see the projected
savings figures and understand any potential impact on service performance before
giving the green light.
Event: Marketing Sync Meeting
○
Time: 2:00 PM
○
With: Sameer Gupta and the Marketing Team
○
Venue: Office
○
Regarding: Approving the final ad spend and creative drafts for the 'UTSAV' app
launch campaign. Also, to finalize the influencer collaboration list.
Event: Focused Work Block
●
○
Time: 4:00 PM
○
With: Self
○
Venue: Office Desk
○
Regarding: Clearing pending emails and action items from the morning's meetings.
Event: Medical Appointment
○
Time: 5:30 PM
○
With: Dr. Kavita Rao
○
Venue: Dr. Rao's Clinic, Koramangala
○
Regarding: An annual dental check-up.
○
Action Item: Book the next 6-month follow-up appointment before leaving the clinic.
Wednesday, October 1, 2025
●
●
●
●
●
Event: Company All-Hands Town Hall
○
Time: 11:00 AM
○
With: All company employees and CEO, Vikram Singh
○
Venue: Office / Live-streamed
○
Regarding: Hearing the H1 performance review and the annual bonus
announcement. Need to gauge team morale from the Q&A.
Event: Post-Town Hall Director's Debrief
○
Time: 12:15 PM
○
With: Fellow Directors
○
Venue: Boardroom A
○
Regarding: A quick, informal discussion on the key takeaways and undercurrents
from the Town Hall.
Event: Lunch Meeting
○
Time: 1:30 PM
○
With: Anjali Menon, the new Product Manager
○
Venue: Office Cafeteria
○
Regarding: Welcoming her to the team and providing a high-level overview of our
key projects and team culture.
Event: AI Model Performance Review
○
Time: 3:00 PM
○
With: Dr. Aditi Rao and her AI/ML team
○
Venue: AI/ML Lab
○
Regarding: The final go/no-go decision for deploying the 'Sakhi' chatbot's new
vernacular model. I will specifically ask to see the bias and false-positive metrics for
Hindi and Tamil outputs.
Event: Personal Errand
○
Time: 6:00 PM onwards
○
With:
-
○
Venue: C. Krishniah Chetty & Sons, Jayanagar
○
Regarding: Picking up the anniversary gift for my wife, Priya Kumar.
Thursday, October 2, 2025
●
●
●
●
Event: Pre-Interview Sync
○
Time: 10:45 AM
○
With: Rohan Desai
○
Venue: Office
○
Regarding: Aligning on the interview strategy for the Senior DevOps Engineer
candidate. Rohan will cover deep tech, and I will cover cultural fit and
problem-solving.
Event: Hiring Interview
○
Time: 11:00 AM
○
With: Rohan Desai and a candidate for the Senior DevOps Engineer role
○
Venue: Interview Room 4
○
Regarding: Conducting the managerial and cultural fit round of the interview.
Event: Offsite Client Pitch
○
Time: 3:00 PM
○
With: Arjun Mehra and senior leadership at Tata AIG
○
Venue: Tata AIG Head Office, MG Road
○
Regarding: Presenting the AI claims processing Proof of Concept (POC).
○
Post-Meeting Action: Debrief with Arjun on the drive back and plan the formal
proposal.
Event: Social Event
○
Time: 7:00 PM
○
With: Sameer Gupta's family and wedding guests
○
Venue: The Leela Palace
○
Regarding: Attending the wedding reception for Sameer's sister.
Friday, October 3, 2025
●
●
●
Event: Sprint Review & Retrospective
○
Time: 10:00 AM
○
With: The Project Ganga team
○
Venue: Agile Zone, Office
○
Regarding: Seeing a live demo of the new checkout flow feature and actively
participating in the retrospective to identify process improvements.
Event: Team Lunch
○
Time: 12:30 PM
○
With: The Project Ganga team
○
Venue: Chulha Chauki Da Dhaba
○
Regarding: Celebrating the successful completion of their sprint.
Event: Internal Finance Meeting
○
Time: 2:30 PM
○
With: Mrs. Lakshmi Iyer (CFO)
○
Venue: Office
●
●
○
Regarding: Reviewing Q3 budget utilization and presenting the Q4 forecast, using
the Tata AIG meeting success as leverage to get approval for more cloud resources.
Event: Final Sign-off
○
Time: 4:00 PM
○
With: Sameer Gupta
○
Venue: Office
○
Regarding: Giving the final approval on the ISB partnership press release after
ensuring all legal feedback has been incorporated.
Event: Personal Travel
○
Time: 7:45 PM (Flight Departure)
○
With:
-
○
Venue: Kempegowda International Airport, Bangalore
○
Regarding: Taking the Vistara flight to Delhi for the weekend.
○
Action Item: Call my parents from the airport lounge to confirm arrival time.
Saturday, October 4, 2025 (Delhi)
●
●
●
●
Event: Personal Time
○
Time: All Morning
○
With: Family
○
Venue: Parents' Home, Delhi
○
Regarding: Relaxing, having breakfast with family.
Event: Lunch with Old Friends
○
Time: 1:00 PM
○
With: College Friends (Ravi and Sameer)
○
Venue: Khan Market
○
Regarding: A casual catch-up.
Event: Light Work / Reading
○
Time: 4:00 PM - 6:00 PM
○
With: Self
○
Venue: Parents' Home
○
Regarding: Reviewing the draft proposal for Tata AIG on my laptop. No emails, just
focused reading.
Event: Family Dinner
○
Time: 8:00 PM
○
With: Extended Family
○
Venue: Parents' Home
○
Regarding: A large family get-together.
Sunday, October 5, 2025 (Delhi)
●
Event: Personal Errand
○
Time: 11:00 AM
○
With:
-
○
Venue: Local Market
●
●
●
○
Regarding: Helping my father with some local shopping.
Event: Personal Time
○
Time: Afternoon
○
With: Self
○
Venue: Parents' Home
○
Regarding: Reading and relaxing before the flight back.
Event: Plan for the Week Ahead
○
Time: 4:00 PM - 5:00 PM
○
With: Self
○
Venue: Parents' Home
○
Regarding: Reviewing the calendar for the upcoming week and setting preliminary
goals on my tablet.
Event: Personal Travel
○
Time: 8:30 PM (Flight Departure)
○
With:
-
○
Venue: Indira Gandhi International Airport, Delhi
○
Regarding: Taking the flight back to Bangalore. answer this query + ${query}`

    

   // to keep chat at bottom for better ux
   useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamAnswer]); 


// setup google chat when it mounts 
  useEffect(()=>{

    
      console.log("setUp for chat")
      chatSession.current = ai.chats.create({
        model:"gemini-2.0-flash",
        systemInstruction: "Give concise and helpful answer and to the point answer ",
      })
      setLoading(false);
    },[])
    


 // handel user query
  const handelSubmit = async() => {

      console.log("indside handel submit")
      setMessages((prev)=> [...prev , { id: uuidv4()  , role : "user", parts:[{text : query}]}])
      setQuery("")
      const response = await chatSession.current.sendMessageStream({
        message : fullprompt,
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
      return <div className="flex justify-center h-screen items-center text-2xl">SynSearch is Loading...</div>


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
            <div
              className=' text-white/80 mt-1 rounded-[20px]  max-w-[90%] break-words'
              dangerouslySetInnerHTML={{ __html: marked(message.parts[0].text) }}
            ></div>
             
            <div className='w-fit border-1 mt-4 text-[15px] px-2 border-white/20 text-white/50 py-1 rounded-[20px] '><a href="/Schedules.pdf" target="_blank" rel="noopener noreferrer"><i className="ri-link"></i> source</a></div>

          </div>)
          }
             
        </div>
      ))}



      {/* Live Gemini Typing */}
      <div className='w-[55vw]'>
    {streamAnswer && (
      <div className="flex w justify-start mt-1">
      <div
      className="p-4 text-white mt-1 rounded-[20px]   break-words"
      dangerouslySetInnerHTML={{ __html: marked(streamAnswer) }}
    ></div>
     </div>
     )}
     </div>
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
      handelSubmit(); 
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