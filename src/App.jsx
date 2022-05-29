import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./BuymeABI.json";

function App() {
  const contractAddress = "0x8B351F10542a8870445F6d9B4c0540b05E128acF";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "saurabh",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const memos = await buyMeACoffee.getMemos();
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();
    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className="px-4 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 ">
      <div className="flex justify-between py-3 flex-wrap">
        <div className="flex items-center mt-3">
          <img src="https://img.icons8.com/external-tal-revivo-tritone-tal-revivo/50/000000/external-buy-me-a-coffee-help-creators-receive-support-from-their-audience-logo-tritone-tal-revivo.png" />
          <h1 className="pl-4 font-mono text-lg">Buy me a Coffee!</h1>
        </div>
        {currentAccount ? (
          <p className="w-44 truncate font-mono bg-blue-100 text-blue-700 px-4 pt-3 h-12 mt-3 font-medium rounded-xl">
            {currentAccount}
          </p>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 font-mono py-2 bg-blue-100 text-blue-700 font-medium rounded-xl mt-3"
          >
            Connect wallet
          </button>
        )}
      </div>
      <div className="">
        <main className="">
          {currentAccount ? (
            <div>
              <form>
                <div className="flex flex-wrap justify-center mt-8">
                  <div className="md:w-1/2 w-full mx-4 mt-4">
                    <label>
                      Name <span className="text-red-700">*</span>
                    </label>
                    <br />

                    <input
                      type="text"
                      required
                      placeholder="Saurabh"
                      onChange={onNameChange}
                      className="border border-gray-400 py-3 px-3 w-full mt-3 rounded-xl focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="md:w-1/2 w-full mx-4 mt-4">
                    <label>
                      Send Saurabh a message{" "}
                      <span className="text-red-700">*</span>
                    </label>
                    <br />

                    <textarea
                      rows={1}
                      placeholder="Enjoy your coffee!"
                      onChange={onMessageChange}
                      required
                      className="border border-gray-400 py-3 px-3 w-full mt-3 rounded-xl focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={buyCoffee}
                    className="px-4 py-3 bg-blue-100 text-blue-700 fomt-medium rounded-xl"
                  >
                    Send 1 Coffee for 0.001ETH
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-24">
              <p className="text-5xl py-8 font-semibold font-mono">
                Buy Saurabh a Coffee!!
              </p>
              <button
                onClick={connectWallet}
                className="p-4 bg-blue-100 text-blue-500 font-mono font-semibold  rounded-lg text-base"
              >
                {" "}
                Connect your wallet to send
              </button>
            </div>
          )}
        </main>

        {currentAccount && (
          <h1 className="text-center mt-12 mb-8 text-3xl text-blue-600 font-mono">
            Memos received
          </h1>
        )}
        <div className="flex flex-col md:flex-row ">
          {currentAccount &&
            memos.map((memo, idx) => {
              return (
                <div key={idx} className="p-5 border rounded-xl mx-4 mt-4">
                  <p className="font-bold text-lg py-3 font-mono">
                    "{memo.message}"
                  </p>
                  <p>
                    From:{" "}
                    <span className="text-blue-600 font-semibold">
                      {memo.name}
                    </span>{" "}
                    at {memo.timestamp.toString()}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
