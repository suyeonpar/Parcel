import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

interface TrackingDetail {
    kind: string,
    level: string,
    manName: string,
    manPic: string,
    telno: string,
    telno2: string,
    time: number,
    timeString: string,
    where: string,
    code: string | null,
    remark: string | null
// code - 스트링 or ull / remark - string or null
}

interface PackageData {
  adUrl: string,
  complete: boolean,
  invoiceNo: string,
  itemImage: string,
  itemName: string,
  level: number,
  receiverAddr: string,
  receiverName: string,
  recipient: string,
  result: string,
  senderName: string,
  trackingDetails: TrackingDetail[],
  orderNumber: null,
  estimate: string,
  productInfo: null,
  zipCode: string | null,
  lastDetail: null,
  lastStateDetail: string,
  firstDetail: string,
  completeYN: string
}



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
    outline : string,

    odd : string,
    after : string,
    border : string,
    rgb : string
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
  const [infoTracking, setInfoTracking] = useState<PackageData | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  //테마의 기본값 default
  const themeColor:ThemeColor = {
    "default":{
    "back" : "bg-indigo-500",
    "hover" : "hover:bg-indigo-300",
    "active" : "bg-indigo-400",
    "text" : "text-indigo-500",
    "outline" : "outline-indigo-300",
    "odd" : "odd:bg-indigo-50",
    "after" : "after:bg-indigo-500",
    "border" : "border-indigo-300",
    "rgb" : "#6366f1"
    },
    "pink":{
    "back" : "bg-pink-500",
    "hover" : "hover:bg-pink-300",
    "active" : "bg-pink-400",
    "text" : "text-pink-500",
    "outline" : "outline-pink-300",
    "odd" : "odd:bg-pink-50",
    "after" : "after:bg-pink-500",
    "border" : "border-pink-300",
    "rgb" : "#ec4899"
    },
    "blue":{
    "back" : "bg-blue-500",
    "hover" : "hover:bg-blue-300",
    "active" : "bg-blue-400",
    "text" : "text-blue-500",
    "outline" : "outline-blue-300",
    "odd" : "odd:bg-blue-50",
    "after" : "after:bg-blue-500",
    "border" : "border-blue-300",
    "rgb" : "#3b82f6"
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
        const res = await fetch(`https://info.sweettracker.co.kr/api/v1/companylist?t_key=${process.env.REACT_APP_API_KEY}`)

        const data = await res.json();

        console.log(data);
        setCarriers(data.Company);
        setAllCarriers(data.Company);
        setIsLoading(false);
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
    const result = carriers.find((e) => e.Code === tcode)
    if(result){
      if(result.International === 'false'){
        e.target.value = e.target.value.replace(/[^0-9]/g,'')
      }
    }
    setTinvoice(value);
    }

  // 택배조회 정보 가져옴
  const PostSubmit = async () =>{
    setIsShow(false);
    setIsLoading(true);
    setError('');
    // 두가지 다 적용 가능
    // const url = new URL(`https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${process.env.REACT_APP_API_KEY}&t_code=${tcode}&t_invoice=${tinvoice}`)

    const url = new URL("https://info.sweettracker.co.kr/api/v1/trackingInfo");
    url.searchParams.append("t_code", tcode);
    url.searchParams.append("t_invoice", tinvoice);
    url.searchParams.append("t_key", `${process.env.REACT_APP_API_KEY}`);

    try{
      const res = await fetch(`https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${process.env.REACT_APP_API_KEY}&t_code=${tcode}&t_invoice=${tinvoice}`);
      const data = await res.json();
      if(data.firstDetail === null){
        setError("데이터없음");
        setIsLoading(false);
        return;
      }
      if(data.code === '104' || data.code === '105'){
        setError(data.msg);
      }else{
        setInfoTracking(data);
        setIsShow(true);
      }
      setIsLoading(false);

      console.log(data)
    }catch(error){
      console.log(error)
    }
    console.log(tcode, tinvoice)
  }

  const PostListName :string[] = ["상품인수", "상품이종중", "배송지도착",
"배송출발", "배송완료"];

  return (
    <>
    {
      isLoading && 
      <div className="fixed w-full h-full bg-black/50 top-0 left-0 z-50">
        <div className="absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4">
        <svg width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(30 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(60 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(90 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(120 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(150 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(180 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(210 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(240 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(270 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(300 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        <g transform="rotate(330 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill={`${themeColor[theme].rgb}`}>
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
        </rect>
        </g>
        </svg>
        </div>
      </div>
    }
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
        <button onClick={()=> selectCode(1, '04', 'CJ대한통운')} className={`text-sm border p-1 px-5 hover:text-white mr-4 ${isBtn === 1 ? `text-white` : `text-black`} ${themeColor[theme].hover} ${isBtn === 1 ? themeColor[theme].active : ``}`} >국내</button>
        <button onClick={()=> selectCode(2, '12', 'EMS')} className={`text-sm border p-1 px-5 hover:text-white mr-4 ${isBtn === 2 ? `text-white` : `text-black`} ${themeColor[theme].hover} ${isBtn === 2 ? themeColor[theme].active : ``}`} >국외</button>
      </div>
      <div className="basis-full py-4 border-b">
      <select value={tcode} onChange={(e)=>{
        const result_code = e.target.value
        setTcode(e.target.value);
        const result = carriers.find((e)=> e.Code === result_code);
        if(result){
          setTname(result.Name);
        }
        }} className='w-full' >
        {
          carriers.map((e,i)=>{
            return(
              <option value={e.Code} key={i} className=''>{e.Name}</option>
            )
          })
        }
      </select>
      <div className="basis-full py-4 text-center">
        <input type="text" onInput={blindNumber} placeholder='운송장번호를 입력해주세요.' className={`w-full border px-5 py-2 rounded-md ${themeColor[theme].outline}`}  />
      </div>
    </div>
    <div className="basis-full border-b py-4 text-center">
      <button className={`${themeColor[theme].back} text-white px-5 py-2 rounded-md`} onClick={PostSubmit}>조회하기</button>
      {
        error &&
        <div className="basis-full py-4 text-center">
          <span className={`${themeColor[theme].text} font-bold`}>{error}</span>
        </div>
      }
    </div>
    </div>
    {
      isShow &&
      <>
      <div className="w-full">
        <div className={`${themeColor[theme].back} text-white flex justify-center py-10 px-5 flex-wrap items-center text-center`}>
          <span className="text-xl basis-[45%] font-bold mr-5 mb-5">운송장 번호</span>
          <h3 className="text-2xl basis-[45%] font-bold mb-5">{tinvoice}</h3>
          <span className="text-xl basis-[45%] font-bold mr-5 mb-5">택배사</span>
          <h3 className="text-2xl basis-[45%] font-bold mb-5">{tname}</h3>
        </div>
      </div>
      <div className="bg-white my-5 flex justify-around py-5 relative before:bg-[#e2e5e8] before:absolute before:h-1 before:box-border before:top-[45%] before:left-[10%] before:w-4/5 before:z-0">
        {
          Array(5).fill('').map((_,i)=>{
            const resultLevel = infoTracking && i + 1 === (infoTracking?.level -1);
            return(
              <div className={`${resultLevel ? themeColor[theme].after : `after:bg-gray-200`} relative z-10 after:absolute after:w-[60px] after:h-[60px] after:rounded-full after:top-0 after:left-0`} key={i}>
                <img className='relative z-10' src={`images/ic_sky_delivery_step${i+1}_on.png`} alt={PostListName[i]} />
                <p className='text-center text-xs mt-1'>{PostListName[i]}</p>
              </div>
            )
          })
        }
      </div>
      <div className="bg-white py-5">
        {
          infoTracking && infoTracking.trackingDetails.slice().reverse().map((e,i)=>{
            return(
              <div className={`pl-20 py-5 relative group ${themeColor[theme].odd}`} key={i}>
                <div className={`relative border-2 rounded-full w-2 h-2 -left-[30px] top-10 z-30 ${i === 0 ? `${themeColor[theme].border} ${themeColor[theme].back}` : `bg-white`}`}></div>
                <p className="">{e.where} | {e.kind}</p>
                <p className="">{e.telno}</p>
                <p className="">{e.timeString}</p>
                <div className={`group-last:h-0 h-full absolute w-0.5 left-[53px] top-[60px] z-20 ${themeColor[theme].back}`}></div>
              </div>
            )
          })
        }
      </div>
      </>
    }
    </>
  );
}

export default App;