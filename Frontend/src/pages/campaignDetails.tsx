import { useContext, useEffect, useState } from "react"
import { Location, useLocation } from "react-router-dom"
import { StateContext } from "../contexts"
import { calculateBarPercentage, daysLeft } from "../utils"
import { CountBox } from "../components/countBox"
import { thirdweb } from "../assets"
import { CustomButton } from "../components/customButton"
import { Loader } from "../components/loader"
import { toast } from "react-toastify"

type ParsedCampaign = {
    owner: string
    title: string
    description: string
    target: string
    deadline: number
    amountCollected: string
    image: string
    pId: string
}

type ParsedDonation = {
    donator: string
    donation: string
}

export function CampaignDetails() {

    const { state } = useLocation() as Location<ParsedCampaign>
    const { donate, getDonations, contract, address, getCampaigns } = useContext(StateContext)

    const [isLoading, setIsLoading] = useState(false)
    const [amount, setAmount] = useState('')
    const [donators, setDonators] = useState([] as ParsedDonation[])
    const [creatorCampaignCount, setCreatorCampaignCount] = useState(0)

    async function fetchCreatorCampaigns() {
        const data = await getCampaigns()
        const creatorCampaigns = data.filter((campaign: ParsedCampaign) => campaign.owner === state.owner)
        setCreatorCampaignCount(creatorCampaigns.length)
    }
    useEffect(() => {
        if (contract) {
            fetchDonators()
            fetchCreatorCampaigns()
        }
    }, [contract, address])
    const remainingDays = daysLeft(state.deadline)

    async function fetchDonators() {
        const data = await getDonations(state.pId)

        setDonators(data)
    }

    useEffect(() => {
        if (contract) {
            fetchDonators()
        }
    }, [contract, address])

    async function handleDonate() {
        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount")
            return
        }
        if (!address) {
            toast.error("Please connect your wallet first")
            return
        }
        setIsLoading(true)
        try {
            await donate(state.pId, amount)
            await fetchDonators()
            setAmount('')
            toast.success("Thank you for your donation!")
            setIsLoading(false)
        } catch (err) {
            console.log(err)
            toast.error("Failed to process donation")
            setIsLoading(false)
        }
    }

    return (
        <div>
            {isLoading && <Loader />}
            {!isLoading && (
                <>
                    <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
                        <div className="flex-1 flex-col">
                            <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" />
                            <div className="relative w-full h-[8px] bg-[#3a3a43] mt-4 rounded-full overflow-hidden">
                                <div className="absolute h-full bg-gradient-to-r from-[#4acd8d] to-[#2ecc71] transition-all duration-300 ease-in-out"
                                    style={{
                                        width: `${calculateBarPercentage(Number(state.target), Number(state.amountCollected))}%`,
                                        maxWidth: '100%'
                                    }} >
                                </div>
                            </div>
                            <div className="mt-2 text-right text-sm text-[#808191]">
                                {Number(state.amountCollected)} ETH of {Number(state.target)} ETH
                            </div>
                        </div>
                        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
                            <CountBox title="Days Left" value={remainingDays} />
                            <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
                            <CountBox title="Total Backers" value={donators.length} />
                        </div>
                    </div>
                    <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
                        <div className="flex-[2] flex flex-col gap-[40px]">
                            <div>
                                <h4 className="font-epilogue font-semibold text-[18px] text-white
                                    uppercase">
                                    Creator
                                </h4>
                                <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
                                    <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full
                                    bg-[#2c2f32] cursor-pointer">
                                        <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                                        <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">{creatorCampaignCount} Campaigns</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-epilogue font-semibold text-[18px] text-white
                                    uppercase">
                                    Story
                                </h4>
                                <div className="mt-[20px]">
                                    <p className="font-epilogue font-normal text-[16px] text-[#808191]
                                    leading-[26px] text-justify">
                                        {state.description}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-epilogue font-semibold text-[18px] text-white
                                    uppercase">
                                    Donators
                                </h4>
                                <div className="mt-[20px] flex flex-col gap-4">
                                    {donators.length > 0 && donators.map((donator, index) => (
                                        <div key={`${donator.donator}-${donator.donation}-${index}`}>
                                            <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd]
                                            leading-[26px] break-all">
                                                {index + 1}. {donator.donator}
                                            </p>
                                            <p className="font-epilogue font-normal text-[16px] text-[#808191]
                                            leading-[26px] break-all">
                                                {donator.donation}
                                            </p>
                                        </div>
                                    ))}
                                    {donators.length === 0 && <p className="font-epilogue font-normal text-[16px] text-[#808191]
                                    leading-[26px] text-justify">
                                        No donators yet. Be the first one.
                                    </p>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-epilogue font-semibold text-[18px] text-white
                                    uppercase">
                                Fund
                            </h4>
                            <div className="mt-[20px] flex flex-col p-6 bg-[#1c1c24] rounded-[10px] shadow-lg">
                                <p className="font-epilogue font-medium text-[24px] leading-[30px] text-center text-white mb-6">
                                    Fund the campaign
                                </p>
                                <div className="mt-[30px]">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            placeholder="ETH 0.1" 
                                            step="0.01" 
                                            className="w-full py-[12px] sm:px-[20px] px-[15px] outline-none border-2 border-[#3a3a43] focus:border-[#8c6dfd] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px] transition-all duration-300"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4b5264]">ETH</span>
                                    </div>
                                    <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px] border border-[#3a3a43]">
                                        <h4 className="font-epilogue font-semibold text-[16px] leading-[22px] text-white">
                                            Make a Difference
                                        </h4>
                                        <p className="mt-[12px] font-epilogue font-normal leading-[22px] text-[#808191]">
                                            Your contribution helps bring this project to life. Every donation counts!
                                        </p>
                                    </div>
                                    <CustomButton
                                        btnType="button"
                                        title={address ? "Fund Campaign" : "Connect Wallet to Donate"}
                                        styles={`w-full ${address ? 'bg-gradient-to-r from-[#8c6dfd] to-[#6c4ac7]' : 'bg-[#3a3a43]'} hover:opacity-90 transition-all duration-300 shadow-lg`}
                                        handleClick={handleDonate}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div >
    )
}