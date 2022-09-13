import Head from 'next/head'
import Image from 'next/image'
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import { useEffect, useState, useRef} from 'react'
import styles from '../styles/Home.module.css'
import web3modal from "web3modal";  
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, Token_Contract_ABI, Token_Contract_Address } from '../constant';


export default function Home() {
  const zero = BigNumber.from(0); 
  const [walletConnected, setWalletConnected] = useState(false);
  const Web3ModelRef = useRef();
  const [tokensMinted , setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero);
  const [tokenAmount , setTokenAmount] = useState(zero);
  const [loading,setLoading] = useState(false);
  const[tokensToBeClaimed, setTokensToBeClaimed] =useState(zero);
  const[IsOwner ,setIsOwner] = useState(false);


  const getProviderOrSigner = async (needSigner = false) => {
   const provider = await Web3ModelRef.current.connect();
   const web3Provider= new providers.Web3Provider(provider);    
   const {chainId} = await web3Provider.getNetwork();
   if (chainId !== 4) {
    window.alert("change the network to rinkeby");
    throw new Error("change the network to rinkeby ");
   }
   if (needSigner) {
    const signer =  web3Provider.getSigner();
    return signer;
   }
   return web3Provider;
  };

  const connectWallet = async () => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (error) {
    console.error(error);
  }
  }

  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(Token_Contract_Address,Token_Contract_ABI,provider);
       const signer = await getProviderOrSigner(true);
       const address = signer.getAddress();
       const balance = await tokenContract.balanceOf(address);
       setBalanceOfCryptoDevTokens(balance);       
      } catch (error) {
        console.error(error);
      }
    }
    
    const getTokensToBeClaimed = async () => {
      try {
        const provider = await getProviderOrSigner(); 
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
        const tokenContract = new Contract(Token_Contract_Address,Token_Contract_ABI,provider);
        const signer = await getProviderOrSigner(true);
        const address = signer.getAddress();
        const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      }else{
        var amount=0;
        for(var i=0; i<balance; i++)
        {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address,i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount ++;
          }
        }
      }
      setTokensToBeClaimed(BigNumber.from(amount));
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  }
 const getOwner =  async() => {
 try {
  const provider = await getProviderOrSigner();
  const tokenContract = new Contract(Token_Contract_Address,Token_Contract_ABI,provider);
  const _owner = await tokenContract.owner();
  const signer = await getProviderOrSigner(true);
  const address = await signer.getAddress();
  if (_owner === address) {
    setIsOwner(true);
  }
 } catch (error) {
  console.error(err.message);
 }
 };
 const withdrawCoins = async () => {
   try {
    const signer = await getProviderOrSigner();
    const tokenContract = new Contract(Token_Contract_Address,Token_Contract_ABI,signer);
    const tx = await tokenContract.withdraw();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    await getOwner();
   } catch (error) {
    console.error(error);
   }
 }

  const getTotalTokenMinted = async() => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(Token_Contract_Address,Token_Contract_ABI, provider);
      const _tokenMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokenMinted);

    } catch (error) {
      console.error(error);
    }
  }


  const mintCryptoDevToken = async(amount) =>{
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(Token_Contract_Address, Token_Contract_ABI,signer);
      const value = 0.001* amount;
      const tx = await tokenContract.mint(amount,{value:utils.parseEther(value.toString()),})
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("sucessfully minted the Crypto Devs Token");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();

    } catch (error) {
      console.error(error);
    }
  }

  const claimCryptoDevTokens= async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(Token_Contract_Address, Token_Contract_ABI,signer);
      const tx = await tokenContract.clam()
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens")
    } catch (error) {
      console.error(error);
    }
  }
// console.log("*****",IsOwner);
  const renderButton = () => {
    if (loading) {
      return (
      <div>
       <button className={styles.button}>...loading</button>
      </div>
      )
    }
    
    if (walletConnected && IsOwner) {
return(
  <div> 
    <button className={styles.button} onClick={withdrawCoins}>
      Withdraw Coins
    </button>
  </div>
    )
    }
    
    if (tokensToBeClaimed > 0) {
      return(
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Token can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens 
          </button>
        </div>
      )
    }
    return (
      <div style={{display: "flex-col"}}>
        <div>
          <input type="number"
          placeholder='Amount of Tokens'
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button className={styles.button} disabled={!(tokenAmount >0)} onClick ={() => mintCryptoDevToken(tokenAmount)}>
           Mint Tokens
          </button>
        </div>
      </div>
    )
   }
  useEffect(() => {
    if (!walletConnected) {
      Web3ModelRef.current = new web3modal ({
        network: "rinkeby",
        providerOptions:{},
        disableInjectedProvider: false
      })
    connectWallet();
       getBalanceOfCryptoDevTokens();
       getTotalTokenMinted();
       getTokensToBeClaimed();
    }
  }, [walletConnected])
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Devs ICO</title>
        <meta name="description" content="ICO-dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
       <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Welcome to Nitesh 1st ICO</h1>
          <div className={styles.description}> 
          YOu can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                you have minted {utils.formatEther(balanceOfCryptoDevTokens)}  Crypto Dev Tokens
              </div>
              <div className={styles.description}>
               Overall  {utils.formatEther(tokensMinted)} / 10000 have minted 
              </div>
              {renderButton()}
            </div>
          ):(
           <button onClick={connectWallet} className ={styles.button}>
            Connect your wallet
           </button>
          )}
        </div>
       </div>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
