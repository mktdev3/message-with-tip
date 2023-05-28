import { Dispatch, SetStateAction } from "react";

type ModalType = {
  show: boolean,
  message: string,
  setShow: Dispatch<SetStateAction<boolean>>
};

export default function Modal(props: any){
  if(props.show) {
    return (
      <div className="
      fixed
      top-0
      left-0
      w-full
      h-full
      bg-gray-400	
      
      flex
      justify-center 
      items-center">
        <div className="  
        z-2
        w-1/2
        p-8
        bg-white">
          <p>{props.message}</p>
          <p><button onClick={() => props.setShow(false)}>close</button></p>
        </div>
      </div>
    )
  } else {
    return null;
  }
}