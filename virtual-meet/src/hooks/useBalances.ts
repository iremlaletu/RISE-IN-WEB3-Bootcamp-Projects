import { NativeBalance } from "./../types/NativeBalance";
import { useCallback, useEffect, useState } from "react";
import Moralis from "moralis";
import { TokenBalance } from "@/types/TokenBalance";
import { useAppContext } from "@/contexts/AppContext";
import { apiKey } from "@/util/addresses";
import { current_chain } from "@/util/chain";

export function useBalances() {
    const [loading, setLoading] = useState(false)
    const [isEligible, setIsEligible] = useState({eligible:false, balance:0})
    const [message, setMessage] = useState("")
    const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
    const [nativeBalance, setNativeBalance] = useState<NativeBalance>()
    const {address} = useAppContext()

  //this is for HW1
    const ParisSaintGermai = "0xa4bf4104ec0109591077Ee5F4a2bFD13dEE1Bdf8";

    const fetchTokenBalance = useCallback(async () => {
        try{
            if (!address) return
            if (!Moralis.Core.isStarted) {
                await Moralis.start({apiKey})
            }
        
            //const token_balances = await Moralis.EvmApi.token.getWalletTokenBalances({address, chain:current_chain})
            //setTokenBalances(token_balances.toJSON())

            //const native_balance = await Moralis.EvmApi.token.getNativeBalance({address, chain:current_chain})
            //setNativeBalance(native_balance.toJSON())


            const token_balances = await fetch(
                `https://deep-index.moralis.io/api/v2.2/${address}/erc20?` +
                  new URLSearchParams({
                    chain: current_chain,
                  }),
                {
                  method: 'get',
                  headers: {
                    accept: 'application/json',
                    'X-API-Key': `${apiKey}`,
                  },
                },
              );
              
              const tokens = await token_balances.json();
              setTokenBalances(tokens)
              eligibilityChecker(tokens)

            const native_balance = await fetch(
                `https://deep-index.moralis.io/api/v2.2/${address}/balance?` +
                  new URLSearchParams({
                    chain: current_chain,
                  }),
                {
                  method: 'get',
                  headers: {
                    accept: 'application/json',
                    'X-API-Key': `${apiKey}`,
                  },
                },
              );
              const native = await native_balance.json();
              setNativeBalance(native)

        } catch(e) {
            setMessage("Error while fetching the token balance")
            console.log("Error while fetching the token balance", e)
        } finally {
            setLoading(false)
        }
    }, []);


    //This is for HW1
    const eligibilityChecker = (tokens: TokenBalance[]) => {
        try{
          const eligibleToken = tokens.find(
            (token) => token.token_address === ParisSaintGermai && Number(token.balance) >= 1
          );

          if (eligibleToken) {
            setIsEligible({ eligible: true, balance: Number(eligibleToken.balance) });
          }
          
        }catch(e) {

        }
    }

    useEffect(() => {
        fetchTokenBalance();
    }, [fetchTokenBalance]);

    return {
        loading,
        message,
        tokenBalances,
        nativeBalance,
        isEligible
    };
}