import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

interface Company {
  International : string,
  Code: string,
  Name: string
}
// 이중객체는 배열로 index는 사용할 수 없어서 number x
interface ThemeColor {
  [key: string] : {
    back : string,
    hover : string,
    active : string,
    text : string,
    outline : string
  }
}
interface ButtonType {
  name : string,
  theme : string
}

function App() {

  const [carriers, setCarriers] = useState<Company[]>([]); // 밑에 필터된 값을 넣어줄거다
  const [allCarriers, setAllCarriers] = useState<Company[]>([]); // 필터되는 값(전체값)
  const [theme, setTheme] = useState<string>('default'); // 객체안에 객체 넣을거다

  const [tcode, setTcode] = useState('04'); // 대한통운 기준이라서 04
  const [tinvoice, setTinvoice] = useState(''); // 실제 운송장 번호
  const [tname, setTname] = useState<string>('CJ대한통운');
  const [isBtn, setIsBtn] = useState<number | null>(null);
  const [infoTracking, setInfoTracking] = useState<string>();
  
  //테마의 기본값 default
  const themeColor:ThemeColor = {
    "default":{
      "back" : "bg-indigo-500",
      "hover" : "hover:bg-indigo-300",
      "active" : "bg-indigo-400",
      "text" : "text-indigo-500",
      "outline" : "outline-indigo-300"
    },
    "pink":{
      "back" : "bg-pink-500",
      "hover" : "hover:bg-pink-300",
      "active" : "bg-pink-400",
      "text" : "text-pink-500",
      "outline" : "outline-pink-300"
    },
    "blue":{
      "back" : "bg-blue-500",
      "hover" : "hover:bg-blue-300",
      "active" : "bg-blue-400",
      "text" : "text-blue-500",
      "outline" : "outline-blue-300"
    }
  }

  const buttons :ButtonType[] = [
    {name: "기본", theme: "default"},
    {name: "핑크", theme: "pink"},
    {name: "블루", theme: "blue"}
  ]

  // 데이터 불러오기
  useEffect(()=>{
    const fetchData = async () =>{
      try{
        const res = await fetch(`http://info.sweettracker.co.kr/api/v1/companylist?t_key=${process.env.REACT_APP_API_KEY}`)

        const data = await res.json()
        console.log(data);
        setCarriers(data.Company);
        setAllCarriers(data.Company);
      }catch(error){
        console.log(error);
      }
    }
    fetchData()
  },[])

  const selectCode = (BtnNumber: number, code: string, name: string) =>{
    setIsBtn(BtnNumber);
    setTcode(code);
    setTname(name);
    // 국내,외 필터 true가 외국택배 false가 국내택배임
    const isInternational = BtnNumber === 2 ? 'true' : 'false';
    const filterCarriers = allCarriers.filter(e => e.International === isInternational);
    setCarriers(filterCarriers);
  }

  // 0-9 까지 숫자만 입력 가능
  const blindNumber = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const value = e.target.value;
    e.target.value = e.target.value.replace(/[^0-9]/g,'')
    setTinvoice(value);
    }

  // 택배조회 정보 가져옴
  const PostSubmit = async () =>{
    // 두가지 다 적용 가능
    // const url = new URL(`http://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${process.env.REACT_APP_API_KEY}&t_code=${tcode}&t_invoice=${tinvoice}`)
    const url = new URL("http://info.sweettracker.co.kr/api/v1/trackingInfo");
    url.searchParams.append("t_code", tcode);
    url.searchParams.append("t_invoice", tinvoice);
    url.searchParams.append("t_key", `${process.env.REACT_APP_API_KEY}`);
    try{
      const res = await fetch(`http://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${process.env.REACT_APP_API_KEY}&t_code=${tcode}&t_invoice=${tinvoice}`);
      const data = res.json();
      console.log(data)
    }catch(error){
      console.log(error)
    }
    console.log(tcode, tinvoice)
  }

  return (
    <>
    <div className={`${themeColor[theme].back} p-5 text-black text-sm md:text-xl xl:text-2xl flex justify-between`}>
      <h3 className='font-extrabold'>국내.외 택배조회 시스템</h3>
      <div className="">
        <span>테마 :</span>
        {
          buttons.map((e,i)=>{
            return(
              <button key={i} onClick={()=>{setTheme(e.theme)}} className={`mx-1 md:mx-2 xl:mx-3`}>{e.name}</button>
            )
          })
        }
      </div>
    </div>
    <div className="w-4/5 md:w-3/5 xl:w-4/12 mx-auto mt-49 flex rounded items-center flex-wrap">
      <div className="border-b basis-full py-2 px-2 flex justify-center items-center text-sm mt-20">
        <span className='basis-[30%] text-center mr-5'>국내 / 국외 선택</span>
        <button onClick={()=> selectCode(1, '04', 'CJ대한통운')} className={`text-sm border p-1 px-5 hover:text-white mr-4 ${isBtn === 1 ? `text-white` : `text-black`} ${themeColor[theme].hover} ${isBtn === 1 ? themeColor[theme].active : ``}`} >국외</button>
        <button onClick={()=> selectCode(2, '12', 'EMS')} className={`text-sm border p-1 px-5 hover:text-white mr-4 ${isBtn === 2 ? `text-white` : `text-black`} ${themeColor[theme].hover} ${isBtn === 2 ? themeColor[theme].active : ``}`} >국내</button>
      </div>
    <div className="basis-full py-4 border-b">
    <select value={tcode} onChange={(e)=>{setTcode(e.target.value)}} className='w-full' >
        {
          carriers.map((e,i)=>{
            return(
              <option value={e.Code} key={i} className=''>{e.Name}</option>
            )
          })
        }
      </select>
      {tinvoice}
      <div className="basis-full py-4 text-center">
        <input type="text" onInput={blindNumber} placeholder='운송장번호를 입력해주세요.' className={`w-full border px-5 py-2 rounded-md ${themeColor[theme].outline}`}  />
      </div>
    </div>
    <div className="basis-full border-b py-4 text-center">
      <button className={`${themeColor[theme].back} text-white px-5 py-2 rounded-md`} onClick={PostSubmit}>조회하기</button>
    </div>
    </div>
    </>
  );
}

export default App;