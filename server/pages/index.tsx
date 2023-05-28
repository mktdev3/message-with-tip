import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Container, Stack, TextField } from '@mui/material'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { ethers } from "ethers"
import erc20Abi from './abi/IERC20.json';
import tokenAbi from './abi/LeavingATip.json';

// validation rule
const schema = yup.object({
  address: yup
  .string()
  .required('required'),
  tip: yup
  .number()
  .required('required')
  .min(0.00001, "input a number greater than or equal to 0"),
})

interface FormInput {
  address: string
  message: string
  tip: number
}

const LeaveATip = async (id: string, address: string, _tip: number) => {
  console.log("LeaveATip function starts.");
  if (!(window as any).ethereum) {
    console.error('!window.ethereum')
    return false;
  }

  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)

    await provider.send('eth_requestAccounts', [])

    const signer = await provider.getSigner()
    
    const decimals = 18;
    const tip = ethers.utils.parseUnits(`${_tip}`, decimals);

    var leavingATip = new ethers.Contract(`${process.env.NEXT_PUBLIC_TIP_CONTRACT_ADDRESS}`, tokenAbi.abi, signer);
    console.log(1);
    leavingATip.leave(process.env.NEXT_PUBLIC_LINK_CONTRACT_ADDRESS, address, id, tip)
    .then((result: any) => {
      console.log(`Success: ${result}`);
    })
    .catch((e: any) => {
        console.log(`Error: ${e}`);
    })
  } catch(e) {
    console.log(e);
    return false;
  }

  return true;
}

const approve = async (tip: ethers.BigNumber) => {
  if (!(window as any).ethereum) {
    console.error('!window.ethereum')
    return {success: false, address: ""};
  }

  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)

    await provider.send('eth_requestAccounts', [])

    const signer = await provider.getSigner()

    console.log("approve function starts.");
    var linkContract = new ethers.Contract(`${process.env.NEXT_PUBLIC_LINK_CONTRACT_ADDRESS}`, erc20Abi.abi, signer);
    await linkContract.approve(process.env.NEXT_PUBLIC_TIP_CONTRACT_ADDRESS, tip);
    const walletAddress = await signer.getAddress();

    return {success: true, address: walletAddress};
  } catch(e) {
    console.log(e);
    return {success: false, address: ""};
  }
}

const enable = async (id: string) => {
  const response = await fetch('/api/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id)
  })
}

export default function Home() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
  })

  const [url, setUrl] = useState("url for your message with tip!");
  const [tip, setTip] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    await fetch('/api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then((res) => {
      const data = res.json();
      return data;
    })
    .then(async (data) => {
      const result = await LeaveATip(data.id, data.address, data.tip);
      console.log(`result: ${result}`);
      if(result) {
          setUrl("http://localhost:3000/tip/" + data.id);
          await enable(data.id);
      }
    });
  }

  const onClickApprove = async (e: any) => {
    e.preventDefault();
    const decimals = 18;
    const _tip = ethers.utils.parseUnits(`${tip}`, decimals);
    const result = await approve(_tip);
    if(result.success && Number(tip)   != 0) {
      setValue('address', result.address);
      setIsApproved(true);
    } else {
      setIsApproved(false);
    }
  }

  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <Container maxWidth="sm" sx={{ pt: 5 }}>
        <Stack spacing={3}>
          <TextField
            multiline
            rows={15}
            label="Message"
            {...register('message')}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              required
              label="Tip"
              {...register('tip')}
              error={'tip' in errors}
              helperText={errors.tip?.message}
              onChange={(e) => setTip(e.target.value)}
              fullWidth
            />
            <Button onClick={onClickApprove}>Approve</Button>
          </Stack>
          <Button 
          variant="outlined" 
          color="success" 
          endIcon={<SendIcon />} 
          sx={{m:4}} 
          size="large" 
          disabled={!isApproved}
          onClick={handleSubmit(onSubmit)}
          >
            Send
          </Button>
          <Stack direction="column" spacing={1}>
            <p>URL: </p>
            <p className="overline">{url}</p>
          </Stack>
        </Stack>
      </Container>
    </div>
  )
}
