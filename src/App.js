import * as React from "react";
import ReactNotifications from 'react-notifications-component';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';
import './form.css';
import { ethers } from "ethers";
import './App.css';
import { Sound } from './sounds/sound.js';
import flute1Sound from "./sounds/mixkit-flute-cell-phone-alert-2315.wav";
import flute2Sound from "./sounds/mixkit-flute-mobile-phone-notification-alert-2316.wav";
import drummingSound from "./sounds/mixkit-drumming-atmospheric-570.wav";
import wonPointsSound from "./sounds/mixkit-uplifting-flute-notification-2317.wav";
import rabbitRunningGIF from "./gifs/rabbit-running.gif";
import loadingGIF from "./gifs/loading.gif";
import ABIfile from "./utils/WavePortal.json"


export default function App()
{

  const [currAccount, setCurrentAccount] = React.useState("");
  const [waving, setWaving] = React.useState(false);
  let [waveTxn, setWaveTxn] = React.useState("");
  const [totalWaves, setTotalWaves] = React.useState(0);
  const [visibleWaves, setVisibleWaves] = React.useState(5);
  const contractAddress = "0x80bF093022FDE99b6AFc32934056ed3aaaE44cE4";
  const contractABI = ABIfile.abi;
  

  const messageInput = React.createRef();

  const displayNotification = (title, msg, type, insert = "top", container = "top-left") =>
  {
    /*
    success
    danger
    info
    default
    warning
    */

      store.addNotification({
        title: title,
        message: msg,
        type: type,
        insert: "top",
        container: "top-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true
        }
      });

  }

  const checkIfWalletIsConnected = () =>
  {
    const { ethereum } = window;
    if(!ethereum)
    {
      displayNotification("Metamask required", "Bad news billy bears... You need to get metamask installed.", "danger");
      return;
    }
    else
    {
      console.log ("metamask installed so it's good to go.", ethereum);

      displayNotification("Metamask required", "You have it already. Cool!", "success");

    }

    ethereum.request({ method: 'eth_accounts'})
    .then(accounts =>
      {
        if(accounts.length !== 0)
        {
          const account = accounts[0];
          console.log("Found an authorized account: ", account);

          displayNotification("Wallet required", `Found an authorized account: ${account}`, "success");

          setCurrentAccount(account);

          getAllWaves();

          //Subscribing to events from the smart contract
          //NewWave(address indexed _from, uint _timestamp, string _message)
          console.log("Listeners for NewWaves: "+waveportalContract.listenerCount("NewWave"));
          if(waveportalContract.listenerCount("NewWave") == 0)
          {
            console.log("waveportalContract.on NewWave register...");

            waveportalContract.on("NewWave", (_from, _timestamp, _message) => {
                console.log("waveportalContract.on NewWave exec!");
                // Called when anyone changes the value
                store.addNotification({
                    title: `New Wave by ${_from}`,
                    message: _message,
                    type: "success",
                    container: "bottom-full",
                    insert: "top",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                      duration: 0,
                      showIcon: true
                    }
                  });

              });
          }

          //event NewPoints(address indexed _user, uint _pointsEarned, uint _pointsTotal);
          console.log("Listeners for NewPoints: "+waveportalContract.listenerCount("NewPoints"));
          if(waveportalContract.listenerCount("NewPoints") == 0)
          {
            console.log("waveportalContract.on NewPoints register...");

            waveportalContract.on("NewPoints", (_user, _pointsEarned, _pointsTotal) =>
            {
              console.log("waveportalContract.on NewPoints exec!");

              // Called when anyone changes the value
              store.addNotification({
                  title: "You won!",
                  message: `WOW! You earned ${_pointsEarned} of a total of ${_pointsTotal}. Check your wallet for a suprise!`,
                  type: "success",
                  container: "center",
                  insert: "top",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 0,
                    showIcon: true
                  }
                });

                //new Sound("wonPointsSound", wonPointsSound, 0.5).play();
            });

          }

        }
        else
        {
          console.log("No authorized accounts found...");

          store.addNotification({
            title: "Wallet required",
            message: "No authorized accounts found...",
            type: "warning",
            insert: "top",
            container: "top-full",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 0,
              showIcon: true
            }
          });

        }
      }
    )
  };



  const connectWallet = () =>
  {
    console.log("Connect Wallet exec start");
    const { ethereum } = window;
    if(!ethereum) displayNotification("Metamask required", "Bad news billy bears... You need to get metamask installed.", "danger");

    ethereum.request({ method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("Connected ", accounts[0]);
      displayNotification("Wallet connection", `Connect with ${accounts[0]}`, "success");
      setCurrentAccount(accounts[0]);
    })
    .catch(err => console.log(err));
    console.log("Connect Wallet exec finish");
  }

 const getRandomNumber = (min, max) =>
  {
    return Math.floor(Math.random() * (max - min) + min);
  };





  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

  const [allWaves, setAllWaves] = React.useState([]);
  async function getAllWaves()
  {
    console.log("call to async function getAllWaves");

    let waves = await waveportalContract.getAllWaves();
    if(!(waves!=null && waves.length>0))
      return;

    console.log("waves found!");

    let wavesCleaned = [];
    let wavesIdx = 0;
    waves.forEach(wave =>
    {

        let waveClean = {
         address: wave.userAddress,
         timestamp: new Date(wave.timestamp * 1000),
         message: wave.message
       };

       wavesCleaned.push(waveClean);

       console.log(wave.userAddress + " waved: "+waveClean.message);

       // IMPROVE: hardcoded to show the last 5 waves...
       if(wavesIdx++ >= waves.length-5)
       {
         store.addNotification({
           title: `Wave by ${waveClean.address}`,
           message: waveClean.message,
           type: "default",
           container: "bottom-full",
           insert: "top",
           animationIn: ["animate__animated", "animate__fadeIn"],
           animationOut: ["animate__animated", "animate__fadeOut"],
           dismiss: {
             duration: 0,
             showIcon: true
           }
         });
       }
    });
    setAllWaves(wavesCleaned);
  }

  let getTotalWaves = async () =>
  {
    let resTotalWaves = await waveportalContract.getTotalWaves();
    setTotalWaves(resTotalWaves.toNumber());
    console.log("Total waves: ", resTotalWaves);
  }



  const wave = async () =>
  {
    let miningSound = new Sound("drummingSound", drummingSound);
    let wavingSounds = [
        new Sound("flute1Sound", flute1Sound),
        new Sound("flute2Sound", flute2Sound)];

    try
    {
      setWaving(true);
      miningSound.play();

      waveTxn = await waveportalContract.wave(messageInput.current.value, { gasLimit: 300000 });
      console.log("Mining...", waveTxn.hash);

      let notificationId = store.addNotification({
          title: "Mining...",
          message: `Processing your transaction: ${waveTxn.hash}`,
          type: "info",
          insert: "top",
          container: "top-left",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"]
        });

      setWaveTxn(waveTxn);
      await waveTxn.wait();
      store.removeNotification(notificationId);

      displayNotification("Mined!", `Transaction mined succesfully: ${waveTxn.hash}`, "success");
      console.log("Mined...", waveTxn.hash);

      getTotalWaves();
    }
    catch(error)
    {
        displayNotification("Error!", error.message, "danger");
        console.error(error);
    }
    finally
    {
      if(miningSound!=null)
        miningSound.pause();

      let wavingSound = wavingSounds[getRandomNumber(0, wavingSounds.length)];
      if(wavingSound!=null)
        wavingSound.play();
      setWaving(false);
    }
  }



  React.useEffect( () => {
    console.log("React.useEffect running");
    checkIfWalletIsConnected();
    getTotalWaves();
    console.log("React.useEffect finish");
  }, []);

  return (
    <div className="appRoot">

      <ReactNotifications/>

      <div className="mainContainer">

        <div className="dataContainer">
          <div className="header">
          🐇 Can you find the w1ldrabb1t?
          </div>

          <div className="bio">
          The w1ldrabb1t got {totalWaves} waves from people who connected their Ethereum wallet for a chance to earn ETH!
          </div>

          { waving ?
            <div className="loading">
              <img src={loadingGIF} style={{width: "30%"}}/>
            </div>
            : null
          }

          { currAccount ?
          <div className="formContainer">
            <input type="text" className="msgTextInput" defaultValue="A message..." ref={messageInput}/>

            <button className="button-30" style={{ visibility: (!waving ? 'visible' : 'hidden') }} onClick={wave}>
              Wave
            </button>
          </div>
          : (

            <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
            </button>

          )}

          <div className="credits">
          Developed by <a href="https://www.linkedin.com/in/iambrunocoelho/">Bruno Coelho</a> following the course of the incredible folks at <a href="https://twitter.com/_buildspace">_buildspace</a>, so check <a href="https://buildspace.so/">https://buildspace.so/</a>
          </div>
        </div>
      </div>
    </div>
  );
}
