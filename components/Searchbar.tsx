"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react"
const isValidProductURL=(url:string)=>{
  try{
    const parsedURL=new URL(url);
    const hostname=parsedURL.hostname;
    //check if hostname contains amazon.com
    if(hostname.includes('amazon.com')|| hostname.includes('amazon.')|| hostname.endsWith('amazon')){
      return true;
    }
  }catch(err){
    return false;

  }

}

const Searchbar = () => {
  const [searchPrompt,setsearchPrompt]=useState('');
  const [isLoading,setIsLoading]=useState(false);

    const handlesubmit=async (event:FormEvent<HTMLFormElement>)=>{
      event.preventDefault(); //to stop default behaviour of web page 
      const isValidLink=isValidProductURL(searchPrompt);

      //alert(isValidLink?'Valid Link':'Invalid Link')

      if(!isValidLink)return alert('Please provide  valid Amazon link');

      try{
        setIsLoading(true);

        //scrape the product page
        const product=await scrapeAndStoreProduct(searchPrompt);
        

      }
      catch(error){

      }
      finally{
        setIsLoading(false);

      }
    }
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handlesubmit}>
        <input 
        type="text"
        value={searchPrompt}
        onChange={(e)=>setsearchPrompt(e.target.value)}
        placeholder="Enter Product Link"
        className="searchbar-input"
        />
        <button type="submit" className="searchbar-btn" disabled={searchPrompt===''}>
           {isLoading?'Searching....':'Search'}
        </button>
    </form>
  )
}

export default Searchbar