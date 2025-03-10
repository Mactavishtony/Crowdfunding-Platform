import { useState, useContext, useEffect } from "react"
import { DisplayCampaigns } from "../components/displayCampaigns"
import { StateContext } from "../contexts"
import { ethers } from "ethers"

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

type UserStats = {
    totalCampaigns: number
    totalFundsRaised: string
    successRate: number
}

export function Profile() {
    const [isLoading, setIsLoading] = useState(false)
    const [campaigns, setCampaigns] = useState([] as ParsedCampaign[])
    const [userStats, setUserStats] = useState<UserStats>({
        totalCampaigns: 0,
        totalFundsRaised: '0',
        successRate: 0
    })

    const { address, contract, getUserCampaigns, searchCampaign } = useContext(StateContext)

    async function calculateUserStats(campaigns: ParsedCampaign[]) {
        const totalCampaigns = campaigns.length
        const totalFundsRaised = campaigns.reduce((acc, campaign) => {
            return acc + Number(campaign.amountCollected)
        }, 0)
        const successfulCampaigns = campaigns.filter(campaign => {
            return Number(campaign.amountCollected) >= Number(campaign.target)
        }).length
        const successRate = totalCampaigns > 0 ? (successfulCampaigns / totalCampaigns) * 100 : 0

        setUserStats({
            totalCampaigns,
            totalFundsRaised: totalFundsRaised.toFixed(4),
            successRate: Math.round(successRate)
        })
    }

    async function fetchCampaigns() {
        setIsLoading(true)
        const data = await getUserCampaigns()
        const filteredData = data.filter((campaign) => campaign.title.toLowerCase().includes(searchCampaign.toLowerCase()))
        setCampaigns(filteredData)
        await calculateUserStats(data)
        setIsLoading(false)
    }

    useEffect(() => {
        if (contract) {
            fetchCampaigns()
        }
    }, [address, contract, searchCampaign])

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1c1c24] p-6 rounded-lg hover:bg-[#2c2c36] transition-colors duration-300 transform hover:scale-105">
                    <h3 className="font-epilogue text-white text-xl mb-2">Total Campaigns</h3>
                    <p className="font-epilogue text-[#808191] text-3xl">{userStats.totalCampaigns}</p>
                </div>
                <div className="bg-[#1c1c24] p-6 rounded-lg hover:bg-[#2c2c36] transition-colors duration-300 transform hover:scale-105">
                    <h3 className="font-epilogue text-white text-xl mb-2">Total Funds Raised</h3>
                    <p className="font-epilogue text-[#808191] text-3xl">{userStats.totalFundsRaised} ETH</p>
                </div>
                <div className="bg-[#1c1c24] p-6 rounded-lg hover:bg-[#2c2c36] transition-colors duration-300 transform hover:scale-105">
                    <h3 className="font-epilogue text-white text-xl mb-2">Success Rate</h3>
                    <p className="font-epilogue text-[#808191] text-3xl">{userStats.successRate}%</p>
                </div>
            </div>

            <DisplayCampaigns
                title="Your Campaigns"
                isLoading={isLoading}
                campaigns={campaigns}
            />
        </div>
    )
}