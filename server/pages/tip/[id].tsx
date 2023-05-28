import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material"
import { Container } from "@mui/system";
import { ethers } from "ethers"
import { useState } from "react"
import tokenAbi from '../abi/LeavingATip.json';
import Modal from "../components/Modal";

interface FormOutput {
    address: string
    message: string
    tip: number
    isValid: boolean
    isCompleted: boolean
    id: string
  }

export default function ReadAllItems(props: any){
    const item: FormOutput = props.item;
    const [show, setShow] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    return (
        <div className="flex h-screen w-screen justify-center items-center">
            <Container maxWidth="sm" sx={{ pt: 5 }}>
                <Stack>
                    <Box>
                        <TextField 
                            type='text'
                            label='Message'
                            variant="outlined" 
                            multiline
                            rows={15}
                            hiddenLabel
                            fullWidth 
                            value={item.message}/>
                        <TextField 
                            type='text'
                            label="Tip"
                            variant='standard'
                            hiddenLabel
                            fullWidth
                            value={item.tip}
                            inputProps={{min: 0, style: { textAlign: 'center' }}}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                      LINK
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Button onClick={async () =>{
                        try {
                            const provider = new ethers.providers.Web3Provider((window as any).ethereum)

                            await provider.send('eth_requestAccounts', [])
                            
                            const signer = await provider.getSigner()
                            const address = await signer.getAddress();
                            var leavingATip = new ethers.Contract(`${process.env.NEXT_PUBLIC_TIP_CONTRACT_ADDRESS}`, tokenAbi.abi, signer);

                            const tip = await leavingATip.getAmountOfTip(process.env.NEXT_PUBLIC_LINK_CONTRACT_ADDRESS, item.id);
                            if(Number(tip) === 0) {
                                setShow(true);
                                setModalMessage("Tip has not left.");
                                return
                            }

                            const isCompleted = await leavingATip.isCompleted(process.env.NEXT_PUBLIC_LINK_CONTRACT_ADDRESS, item.id);
                            if(isCompleted) {
                                setShow(true);
                                setModalMessage("Tip has alread been taken.");
                                return
                            }
                            leavingATip.take(process.env.NEXT_PUBLIC_LINK_CONTRACT_ADDRESS, item.id, address)
                            .then((result: any) => {
                                console.log(`Success: ${result}`);
                            })
                            .catch((e: any) => {
                                console.log(`Error: ${e}`);
                            })
                        } catch(e) {
                            console.log(`Error: ${e}`);
                        }
                    }}>Take</Button>
                </Stack>
            </Container>
            <Modal show={show} setShow={setShow} message={modalMessage}/>
        </div>
    );
}

export const getServerSideProps = async(context: any) => {
    const response = await fetch(`http://localhost:3000/api/item/${context.query.id}`)
    const item = await response.json()
    return {
        props: item
    }
}